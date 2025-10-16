/**
 * Selection Algorithms for Tree of Thoughts
 *
 * Implements Princeton-aligned selection methods to choose top-k thoughts
 */

import type { Thought, Evaluation, ToTArgs } from '../types/index.js';

// ============================================================================
// Method 1: Greedy Selection
// ============================================================================

/**
 * Deterministically select top k thoughts with highest scores
 */
export function selectGreedy(
  evaluations: Evaluation[],
  nSelect: number
): number[] {
  // Sort indices by score (descending)
  const sortedIndices = evaluations
    .map((_, index) => index)
    .sort((a, b) => evaluations[b].overallScore - evaluations[a].overallScore);

  // Select top n
  return sortedIndices.slice(0, Math.min(nSelect, sortedIndices.length));
}

// ============================================================================
// Method 2: Sample Selection (Probability-based)
// ============================================================================

/**
 * Probability-based stochastic selection
 */
export function selectSample(
  evaluations: Evaluation[],
  nSelect: number,
  temperature: number = 1.0
): number[] {
  const scores = evaluations.map((e) => e.overallScore);

  // Handle negative values: shift minimum to 0
  const minScore = Math.min(...scores);
  const shiftedScores = scores.map((s) =>
    minScore < 0 ? s - minScore + 0.01 : s
  );

  // Temperature scaling
  const scaledScores = shiftedScores.map((s) => Math.pow(s, 1.0 / temperature));

  // Generate probability distribution
  const total = scaledScores.reduce((sum, s) => sum + s, 0);
  const probabilities =
    total === 0
      ? new Array(scores.length).fill(1 / scores.length)
      : scaledScores.map((s) => s / total);

  // Sample without replacement
  return weightedSampleWithoutReplacement(
    probabilities,
    Math.min(nSelect, scores.length)
  );
}

/**
 * Weighted sampling without replacement
 */
function weightedSampleWithoutReplacement(
  probabilities: number[],
  count: number
): number[] {
  const selected: number[] = [];
  const remainingProbs = [...probabilities];

  for (let i = 0; i < count; i++) {
    // Normalize remaining probabilities
    const total = remainingProbs.reduce((sum, p) => sum + p, 0);
    if (total === 0) break;

    const normalized = remainingProbs.map((p) => p / total);

    // Select one index
    const rand = Math.random();
    let cumulative = 0;
    let selectedIndex = 0;

    for (let j = 0; j < normalized.length; j++) {
      cumulative += normalized[j];
      if (rand <= cumulative) {
        selectedIndex = j;
        break;
      }
    }

    selected.push(selectedIndex);
    remainingProbs[selectedIndex] = 0; // Remove from pool
  }

  return selected;
}

// ============================================================================
// Method 3: Hybrid Selection (Model Diversity)
// ============================================================================

/**
 * Selection considering both score and model diversity
 */
export function selectHybrid(
  evaluations: Evaluation[],
  thoughts: Thought[],
  nSelect: number,
  diversityWeight: number = 0.3
): number[] {
  const scores = evaluations.map((e) => e.overallScore);

  // Normalize scores (0-1 range)
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore;
  const normalizedScores =
    range < 0.001
      ? scores.map(() => 0.5)
      : scores.map((s) => (s - minScore) / range);

  // Calculate model distribution
  const modelCounts: Record<string, number> = { claude: 0, codex: 0 };
  thoughts.forEach((t) => {
    modelCounts[t.model] = (modelCounts[t.model] || 0) + 1;
  });

  // Calculate diversity scores
  const diversityScores = thoughts.map((t) => {
    const count = modelCounts[t.model] || 1;
    return 1.0 / (count + 1);
  });

  // Normalize diversity scores
  const maxDiversity = Math.max(...diversityScores);
  const normalizedDiversity =
    maxDiversity === 0
      ? diversityScores.map(() => 0)
      : diversityScores.map((d) => d / maxDiversity);

  // Final scores: quality + diversity
  const finalScores = normalizedScores.map(
    (score, i) =>
      score * (1 - diversityWeight) + normalizedDiversity[i] * diversityWeight
  );

  // Greedy selection on final scores
  const sortedIndices = finalScores
    .map((_, index) => index)
    .sort((a, b) => finalScores[b] - finalScores[a]);

  return sortedIndices.slice(0, Math.min(nSelect, sortedIndices.length));
}

// ============================================================================
// Method 4: Threshold-Based Selection
// ============================================================================

/**
 * Select only thoughts above threshold
 */
