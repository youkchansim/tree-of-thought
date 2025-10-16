/**
 * Evaluation Functions for Tree of Thoughts
 *
 * Implements Princeton-aligned evaluation methods:
 * - Value: Independent evaluation of individual thoughts
 * - Vote: Comparative evaluation using ranking
 * - Hybrid: Cross-evaluation by Claude + OpenAI
 */

import type { Thought, Evaluation, ToTArgs } from '../types/index.js';
import { createEvaluation } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

export interface EvaluationCache {
  [key: string]: {
    value: number;
    timestamp: number;
  };
}

export interface ValueEvaluationResult {
  score: number;
  rawScores: number[];
  confidence: number;
}

export interface HybridValueResult {
  score: number;
  claudeScore: number;
  openaiScore: number;
  agreement: number;
  details: {
    claudeScores: number[];
    openaiScores: number[];
  };
}

export interface VoteResult {
  scores: number[];
  rankings: number[][];
}

export interface HybridVoteResult {
  scores: number[];
  claudeScores: number[];
  openaiScores: number[];
  consensus: number;
}

// ============================================================================
// Cache Implementation
// ============================================================================

const globalCache: EvaluationCache = {};

/**
 * Generate cache key from problem and thought
 */
export function generateCacheKey(problem: string, thought: Thought): string {
  return `${problem}::${thought.text}`;
}

/**
 * Get cached evaluation result
 */
export function getCachedValue(
  cacheKey: string,
  ttl: number = 3600
): number | null {
  const cached = globalCache[cacheKey];

  if (!cached) {
    return null;
  }

  // Check expiration
  const now = Date.now();
  if (now - cached.timestamp > ttl * 1000) {
    delete globalCache[cacheKey];
    return null;
  }

  return cached.value;
}

/**
 * Set cached evaluation result
 */
export function setCachedValue(cacheKey: string, value: number): void {
  globalCache[cacheKey] = {
    value,
    timestamp: Date.now(),
  };
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  Object.keys(globalCache).forEach((key) => delete globalCache[key]);
}

// ============================================================================
// Method 1: Value Evaluation
// ============================================================================

/**
 * Evaluate a single thought (abstract - requires AI model integration)
 *
 * This is a placeholder that should be implemented with actual AI model calls
 * For testing, falls back to mock implementation
 */
export async function evaluateSingleThought(
  problem: string,
  thought: Thought,
  evaluatorModel: 'claude' | 'openai'
): Promise<number> {
  // TODO: Implement actual AI model call
  // For now, use mock implementation for testing
  const { mockEvaluateSingleThought } = await import('./mock.js');
  return mockEvaluateSingleThought(
    problem,
    thought.text,
    thought.model,
    thought.depth,
    evaluatorModel
  );
}

/**
 * Get value score for a single thought
 */
export async function getValue(
  problem: string,
  thought: Thought,
  nEvaluate: number,
  useCache: boolean = true
): Promise<ValueEvaluationResult> {
  // Check cache
  const cacheKey = generateCacheKey(problem, thought);
  if (useCache) {
    const cached = getCachedValue(cacheKey);
    if (cached !== null) {
      return {
        score: cached,
        rawScores: [cached],
        confidence: 0.8, // Default confidence for cached values
      };
    }
  }

  // Perform n evaluations
  const scores: number[] = [];
  for (let i = 0; i < nEvaluate; i++) {
    // Determine evaluator (for hybrid mode)
    const evaluator = thought.model === 'claude' ? 'openai' : 'claude';
    const score = await evaluateSingleThought(problem, thought, evaluator);
    scores.push(score);
  }

  // Calculate average
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  // Calculate confidence
  const confidence = calculateConfidenceFromScores(scores);

  // Save to cache
  if (useCache) {
    setCachedValue(cacheKey, avgScore);
  }

  return {
    score: avgScore,
    rawScores: scores,
    confidence,
  };
}

/**
 * Batch evaluation of multiple thoughts
 */
