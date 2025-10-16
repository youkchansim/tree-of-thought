/**
 * BFS (Breadth-First Search) Algorithm for Tree of Thoughts
 */

import type {
  Thought,
  Evaluation,
  SearchResult,
  ToTArgs,
  TaskConfig,
} from '../types/index.js';
import {
  createThought,
  createSearchResult,
  extractPath,
  getClaudeCount,
  getCodexCount,
} from '../types/index.js';
import { Evaluator } from '../evaluation/index.js';
import { createSelector } from '../selection/index.js';

export interface ThoughtGenerator {
  generate(
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]>;
}

/**
 * Execute BFS search
 */
export async function executeBFS(
  problem: string,
  config: TaskConfig,
  generator: ThoughtGenerator
): Promise<SearchResult> {
  const args = config.defaultArgs;
  const allThoughts: Thought[] = [];
  const allEvaluations: Record<string, Evaluation> = {};

  // Create evaluator and selector
  const evaluator = new Evaluator(args.methodEvaluate, true);
  const selector = createSelector(args);

  // Level 0: Start with empty root
  let currentThoughts: Thought[] = [];
  let currentDepth = 0;

  // Main BFS loop
  for (let step = 0; step < Math.min(config.steps, args.maxDepth); step++) {
    currentDepth = step;

    // Step 1: Generate thoughts
    const newThoughts = await generator.generate(
      problem,
      currentThoughts,
      currentDepth,
      args
    );

    allThoughts.push(...newThoughts);

    // Step 2: Evaluate thoughts
    const evaluations = await evaluator.evaluate(problem, newThoughts, args);

    evaluations.forEach((ev) => {
      allEvaluations[ev.thoughtId] = ev;
    });

    // Step 3: Select top-k thoughts
    const selectedIndices = selector.select(
      evaluations,
      newThoughts,
      args.nSelect
    );

    const selectedThoughts = selectedIndices.map((i) => newThoughts[i]);

    // Step 4: Check early stopping
    const bestScore = Math.max(...evaluations.map((e) => e.overallScore));
    if (bestScore >= args.confidenceThreshold) {
      // Found sufficiently good solution
      const bestIndex = evaluations.findIndex(
        (e) => e.overallScore === bestScore
      );
      const bestThought = newThoughts[bestIndex];

      return createSearchResult({
        bestThought,
        path: extractPath(allThoughts, bestThought.id),
        allThoughts,
        evaluations: allEvaluations,
        metadata: {
          algorithm: 'BFS',
          stoppedEarly: true,
          finalDepth: currentDepth,
        },
      });
    }

    // Prepare for next level
    currentThoughts = selectedThoughts;
  }

  // No early stopping - return best from final level
  const finalEvaluations = currentThoughts.map(
    (t) => allEvaluations[t.id]
  );
  const bestScore = Math.max(...finalEvaluations.map((e) => e.overallScore));
  const bestThought = currentThoughts[
    finalEvaluations.findIndex((e) => e.overallScore === bestScore)
  ];

  return createSearchResult({
    bestThought,
    path: extractPath(allThoughts, bestThought.id),
    allThoughts,
    evaluations: allEvaluations,
    metadata: {
      algorithm: 'BFS',
      stoppedEarly: false,
      finalDepth: currentDepth,
    },
  });
}
