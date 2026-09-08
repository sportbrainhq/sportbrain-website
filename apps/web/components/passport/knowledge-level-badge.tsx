import type { KnowledgeLevel } from '@sportbrain/contracts';
import { cn } from '@/lib/utils';

/**
 * Text is always shown alongside colour (Part 78/82): level information
 * must never rely on colour alone. Restrained palette on purpose — Passport
 * should read as credible/professional, not game-badge bright (Part 77).
 */
const LEVEL_STYLES: Record<KnowledgeLevel, string> = {
  UNRATED: 'bg-muted text-muted-foreground',
  NEWCOMER: 'bg-muted text-foreground',
  EXPLORER: 'bg-secondary text-secondary-foreground',
  KNOWLEDGEABLE: 'bg-primary/10 text-primary',
  ADVANCED: 'bg-primary/20 text-primary',
  EXPERT: 'bg-primary text-primary-foreground',
};

export function KnowledgeLevelBadge({
  level,
  className,
}: {
  level: KnowledgeLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        LEVEL_STYLES[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