export async function getValues(
  problem: string,
  thoughts: Thought[],
  nEvaluate: number,
  useCache: boolean = true
): Promise<ValueEvaluationResult[]> {
  // Remove duplicates (local caching)
  const uniqueThoughts = new Map<string, Thought>();
  const thoughtToIndex = new Map<number, string>();

  thoughts.forEach((thought, index) => {
    const key = thought.text;
    if (!uniqueThoughts.has(key)) {
      uniqueThoughts.set(key, thought);
    }
    thoughtToIndex.set(index, key);
  });

  // Evaluate unique thoughts
  const uniqueResults = new Map<string, ValueEvaluationResult>();
  for (const [key, thought] of uniqueThoughts) {
    const result = await getValue(problem, thought, nEvaluate, useCache);
    uniqueResults.set(key, result);
  }

  // Restore to original order
  const results: ValueEvaluationResult[] = [];
  for (let i = 0; i < thoughts.length; i++) {
    const key = thoughtToIndex.get(i)!;
    results.push(uniqueResults.get(key)!);
  }

  return results;
}

/**
 * Hybrid value evaluation (Claude + OpenAI cross-evaluation)
 */
export async function getValueHybrid(
  problem: string,
  thought: Thought,
  nEvaluate: number
): Promise<HybridValueResult> {
  const claudeScores: number[] = [];
  const openaiScores: number[] = [];

  // Claude evaluation
  for (let i = 0; i < nEvaluate; i++) {
    const score = await evaluateSingleThought(problem, thought, 'claude');
    claudeScores.push(score);
  }
  const claudeAvg =
    claudeScores.reduce((sum, s) => sum + s, 0) / claudeScores.length;

  // OpenAI evaluation
  for (let i = 0; i < nEvaluate; i++) {
    const score = await evaluateSingleThought(problem, thought, 'openai');
    openaiScores.push(score);
  }
  const openaiAvg =
    openaiScores.reduce((sum, s) => sum + s, 0) / openaiScores.length;

  // Calculate agreement
  const agreement =
    1.0 - Math.abs(claudeAvg - openaiAvg) / Math.max(claudeAvg, openaiAvg, 1.0);

  // Weighted average based on agreement
  let finalScore: number;
  if (agreement > 0.8) {
    // High agreement → average
    finalScore = (claudeAvg + openaiAvg) / 2;
  } else {
    // Low agreement → more conservative score
    finalScore = Math.min(claudeAvg, openaiAvg);
  }

  return {
    score: finalScore,
    claudeScore: claudeAvg,
    openaiScore: openaiAvg,
    agreement,
    details: {
      claudeScores,
      openaiScores,
    },
  };
}

// ============================================================================
// Method 2: Vote Evaluation
// ============================================================================

/**
 * Get vote rankings for multiple thoughts (abstract)
 */
export async function getVoteRankings(
  problem: string,
  thoughts: Thought[],
  evaluatorModel: 'claude' | 'openai'
): Promise<number[]> {
  // TODO: Implement actual AI model call for voting
  // For now, use mock implementation for testing
  const { mockGetVoteRankings } = await import('./mock.js');
  return mockGetVoteRankings(problem, thoughts, evaluatorModel);
}

/**
 * Aggregate votes using Borda Count
 */
export function aggregateVotes(
  voteResults: number[][],
  numCandidates: number
): number[] {
  const scores = new Array(numCandidates).fill(0);

  // Borda Count: Award points based on ranking
  for (const rankings of voteResults) {
    rankings.forEach((candidateId, rank) => {
      // rank 0 (1st place) → numCandidates points
      // rank 1 (2nd place) → numCandidates-1 points
      const points = numCandidates - rank;
      scores[candidateId] += points;
    });
  }

  // Normalize to 0-10 range
  const maxPossibleScore = numCandidates * voteResults.length;
  const normalizedScores = scores.map(
    (score) => (score / maxPossibleScore) * 10.0
  );

  return normalizedScores;
}

/**
 * Get votes for multiple thoughts
 */
