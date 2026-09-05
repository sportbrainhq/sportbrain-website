import { Injectable } from '@nestjs/common';
import type {
  CreateQuestionRequest,
  QuestionCategory,
  QuestionValidationResult,
  ValidationCheck,
} from '@sportbrain/contracts';
import { CATEGORY_BY_SPORT } from '@sportbrain/contracts';
import { computeQuestionFingerprint, normalizeQuestionText } from './question-fingerprint';
import { QuestionsRepository } from './questions.repository';

/**
 * The validation pipeline every question passes through, manual or generated
 * (Part 18, Part 21: "manual creation is not exempt from duplicate
 * detection"). Phase C1 implements the checks that don't depend on the
 * generation pipeline; two (source validator's "required for generated
 * candidates" branch, and the semantic-similarity upgrade to the fact
 * duplicate check) are stubbed with a clear extension point rather than
 * built now, since there is nothing generating candidates yet.
 *
 * Each validator contributes zero or more `ValidationCheck`s. The overall
 * `severity` is the worst of its checks: any `FAIL` fails the whole result,
 * otherwise any `WARN` warns, otherwise `PASS`. Callers decide what to do
 * with `WARN` — Part 18 lets warnings proceed to editorial review for
 * generated candidates; manual creation (this phase's only write path) is
 * configured strict, so `WARN` blocks the same as `FAIL` there.
 */
@Injectable()
export class QuestionValidationService {
  constructor(private readonly repository: QuestionsRepository) {}

  async validate(
    input: CreateQuestionRequest,
    sportSlug: string,
  ): Promise<QuestionValidationResult> {
    const checks: ValidationCheck[] = [];

    checks.push(...this.validateSchema(input, sportSlug));
    checks.push(...this.validateCorrectAnswer(input));
    checks.push(...this.validateOptionUniqueness(input));
    checks.push(...this.validateLanguageQuality(input));
    checks.push(...this.validateTimeSensitivity(input));

    const normalizedQuestionText = normalizeQuestionText(input.questionText);
    const duplicate = await this.checkExactDuplicate(input.sportId, normalizedQuestionText);
    if (duplicate.outcome === 'EXACT_DUPLICATE') {
      checks.push({
        validator: 'exact_duplicate',
        severity: 'FAIL',
        message: `Identical question already exists (${duplicate.duplicateQuestionCode}).`,
      });
    }

    const factDuplicateChecks = await this.checkFactDuplicate(input.sportId, input.factKey ?? null);
    checks.push(...factDuplicateChecks);

    const severity = checks.some((check) => check.severity === 'FAIL')
      ? 'FAIL'
      : checks.some((check) => check.severity === 'WARN')
        ? 'WARN'
        : 'PASS';

    return { severity, checks, duplicate };
  }

  /** SHA-256(sportId + normalizedText), and whether a row with that fingerprint already exists. Exposed for reuse by `checkDuplicate` (the standalone pre-flight endpoint). */
  async checkExactDuplicate(
    sportId: string,
    normalizedQuestionText: string,
  ): Promise<QuestionValidationResult['duplicate']> {
    const fingerprint = computeQuestionFingerprint(sportId, normalizedQuestionText);
    const existing = await this.repository.findByFingerprint(fingerprint);
    if (existing) {
      return {
        outcome: 'EXACT_DUPLICATE',
        duplicateQuestionId: existing.id,
        duplicateQuestionCode: existing.questionCode,
        confidence: 1,
      };
    }
    return {
      outcome: 'NO_DUPLICATE',
      duplicateQuestionId: null,
      duplicateQuestionCode: null,
      confidence: null,
    };
  }

  /**
   * 1. SCHEMA VALIDATOR — the request shape is already enforced by
   * `createQuestionRequestSchema` (four options, non-empty text) before this
   * runs; what's left to check here is what Zod's shape rules can't express:
   * whether `category` actually belongs to `sportId`'s sport.
   */
  private validateSchema(input: CreateQuestionRequest, sportSlug: string): ValidationCheck[] {
    const checks: ValidationCheck[] = [];
    const allowedCategories = CATEGORY_BY_SPORT[sportSlug];
    if (allowedCategories && !allowedCategories.includes(input.category as QuestionCategory)) {
      checks.push({
        validator: 'schema',
        severity: 'FAIL',
        message: `Category "${input.category}" is not part of the taxonomy for "${sportSlug}".`,
      });
    }
    if (input.validFrom && input.validUntil && input.validFrom >= input.validUntil) {
      checks.push({
        validator: 'schema',
        severity: 'FAIL',
        message: 'validFrom must be before validUntil.',
      });
    }
    return checks;
  }

