/**
 * Tree of Thought - Core Type Definitions
 *
 * Standardized data structures used in the Tree of Thoughts system
 * Based on Princeton NLP research: https://arxiv.org/abs/2305.10601
 */

// ============================================================================
// 1. Thought (Individual thought node in the tree)
// ============================================================================

export interface Thought {
  /** Unique identifier (e.g., "claude_0", "codex_1") */
  id: string;

  /** Thought content (in Korean for user-facing output) */
  text: string;

  /** Generation model */
  model: 'claude' | 'codex';

  /** Tree depth (starting from 0) */
  depth: number;

  /** Parent thought ID (null for Level 0) */
  parentId: string | null;

  /** Evaluation score (0-10, null if not evaluated) */
  score: number | null;

  /** Confidence level (0-1, null if not calculated) */
  confidence: number | null;

  /** Additional metadata */
  metadata: Record<string, unknown>;
}

/**
 * Create a new Thought with validation
 */
export function createThought(params: {
  id: string;
  text: string;
  model: 'claude' | 'codex';
  depth: number;
  parentId?: string | null;
  score?: number | null;
  confidence?: number | null;
  metadata?: Record<string, unknown>;
}): Thought {
  // Validation
  if (!params.text || params.text.trim().length === 0) {
    throw new Error('Thought text cannot be empty');
  }

  if (params.depth < 0) {
    throw new Error(`Invalid depth: ${params.depth}`);
  }

  if (params.score !== undefined && params.score !== null) {
    if (params.score < 0 || params.score > 10) {
      throw new Error(`Score must be 0-10: ${params.score}`);
    }
  }

  if (params.confidence !== undefined && params.confidence !== null) {
    if (params.confidence < 0 || params.confidence > 1) {
      throw new Error(`Confidence must be 0-1: ${params.confidence}`);
    }
  }

  return {
    id: params.id,
    text: params.text,
    model: params.model,
    depth: params.depth,
    parentId: params.parentId ?? null,
    score: params.score ?? null,
    confidence: params.confidence ?? null,
    metadata: params.metadata ?? {},
  };
}

// ============================================================================
// 2. ToTArgs (Execution Parameters)
// ============================================================================

export interface ToTArgs {
  // Princeton core parameters
  /** Number of thoughts to generate (b in paper) */
  nGenerate: number;

  /** Number of evaluations per thought */
  nEvaluate: number;

  /** Number of thoughts to select */
  nSelect: number;

  /** Maximum tree depth */
  maxDepth: number;

  // Algorithm selection
  /** Search algorithm */
  algorithm: 'BFS' | 'DFS' | 'best-first';

  /** Generation method */
  methodGenerate: 'propose' | 'sample';

  /** Evaluation method */
  methodEvaluate: 'value' | 'vote';

  /** Selection method */
  methodSelect: 'greedy' | 'sample' | 'hybrid';

  // Hybrid mode
  /** Claude:Codex ratio (e.g., "5:5", "7:3", "3:7") */
  ratio: string;

  // Optimization
  /** Early stopping score threshold */
  confidenceThreshold: number;

  /** Enable caching */
  enableCache: boolean;

  /** Enable parallel processing */
  enableParallel: boolean;
}

/**
 * Default ToT arguments
 */
export const DEFAULT_TOT_ARGS: ToTArgs = {
  nGenerate: 5,
  nEvaluate: 3,
  nSelect: 3,
  maxDepth: 3,
  algorithm: 'BFS',
  methodGenerate: 'propose',
  methodEvaluate: 'value',
  methodSelect: 'greedy',
  ratio: '5:5',
  confidenceThreshold: 9.0,
  enableCache: true,
  enableParallel: true,
};

/**
 * Create ToTArgs with validation
 */
export function createToTArgs(partial?: Partial<ToTArgs>): ToTArgs {
  const args: ToTArgs = { ...DEFAULT_TOT_ARGS, ...partial };

  // Validation
  if (args.nGenerate <= 0) {
    throw new Error('nGenerate must be positive');
  }

  if (args.nEvaluate <= 0) {
    throw new Error('nEvaluate must be positive');
  }

  if (args.nSelect <= 0) {
    throw new Error('nSelect must be positive');
  }

  if (args.nSelect > args.nGenerate) {
    throw new Error('nSelect cannot be greater than nGenerate');
  }

  if (args.maxDepth <= 0) {
    throw new Error('maxDepth must be positive');
  }

  if (args.confidenceThreshold < 0 || args.confidenceThreshold > 10) {
    throw new Error('confidenceThreshold must be 0-10');
  }

  return args;
}