export async function getVotes(
  problem: string,
  thoughts: Thought[],
  nEvaluate: number
): Promise<VoteResult> {
  const voteResults: number[][] = [];

  // Perform n votes
  for (let i = 0; i < nEvaluate; i++) {
    const rankings = await getVoteRankings(problem, thoughts, 'claude');
    voteResults.push(rankings);
  }

  // Aggregate votes
  const scores = aggregateVotes(voteResults, thoughts.length);

  return {
    scores,
    rankings: voteResults,
  };
}

/**
 * Hybrid vote evaluation (Claude + OpenAI)
 */
export async function getVotesHybrid(
  problem: string,
  thoughts: Thought[],
  nEvaluate: number
): Promise<HybridVoteResult> {
  // Claude voting
  const claudeVoteResults: number[][] = [];
  for (let i = 0; i < nEvaluate; i++) {
    const rankings = await getVoteRankings(problem, thoughts, 'claude');
    claudeVoteResults.push(rankings);
  }
  const claudeScores = aggregateVotes(claudeVoteResults, thoughts.length);

  // OpenAI voting
  const openaiVoteResults: number[][] = [];
  for (let i = 0; i < nEvaluate; i++) {
    const rankings = await getVoteRankings(problem, thoughts, 'openai');
    openaiVoteResults.push(rankings);
  }
  const openaiScores = aggregateVotes(openaiVoteResults, thoughts.length);

  // Calculate consensus (rank correlation)
  const consensus = calculateRankCorrelation(claudeScores, openaiScores);

  // Final scores based on consensus
  let finalScores: number[];
  if (consensus > 0.7) {
    // High consensus → equal weighting
    finalScores = claudeScores.map(
      (c, i) => (c + openaiScores[i]) / 2
    );
  } else {
    // Low consensus → prioritize Claude (practicality)
    finalScores = claudeScores.map(
      (c, i) => c * 0.6 + openaiScores[i] * 0.4
    );
  }

  return {
    scores: finalScores,
    claudeScores,
    openaiScores,
    consensus,
  };
}

// ============================================================================
// Method 3: Cross-Evaluation
// ============================================================================

/**
 * Cross-evaluate: Claude thoughts → OpenAI evaluates, and vice versa
 */
