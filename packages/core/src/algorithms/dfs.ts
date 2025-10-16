/**
 * DFS (Depth-First Search) Algorithm for Tree of Thoughts
 *
 * Features:
 * - Depth-first exploration with backtracking
 * - Memory efficient (explores one path at a time)
 * - Early stopping when confidence threshold is met
 * - Tracks best solution across all explored paths
 */

import type {
  Thought,
  Evaluation,
  SearchResult,
  TaskConfig,
} from '../types/index.js';
import { createSearchResult, extractPath } from '../types/index.js';
import { Evaluator } from '../evaluation/index.js';
import { createSelector } from '../selection/index.js';
import type { ThoughtGenerator } from '../generators/index.js';

/**
 * Execute DFS search
 */
export async function executeDFS(
  problem: string,
  config: TaskConfig,
  generator: ThoughtGenerator
): Promise<SearchResult> {
  const args = config.defaultArgs;
  const allThoughts: Thought[] = [];
  const allEvaluations: Record<string, Evaluation> = {};

  const evaluator = new Evaluator(args.methodEvaluate, true);
  const selector = createSelector(args);

  let bestThought: Thought | null = null;
  let bestScore = -Infinity;

  /**
   * Recursive DFS helper with backtracking
   */
  async function dfsRecursive(
    currentThought: Thought | null,
    depth: number
  ): Promise<void> {
    // Depth limit check
    if (depth >= args.maxDepth) {
      return;
    }

    // Early stopping check (global)
    if (bestScore >= args.confidenceThreshold) {
      return;
    }

    // Generate thoughts
    const currentThoughts = currentThought ? [currentThought] : [];
    const newThoughts = await generator.generate(
      problem,
      currentThoughts,
      depth,
      args
    );

    allThoughts.push(...newThoughts);

    // Evaluate
    const evaluations = await evaluator.evaluate(problem, newThoughts, args);

    evaluations.forEach((ev) => {
      allEvaluations[ev.thoughtId] = ev;

      // Update best
      if (ev.overallScore > bestScore) {
        bestScore = ev.overallScore;
        bestThought = newThoughts.find((t) => t.id === ev.thoughtId) || null;
      }
    });

    // Early stopping check (after evaluation)
    if (bestScore >= args.confidenceThreshold) {
      return;
    }

    // Select top-k thoughts for exploration (backtracking)
    // Use nSelect to determine how many branches to explore
    const selectedIndices = selector.select(
      evaluations,
      newThoughts,
      Math.min(args.nSelect, newThoughts.length)
    );

    // Explore each selected thought (backtracking happens automatically)
    for (const index of selectedIndices) {
      const selected = newThoughts[index];

      // Early stopping check before diving deeper
      if (bestScore >= args.confidenceThreshold) {
        return;
      }

      await dfsRecursive(selected, depth + 1);
    }
  }

  // Start DFS
  await dfsRecursive(null, 0);

  if (!bestThought) {
    throw new Error('DFS failed to find any solution');
  }

  // TypeScript type narrowing after null check
  const finalThought: Thought = bestThought;

  return createSearchResult({
    bestThought: finalThought,
    path: extractPath(allThoughts, finalThought.id),
    allThoughts,
    evaluations: allEvaluations,
    metadata: {
      algorithm: 'DFS',
      stoppedEarly: bestScore >= args.confidenceThreshold,
      finalScore: bestScore,
    },
  });
}