/**
 * Parse ratio string to [claude, codex] percentages
 */
export function parseRatio(ratio: string): [number, number] {
  const parts = ratio.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid ratio format: ${ratio}`);
  }

  const claude = parseInt(parts[0], 10);
  const codex = parseInt(parts[1], 10);

  if (isNaN(claude) || isNaN(codex)) {
    throw new Error(`Invalid ratio numbers: ${ratio}`);
  }

  const total = claude + codex;
  return [claude / total, codex / total];
}

/**
 * Get number of Claude thoughts to generate
 */
export function getClaudeCount(args: ToTArgs): number {
  const [claudeRatio] = parseRatio(args.ratio);
  return Math.round(args.nGenerate * claudeRatio);
}

/**
 * Get number of Codex thoughts to generate
 */
export function getCodexCount(args: ToTArgs): number {
  const [, codexRatio] = parseRatio(args.ratio);
  return Math.round(args.nGenerate * codexRatio);
}

// ============================================================================
// 3. TaskConfig (Task Configuration)
// ============================================================================

export interface TaskConfig {
  /** Task type */
  taskType: 'debug' | 'refactor' | 'design' | 'custom';

  /** Number of steps */
  steps: number;

  /** Step names (in Korean) */
  stepNames: string[];

  /** Default ToT arguments for this task */
  defaultArgs: ToTArgs;

  /** Prompt templates per step */
  promptTemplates: Record<string, string>;
}

/**
 * Create TaskConfig with validation
 */
export function createTaskConfig(config: TaskConfig): TaskConfig {
  if (config.stepNames.length !== config.steps) {
    throw new Error('stepNames length must match steps count');
  }

  return config;
}

/**
 * Get step name for a given depth
 */
export function getStepName(config: TaskConfig, depth: number): string {
  if (depth < config.stepNames.length) {
    return config.stepNames[depth];
  }
  return `Step ${depth + 1}`;
}

// ============================================================================
// 4. Evaluation (Evaluation Result)
// ============================================================================

export interface Evaluation {
  /** ID of the thought being evaluated */
  thoughtId: string;

  /** Overall score (0-10) */
  overallScore: number;

  /** Confidence level (0-1) */
  confidence: number;

  /** Evaluator */
  evaluator: 'claude' | 'codex' | 'hybrid';

  /** Detailed scores breakdown */
  breakdown: Record<string, number>;

  /** Number of evaluations performed */
  evaluationCount: number;

  /** List of individual evaluation scores */
  rawScores: number[];
}

/**
 * Create Evaluation with validation
 */
export function createEvaluation(params: {
  thoughtId: string;
  overallScore: number;
  confidence: number;
  evaluator: 'claude' | 'codex' | 'hybrid';
  breakdown?: Record<string, number>;
  rawScores?: number[];
}): Evaluation {
  if (params.overallScore < 0 || params.overallScore > 10) {
    throw new Error(`Overall score must be 0-10: ${params.overallScore}`);
  }

  if (params.confidence < 0 || params.confidence > 1) {
    throw new Error(`Confidence must be 0-1: ${params.confidence}`);
  }

  const rawScores = params.rawScores ?? [params.overallScore];

  return {
    thoughtId: params.thoughtId,
    overallScore: params.overallScore,
    confidence: params.confidence,
    evaluator: params.evaluator,
    breakdown: params.breakdown ?? {},
    evaluationCount: rawScores.length,
    rawScores,
  };
}

/**
 * Add evaluation score and recalculate
 */
export function addScore(evaluation: Evaluation, score: number): Evaluation {
  const newRawScores = [...evaluation.rawScores, score];
  const newAverage =
    newRawScores.reduce((sum, s) => sum + s, 0) / newRawScores.length;
  const newConfidence = calculateConfidence(newRawScores);

  return {
    ...evaluation,
    overallScore: newAverage,
    confidence: newConfidence,
    evaluationCount: newRawScores.length,
    rawScores: newRawScores,
  };
}

/**
 * Calculate confidence based on score consistency
 * Lower variance → higher confidence
 */
export function calculateConfidence(scores: number[]): number {
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

// ============================================================================
// 5. SearchResult (Final Result)
// ============================================================================

export interface SearchResult {
  /** Optimal thought */
  bestThought: Thought;

  /** Path from root to optimal thought */
  path: Thought[];

  /** List of all explored thoughts */
  allThoughts: Thought[];

  /** All evaluation results */
  evaluations: Record<string, Evaluation>;

  /** Execution metadata */
  metadata: Record<string, unknown>;
}

/**
 * Create SearchResult with validation
 */
export function createSearchResult(params: {
  bestThought: Thought;
  path: Thought[];
  allThoughts: Thought[];
  evaluations: Record<string, Evaluation>;
  metadata?: Record<string, unknown>;
}): SearchResult {
  // Validation
  if (!params.path.some((t) => t.id === params.bestThought.id)) {
    throw new Error('bestThought must be in path');
  }

  if (!params.allThoughts.some((t) => t.id === params.bestThought.id)) {
    throw new Error('bestThought must be in allThoughts');
  }

  if (!params.evaluations[params.bestThought.id]) {
    throw new Error('bestThought must have evaluation');
  }

  return {
    bestThought: params.bestThought,
    path: params.path,
    allThoughts: params.allThoughts,
    evaluations: params.evaluations,
    metadata: params.metadata ?? {},
  };
}

/**
 * Get list of thought IDs in path
 */
export function getPathIds(result: SearchResult): string[] {
  return result.path.map((t) => t.id);
}

/**
 * Get list of scores in path
 */
export function getPathScores(result: SearchResult): number[] {
  return result.path.map((t) => result.evaluations[t.id].overallScore);
}

/**
 * Get model distribution
 */
export function getModelDistribution(
  result: SearchResult
): Record<string, number> {
  const dist: Record<string, number> = { claude: 0, codex: 0 };
  result.allThoughts.forEach((t) => {
    dist[t.model] = (dist[t.model] || 0) + 1;
  });
  return dist;
}

/**
 * Get depth distribution
 */
export function getDepthDistribution(
  result: SearchResult
): Record<number, number> {
  const dist: Record<number, number> = {};
  result.allThoughts.forEach((t) => {
    dist[t.depth] = (dist[t.depth] || 0) + 1;
  });
  return dist;
}

/**
 * Generate result summary text
 */
export function generateSummary(result: SearchResult): string {
  const pathStr = getPathIds(result).join(' → ');
  const scoresStr = getPathScores(result)
    .map((s) => s.toFixed(1))
    .join(' → ');
  const modelDist = getModelDistribution(result);
  const bestEval = result.evaluations[result.bestThought.id];

  return `
=== ToT Search Result ===

Best Thought:
  ID: ${result.bestThought.id}
  Model: ${result.bestThought.model}
  Score: ${bestEval.overallScore.toFixed(1)}
  Confidence: ${(bestEval.confidence * 100).toFixed(0)}%

Optimal Path:
  ${pathStr}

Path Scores:
  ${scoresStr}

Statistics:
  Total thoughts: ${result.allThoughts.length}
  Claude: ${modelDist.claude || 0}
  Codex: ${modelDist.codex || 0}
  Max depth: ${Math.max(...result.allThoughts.map((t) => t.depth))}

Content:
${result.bestThought.text}
`.trim();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract path by backtracking from optimal thought to root
 */
export function extractPath(thoughts: Thought[], bestId: string): Thought[] {
  const thoughtMap = new Map(thoughts.map((t) => [t.id, t]));
  const path: Thought[] = [];

  let currentId: string | null = bestId;
  while (currentId) {
    const current = thoughtMap.get(currentId);
    if (!current) {
      throw new Error(`Thought not found: ${currentId}`);
    }
    path.unshift(current); // Insert at front
    currentId = current.parentId;
  }

  return path;
}

/**
 * Calculate tree statistics
 */
export function calculateTreeStatistics(thoughts: Thought[]): {
  totalNodes: number;
  maxDepth: number;
  avgDepth: number;
  branchingFactor: number;
  modelDistribution: Record<string, number>;
} {
  const depths = thoughts.map((t) => t.depth);
  const depthCounts: Record<number, number> = {};

  thoughts.forEach((t) => {
    depthCounts[t.depth] = (depthCounts[t.depth] || 0) + 1;
  });

  const avgBranching =
    Object.values(depthCounts).reduce((sum, count) => sum + count, 0) /
    Object.keys(depthCounts).length;

  const modelDist: Record<string, number> = { claude: 0, codex: 0 };
  thoughts.forEach((t) => {
    modelDist[t.model] = (modelDist[t.model] || 0) + 1;
  });

  return {
    totalNodes: thoughts.length,
    maxDepth: Math.max(...depths),
    avgDepth: depths.reduce((sum, d) => sum + d, 0) / depths.length,
    branchingFactor: avgBranching,
    modelDistribution: modelDist,
  };
}
