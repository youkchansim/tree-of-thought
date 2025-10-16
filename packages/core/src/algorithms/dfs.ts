/**
 * DFS (Depth-First Search) Algorithm for Tree of Thoughts
 */

import type {
  Thought,
  Evaluation,
  SearchResult,
  ToTArgs,
  TaskConfig,
} from '../types/index.js';
import { createSearchResult, extractPath } from '../types/index.js';
import { Evaluator } from '../evaluation/index.js';
import { createSelector } from '../selection/index.js';
import type { ThoughtGenerator } from './bfs.js';

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
   * Recursive DFS helper
   */
  async function dfsRecursive(
    currentThought: Thought | null,
    depth: number
  ): Promise<void> {
    // Depth limit check
    if (depth >= args.maxDepth) {
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

    // Early stopping check
    if (bestScore >= args.confidenceThreshold) {
      return;
    }

    // Select single best thought and continue
    const selectedIndices = selector.select(evaluations, newThoughts, 1);

    if (selectedIndices.length > 0) {
      const selected = newThoughts[selectedIndices[0]];
      await dfsRecursive(selected, depth + 1);
    }
  }

  // Start DFS
  await dfsRecursive(null, 0);

  if (!bestThought) {
    throw new Error('DFS failed to find any solution');
  }

  return createSearchResult({
    bestThought,
    path: extractPath(allThoughts, bestThought.id),
    allThoughts,
    evaluations: allEvaluations,
    metadata: {
      algorithm: 'DFS',
      stoppedEarly: bestScore >= args.confidenceThreshold,
      finalScore: bestScore,
    },
  });
}