export async function crossEvaluate(
  problem: string,
  thoughts: Thought[],
  nEvaluate: number
): Promise<Evaluation[]> {
  const evaluations: Evaluation[] = [];

  for (const thought of thoughts) {
    // Determine evaluator (opposite of generator)
    const evaluator = thought.model === 'claude' ? 'openai' : 'claude';

    // Perform evaluation
    const scores: number[] = [];
    for (let i = 0; i < nEvaluate; i++) {
      const score = await evaluateSingleThought(problem, thought, evaluator);
      scores.push(score);
    }

    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const confidence = calculateConfidenceFromScores(scores);

    const evaluation = createEvaluation({
      thoughtId: thought.id,
      overallScore: avgScore,
      confidence,
      evaluator: evaluator === 'claude' ? 'claude' : 'codex',
      rawScores: scores,
    });

    evaluations.push(evaluation);
  }

  return evaluations;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate confidence from score variance
 * Lower variance → higher confidence
 */
export function calculateConfidenceFromScores(scores: number[]): number {
  if (scores.length < 2) {
    return 0.8; // Default value
  }

  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

  // Variance 0-4 → Confidence 1.0-0.5
  const confidence = Math.max(0.5, 1.0 - variance / 8);
  return Math.round(confidence * 100) / 100;
}

/**
 * Calculate rank correlation between two score lists
 */
export function calculateRankCorrelation(
  scores1: number[],
  scores2: number[]
): number {
  if (scores1.length !== scores2.length) {
    throw new Error('Score arrays must have same length');
  }

  // Convert scores to rankings
  const rank1 = scoresToRankings(scores1);
  const rank2 = scoresToRankings(scores2);

  // Spearman's rank correlation
  let sumDiffSquared = 0;
  for (let i = 0; i < rank1.length; i++) {
    const diff = rank1[i] - rank2[i];
    sumDiffSquared += diff * diff;
  }

  const n = rank1.length;
  const correlation = 1 - (6 * sumDiffSquared) / (n * (n * n - 1));

  return Math.max(0, correlation); // Clamp to 0-1
}

/**
 * Convert scores to rankings (0 = highest score)
 */
function scoresToRankings(scores: number[]): number[] {
  const indexed = scores.map((score, index) => ({ score, index }));
  indexed.sort((a, b) => b.score - a.score); // Descending order

  const rankings = new Array(scores.length);
  indexed.forEach((item, rank) => {
    rankings[item.index] = rank;
  });

  return rankings;
}

/**
 * Normalize scores to 0-10 range
 */
export function normalizeScores(
  scores: number[],
  method: 'minmax' | 'zscore' = 'minmax'
): number[] {
  if (scores.length === 0) return [];

  if (method === 'minmax') {
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    if (max - min < 0.001) {
      // All scores identical
      return scores.map(() => 5.0);
    }

    return scores.map((s) => ((s - min) / (max - min)) * 10.0);
  } else {
    // Z-score normalization
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
      scores.length;
    const std = Math.sqrt(variance);

    if (std < 0.001) {
      return scores.map(() => 5.0);
    }

    const zScores = scores.map((s) => (s - mean) / std);
    // Map -3 ~ +3 to 0-10
    return zScores.map((z) => Math.max(0, Math.min(10, ((z + 3) / 6) * 10)));
  }
}

/**
 * Evaluate with early stopping
 */
export async function evaluateWithEarlyStopping(
  problem: string,
  thoughts: Thought[],
  nEvaluate: number,
  confidenceThreshold: number = 9.0
): Promise<ValueEvaluationResult[]> {
  const results: ValueEvaluationResult[] = [];

  for (const thought of thoughts) {
    const scores: number[] = [];

    for (let i = 0; i < nEvaluate; i++) {
      const evaluator = thought.model === 'claude' ? 'openai' : 'claude';
      const score = await evaluateSingleThought(problem, thought, evaluator);
      scores.push(score);

      // Check for early stopping after at least 2 evaluations
      if (i >= 1) {
        const avgSoFar = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        if (avgSoFar >= confidenceThreshold) {
          break; // High enough score, stop evaluating this thought
        }
      }
    }

    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const confidence = calculateConfidenceFromScores(scores);

    results.push({
      score: avgScore,
      rawScores: scores,
      confidence,
    });

    // Global early stopping: found near-perfect thought
    if (avgScore >= confidenceThreshold) {
      // Assign low scores to remaining thoughts
      const remaining = thoughts.length - results.length;
      for (let i = 0; i < remaining; i++) {
        results.push({
          score: 0.0,
          rawScores: [0.0],
          confidence: 0.8,
        });
      }
      break;
    }
  }

  return results;
}

// ============================================================================
// Unified Evaluator Class
// ============================================================================

export class Evaluator {
  constructor(
    private method: 'value' | 'vote' = 'value',
    private hybrid: boolean = true
  ) {}

  /**
   * Evaluate thoughts using configured method
   */
  async evaluate(
    problem: string,
    thoughts: Thought[],
    args: ToTArgs
  ): Promise<Evaluation[]> {
    let scores: number[];

    if (this.method === 'value') {
      if (this.hybrid) {
        const results = await Promise.all(
          thoughts.map((t) => getValueHybrid(problem, t, args.nEvaluate))
        );
        scores = results.map((r) => r.score);
      } else {
        const results = await getValues(
          problem,
          thoughts,
          args.nEvaluate,
          args.enableCache
        );
        scores = results.map((r) => r.score);
      }
    } else {
      // vote method
      if (this.hybrid) {
        const result = await getVotesHybrid(problem, thoughts, args.nEvaluate);
        scores = result.scores;
      } else {
        const result = await getVotes(problem, thoughts, args.nEvaluate);
        scores = result.scores;
      }
    }

    // Convert scores to Evaluation objects
    const evaluations = thoughts.map((thought, index) =>
      createEvaluation({
        thoughtId: thought.id,
        overallScore: scores[index],
        confidence: 0.85, // Default confidence
        evaluator: this.hybrid ? 'hybrid' : 'claude',
        rawScores: [scores[index]],
      })
    );

    return evaluations;
  }
}