export function selectThreshold(
  evaluations: Evaluation[],
  threshold: number = 7.0,
  maxSelect: number = 5
): number[] {
  // Find indices above threshold
  const qualifiedIndices = evaluations
    .map((e, index) => ({ index, score: e.overallScore }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.index);

  // Limit count
  if (qualifiedIndices.length > maxSelect) {
    return qualifiedIndices.slice(0, maxSelect);
  }

  // If none qualified, select at least the best one
  if (qualifiedIndices.length === 0) {
    const bestIndex = evaluations.reduce(
      (maxIdx, e, idx, arr) =>
        e.overallScore > arr[maxIdx].overallScore ? idx : maxIdx,
      0
    );
    return [bestIndex];
  }

  return qualifiedIndices;
}

/**
 * Adaptive threshold based on percentile
 */
export function selectAdaptiveThreshold(
  evaluations: Evaluation[],
  percentile: number = 70,
  maxSelect: number = 5
): number[] {
  const scores = evaluations.map((e) => e.overallScore);
  const sortedScores = [...scores].sort((a, b) => a - b);
  const index = Math.floor((sortedScores.length * percentile) / 100);
  const threshold = sortedScores[index] || 0;

  return selectThreshold(evaluations, threshold, maxSelect);
}

// ============================================================================
// Method 5: Ensemble Selection
// ============================================================================

/**
 * Combine results from multiple selection methods
 */
export function selectEnsemble(
  evaluations: Evaluation[],
  thoughts: Thought[],
  nSelect: number
): number[] {
  const scores = evaluations.map((e) => e.overallScore);

  // Select with each method
  const greedySet = new Set(selectGreedy(evaluations, nSelect));
  const sampleSet = new Set(selectSample(evaluations, nSelect));
  const hybridSet = new Set(selectHybrid(evaluations, thoughts, nSelect));

  // Intersection (selected by all methods)
  const intersection = [...greedySet].filter(
    (i) => sampleSet.has(i) && hybridSet.has(i)
  );

  // Selected by 2 methods
  const twoWay = new Set<number>();
  [...greedySet].forEach((i) => {
    if (sampleSet.has(i) || hybridSet.has(i)) twoWay.add(i);
  });
  [...sampleSet].forEach((i) => {
    if (greedySet.has(i) || hybridSet.has(i)) twoWay.add(i);
  });

  // Priority: intersection > 2-way > by score
  const finalSelected = [...intersection];

  if (finalSelected.length < nSelect) {
    const remaining = [...twoWay].filter((i) => !finalSelected.includes(i));
    finalSelected.push(...remaining);
  }

  if (finalSelected.length < nSelect) {
    // Fill with highest scores
    const allUnion = new Set([...greedySet, ...sampleSet, ...hybridSet]);
    const remaining = [...allUnion]
      .filter((i) => !finalSelected.includes(i))
      .sort((a, b) => scores[b] - scores[a]);

    finalSelected.push(...remaining);
  }

  return finalSelected.slice(0, nSelect);
}

// ============================================================================
// Method 6: Model-Aware Selection
// ============================================================================

export interface ModelPreference {
  claude: number;
  codex: number;
}

/**
 * Adjust model preference based on problem type
 */
export function selectModelAware(
  evaluations: Evaluation[],
  thoughts: Thought[],
  nSelect: number,
  problemType: 'debug' | 'refactor' | 'design' | 'custom'
): number[] {
  const modelPreferences: Record<string, ModelPreference> = {
    debug: { claude: 0.6, codex: 0.4 }, // Claude priority (practicality)
    refactor: { claude: 0.5, codex: 0.5 }, // Balanced
    design: { claude: 0.4, codex: 0.6 }, // Codex priority (technical)
    custom: { claude: 0.5, codex: 0.5 },
  };

  const preference = modelPreferences[problemType] || { claude: 0.5, codex: 0.5 };

  // Calculate selection count per model
  const nClaude = Math.round(nSelect * preference.claude);
  const nCodex = nSelect - nClaude;

  // Separate by model
  const claudeThoughts = evaluations
    .map((e, i) => ({ index: i, score: e.overallScore }))
    .filter((item) => thoughts[item.index].model === 'claude')
    .sort((a, b) => b.score - a.score);

  const codexThoughts = evaluations
    .map((e, i) => ({ index: i, score: e.overallScore }))
    .filter((item) => thoughts[item.index].model === 'codex')
    .sort((a, b) => b.score - a.score);

  // Select top n from each model
  const selected: number[] = [];
  selected.push(...claudeThoughts.slice(0, nClaude).map((t) => t.index));
  selected.push(...codexThoughts.slice(0, nCodex).map((t) => t.index));

  return selected;
}

// ============================================================================
// Unified Selector Class
// ============================================================================

export type SelectionMethod =
  | 'greedy'
  | 'sample'
  | 'hybrid'
  | 'threshold'
  | 'ensemble';

export interface SelectorOptions {
  temperature?: number;
  diversityWeight?: number;
  threshold?: number;
  maxSelect?: number;
  percentile?: number;
}

export class Selector {
  constructor(
    private method: SelectionMethod = 'greedy',
    private options: SelectorOptions = {}
  ) {}

  /**
   * Select top-k thoughts
   */
  select(
    evaluations: Evaluation[],
    thoughts: Thought[],
    nSelect: number
  ): number[] {
    switch (this.method) {
      case 'greedy':
        return selectGreedy(evaluations, nSelect);

      case 'sample':
        return selectSample(
          evaluations,
          nSelect,
          this.options.temperature ?? 1.0
        );

      case 'hybrid':
        return selectHybrid(
          evaluations,
          thoughts,
          nSelect,
          this.options.diversityWeight ?? 0.3
        );

      case 'threshold':
        return selectThreshold(
          evaluations,
          this.options.threshold ?? 7.0,
          this.options.maxSelect ?? nSelect
        );

      case 'ensemble':
        return selectEnsemble(evaluations, thoughts, nSelect);

      default:
        throw new Error(`Unknown selection method: ${this.method}`);
    }
  }

  /**
   * Select with model awareness
   */
  selectWithModelAwareness(
    evaluations: Evaluation[],
    thoughts: Thought[],
    nSelect: number,
    problemType: 'debug' | 'refactor' | 'design' | 'custom'
  ): number[] {
    return selectModelAware(evaluations, thoughts, nSelect, problemType);
  }
}

/**
 * Create selector from ToTArgs
 */
export function createSelector(args: ToTArgs): Selector {
  const options: SelectorOptions = {
    temperature: 0.7,
    diversityWeight: 0.3,
    threshold: args.confidenceThreshold,
  };

  return new Selector(args.methodSelect as SelectionMethod, options);
}
