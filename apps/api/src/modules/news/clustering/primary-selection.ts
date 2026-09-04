/**
 * Chooses which article in a story cluster is shown as the representative
 * card, per the spec's "the frontend should normally show the primary
 * article rather than five duplicate cards" requirement. All member
 * articles stay stored (`news_story_cluster_articles`); this only decides
 * which one `news_story_clusters.primaryArticleId` points at.
 */

export interface ArticleForPrimarySelection {
  id: string;
  headline: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  sourceId: string;
  /** Lower is better, mirroring `news_sources.priority` ("lower sorts first"). */
  sourcePriority: number;
  /** 0 to 1. */
  sourceTrustScore: number;
}

/**
 * Points awarded per criterion. All are additive into one score in roughly
 * [0, 4.5]; the article with the highest total wins, ties broken by
 * `publishedAt` (earliest wins - the article that broke the story first),
 * then by `id` (stable, deterministic final tie-break for genuinely
 * simultaneous, equally-complete articles).
 *
 *   - source trust score contributes directly, weighted (0 to
 *     SOURCE_TRUST_WEIGHT points): the spec's "source trust score" factor.
 *   - source priority contributes an inverted, normalised bonus (0 to
 *     SOURCE_PRIORITY_WEIGHT points): lower `priority` is better, so a
 *     source at priority 0 scores the full weight and the score decays
 *     toward 0 as priority grows, floored at 0 rather than going negative
 *     for a very low-priority source.
 *   - completeness: SUMMARY_BONUS if `summary` is non-empty, since a source
 *     whose terms/feed give us a real summary is more useful to lead with.
 *   - image availability: IMAGE_BONUS if `imageUrl` is present.
 *
 * "Overall content quality" beyond completeness/image is not separately
 * scored in v1: nothing in the stored schema captures prose quality, and
 * inventing a proxy (e.g. summary length) would be exactly the kind of
 * fabricated signal the spec's "transparent configurable" framing warns
 * against. Completeness (has a summary, has an image) is the honest,
 * available proxy for "how much this article gives a reader" and is kept
 * separate from source trust/priority so a low-priority source with a
 * genuinely fuller article can still win.
 */
const SOURCE_TRUST_WEIGHT = 2;
const SOURCE_PRIORITY_WEIGHT = 1.5;
/** Priority values above this are treated as scoring 0 on the priority axis, rather than going negative. */
const SOURCE_PRIORITY_FLOOR = 200;
const SUMMARY_BONUS = 0.6;
const IMAGE_BONUS = 0.4;

function scoreArticle(article: ArticleForPrimarySelection): number {
  const trustPoints = article.sourceTrustScore * SOURCE_TRUST_WEIGHT;

  const priorityFraction = Math.max(0, 1 - article.sourcePriority / SOURCE_PRIORITY_FLOOR);
  const priorityPoints = priorityFraction * SOURCE_PRIORITY_WEIGHT;

  const completenessPoints =
    (article.summary && article.summary.trim().length > 0 ? SUMMARY_BONUS : 0) +
    (article.imageUrl ? IMAGE_BONUS : 0);

  return trustPoints + priorityPoints + completenessPoints;
}

/**
 * Selects the best representative article from a cluster's members.
 * Deterministic: same input list always yields the same choice, in any
 * order, which is what makes re-running primary selection after a new
 * article joins safe to do unconditionally (see `ClusteringService`).
 */
export function selectPrimaryArticle(
  articles: ArticleForPrimarySelection[],
): ArticleForPrimarySelection {
  if (articles.length === 0) {
    throw new Error('selectPrimaryArticle: cannot select from an empty article list');
  }

  let best: ArticleForPrimarySelection = articles[0]!;
  let bestScore = scoreArticle(best);

  for (const article of articles.slice(1)) {
    const score = scoreArticle(article);

    const better =
      score > bestScore ||
      (score === bestScore && article.publishedAt.getTime() < best.publishedAt.getTime()) ||
      (score === bestScore &&
        article.publishedAt.getTime() === best.publishedAt.getTime() &&
        article.id < best.id);

    if (better) {
      best = article;
      bestScore = score;
    }
  }

  return best;
}