  /** 5. CORRECT ANSWER VALIDATOR — exactly one option marked correct. */
  private validateCorrectAnswer(input: CreateQuestionRequest): ValidationCheck[] {
    const correctCount = input.options.filter((option) => option.isCorrect).length;
    if (correctCount === 0) {
      return [
        { validator: 'correct_answer', severity: 'FAIL', message: 'No option is marked correct.' },
      ];
    }
    if (correctCount > 1) {
      return [
        {
          validator: 'correct_answer',
          severity: 'FAIL',
          message: `${correctCount} options are marked correct; exactly one is required.`,
        },
      ];
    }
    return [];
  }

  /** 4. OPTION UNIQUENESS — no duplicate option text (case/whitespace-insensitive), no blank options. */
  private validateOptionUniqueness(input: CreateQuestionRequest): ValidationCheck[] {
    const checks: ValidationCheck[] = [];
    const seen = new Set<string>();
    for (const option of input.options) {
      const normalized = normalizeQuestionText(option.optionText);
      if (normalized.length === 0) {
        checks.push({
          validator: 'option_uniqueness',
          severity: 'FAIL',
          message: 'An option is blank.',
        });
        continue;
      }
      if (seen.has(normalized)) {
        checks.push({
          validator: 'option_uniqueness',
          severity: 'FAIL',
          message: `Duplicate option text: "${option.optionText}".`,
        });
      }
      seen.add(normalized);
    }
    return checks;
  }

  /**
   * 8. LANGUAGE QUALITY VALIDATOR — the checks that don't need an LLM:
   * malformed/too-short text, answer leakage (the correct answer appearing
   * verbatim inside the question), broken punctuation. Kept deliberately
   * conservative (WARN, not FAIL) because these are heuristics, not proofs.
   */
  private validateLanguageQuality(input: CreateQuestionRequest): ValidationCheck[] {
    const checks: ValidationCheck[] = [];
    const questionLower = input.questionText.toLowerCase();

    const correctOption = input.options.find((option) => option.isCorrect);
    if (correctOption && correctOption.optionText.trim().length > 2) {
      const answerLower = correctOption.optionText.toLowerCase().trim();
      if (questionLower.includes(answerLower)) {
        checks.push({
          validator: 'language_quality',
          severity: 'WARN',
          message:
            'The correct answer appears verbatim in the question text (possible answer leakage).',
        });
      }
    }

    if (/\s{2,}/.test(input.questionText) || /[.,!?]{2,}/.test(input.questionText)) {
      checks.push({
        validator: 'language_quality',
        severity: 'WARN',
        message: 'Question text contains irregular spacing or repeated punctuation.',
      });
    }

    if (!input.questionText.trim().endsWith('?')) {
      checks.push({
        validator: 'language_quality',
        severity: 'WARN',
        message: 'Question text does not end with a question mark.',
      });
    }

    return checks;
  }

  /**
   * 6. TIME-SENSITIVITY VALIDATOR — flags unstable wording ("current",
   * "latest", "now", "today") unless the question declares explicit
   * `validFrom`/`validUntil` bounds, per Part 9.
   */
  private validateTimeSensitivity(input: CreateQuestionRequest): ValidationCheck[] {
    const unstableTerms = ['current', 'currently', 'today', 'now', 'latest', 'this year'];
    const questionLower = input.questionText.toLowerCase();
    const hasUnstableWording = unstableTerms.some((term) => questionLower.includes(term));
    const hasExplicitValidity = Boolean(input.validFrom || input.validUntil);

    if (hasUnstableWording && !hasExplicitValidity) {
      return [
        {
          validator: 'time_sensitivity',
          severity: 'WARN',
          message:
            'Question text uses time-relative wording ("current"/"latest"/"today") without validFrom/validUntil. Prefer wording tied to a specific season or date.',
        },
      ];
    }
    return [];
  }

  /**
   * 3. FACT DUPLICATE VALIDATOR — Part 7.2. A shared `factKey` never blocks
   * outright (a reviewer may legitimately keep an intentional variant); it
   * surfaces as `WARN` so the caller can decide, and the caller's
   * `duplicate` field in the result is left for the exact-duplicate case
   * only. A dedicated `SEMANTIC_DUPLICATE`/`POTENTIAL_VARIANT` classification
   * from embeddings is architecture Part 18 explicitly defers ("can use
   * embeddings/semantic similarity later. Architecture should allow this
   * without redesign.") — this method is the extension point: a semantic
   * similarity score would slot in here alongside the `factKey` lookup,
   * feeding the same `checks` array with the same three severities.
   */
  private async checkFactDuplicate(
    _sportId: string,
    factKey: string | null,
  ): Promise<ValidationCheck[]> {
    if (!factKey) return [];
    const matches = await this.repository.findByFactKey(factKey);
    if (matches.length === 0) return [];
    const codes = matches.map((match) => match.questionCode).join(', ');
    return [
      {
        validator: 'fact_duplicate',
        severity: 'WARN',
        message: `${matches.length} existing question(s) share factKey "${factKey}": ${codes}. Confirm this is an intentional variant.`,
      },
    ];
  }
}
