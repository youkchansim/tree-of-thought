# @tot/core

Core library for Tree of Thought framework - systematic problem-solving through structured exploration.

[![npm version](https://img.shields.io/npm/v/@tot/core.svg)](https://www.npmjs.com/package/@tot/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @tot/core
# or
pnpm add @tot/core
# or
yarn add @tot/core
```

## Quick Start

```typescript
import { MockThoughtGenerator, executeBFS, DebugTask } from '@tot/core';

const task = new DebugTask();
const generator = new MockThoughtGenerator();
const problem = "Find the cause of memory leak";

const result = await executeBFS(problem, task.config, generator);
console.log('Solution:', result.bestThought.text);
```

## API Reference

### Types

#### Thought

Represents a single thought in the search tree.

```typescript
interface Thought {
  id: string;
  text: string;
  model: 'claude' | 'codex';
  depth: number;
  parentId: string | null;
  score: number | null;
  confidence: number | null;
  metadata: Record<string, unknown>;
}
```

#### ToTArgs

Configuration parameters for Tree of Thought algorithm.

```typescript
interface ToTArgs {
  // Generation parameters
  nGenerate: number;        // Number of thoughts to generate per step
  nEvaluate: number;        // Number of evaluations per thought
  nSelect: number;          // Number of thoughts to select

  // Search strategy
  algorithm: 'BFS' | 'DFS' | 'best-first';
  methodGenerate: 'propose' | 'sample';
  methodEvaluate: 'value' | 'vote';
  methodSelect: 'greedy' | 'sample' | 'hybrid';

  // Model configuration
  ratio: string;            // Claude:Codex ratio (e.g., "3:2")

  // Optimization
  maxDepth: number;
  confidenceThreshold: number;
  enableCache: boolean;
  enableParallel: boolean;
}
```

#### SearchResult

Result of a Tree of Thought search.

```typescript
interface SearchResult {
  bestThought: Thought;
  path: Thought[];
  allThoughts: Thought[];
  evaluations: Record<string, Evaluation>;
  metadata: {
    algorithm: string;
    stoppedEarly: boolean;
    [key: string]: unknown;
  };
}
```

### Factory Functions

#### createThought

Create a validated Thought object.

```typescript
function createThought(params: Partial<Thought> & {
  id: string;
  text: string;
  model: 'claude' | 'codex';
  depth: number;
}): Thought
```

**Example:**
```typescript
const thought = createThought({
  id: 'thought-1',
  text: 'Analyze memory usage patterns',
  model: 'claude',
  depth: 0,
  parentId: null,
});
```

#### createToTArgs

Create validated ToT configuration.

```typescript
function createToTArgs(params: Partial<ToTArgs>): ToTArgs
```

**Example:**
```typescript
const args = createToTArgs({
  nGenerate: 5,
  nEvaluate: 3,
  nSelect: 3,
  algorithm: 'BFS',
  ratio: '3:2',
});
```

#### createTaskConfig

Create task configuration.

```typescript
function createTaskConfig(params: {
  taskType: string;
  steps: number;
  stepNames: string[];
  defaultArgs: ToTArgs;
  promptTemplates?: Record<string, string>;
}): TaskConfig
```

### Algorithms

#### executeBFS

Execute breadth-first search.

```typescript
async function executeBFS(
  problem: string,
  config: TaskConfig,
  generator: ThoughtGenerator
): Promise<SearchResult>
```

**Features:**
- Level-by-level exploration
- Guarantees optimal solution within depth limit
- Early stopping when confidence threshold is met
- Memory intensive but thorough

**Example:**
```typescript
const result = await executeBFS(
  "Optimize database query",
  task.config,
  generator
);
```

#### executeDFS

Execute depth-first search with backtracking.

```typescript
async function executeDFS(
  problem: string,
  config: TaskConfig,
  generator: ThoughtGenerator
): Promise<SearchResult>
```

**Features:**
- Depth-first exploration with backtracking
- Memory efficient
- Explores multiple branches (nSelect)
- Good for deep analysis

**Example:**
```typescript
const result = await executeDFS(
  "Find root cause of bug",
  task.config,
  generator
);
```

### Generators

#### ThoughtGenerator Interface

Interface for implementing custom thought generators.

```typescript
interface ThoughtGenerator {
  generate(
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]>;
}
```

#### MockThoughtGenerator

Mock implementation for testing.

```typescript
class MockThoughtGenerator implements ThoughtGenerator {
  async generate(...): Promise<Thought[]>
}
```

**Example:**
```typescript
const generator = new MockThoughtGenerator();
// Generates dummy thoughts for testing
```

### Tasks

#### BaseTask

Abstract base class for task implementations.

```typescript
abstract class BaseTask {
  constructor(public config: TaskConfig) {}

  abstract generateProposalPrompt(
    problem: string,
    currentState: string
  ): string;

  abstract generateValuePrompt(
    problem: string,
    thought: string
  ): string;

  abstract generateVotePrompt(
    problem: string,
    thoughts: string[]
  ): string;

  abstract parseValueOutput(response: string): number;

  abstract parseVoteOutput(response: string): number[];
}
```

#### DebugTask

Pre-configured task for debugging problems.

```typescript
class DebugTask extends BaseTask {
  constructor()
}
```

**Configuration:**
- Steps: 4 (원인 분석, 검증 방법, 수정 방안, 테스트 계획)
- Default: nGenerate=5, nEvaluate=3, nSelect=3
- Algorithm: BFS
- Ratio: 6:4 (Claude priority)

**Example:**
```typescript
const task = new DebugTask();
const result = await executeBFS(
  "Memory leak in production",
  task.config,
  generator
);
```

### Evaluation

#### Evaluator Class

Unified evaluator for thoughts.

```typescript
class Evaluator {
  constructor(
    method: 'value' | 'vote' = 'value',
    hybrid: boolean = true
  )

  async evaluate(
    problem: string,
    thoughts: Thought[],
    args: ToTArgs
  ): Promise<Evaluation[]>
}
```

**Example:**
```typescript
const evaluator = new Evaluator('value', true);
const evaluations = await evaluator.evaluate(
  problem,
  thoughts,
  args
);
```

#### getValue

Evaluate a single thought using value method.

```typescript
async function getValue(
  problem: string,
  thought: Thought,
  nEvaluate: number,
  useCache?: boolean
): Promise<ValueEvaluationResult>
```

#### getVotes

Evaluate multiple thoughts using vote method.

```typescript
async function getVotes(
  problem: string,
  thoughts: Thought[],
  nEvaluate: number
): Promise<VoteResult>
```

### Selection

#### createSelector

Create a selector based on configuration.

```typescript
function createSelector(args: ToTArgs): Selector
```

**Example:**
```typescript
const selector = createSelector(args);
const selectedIndices = selector.select(
  evaluations,
  thoughts,
  nSelect
);
```

#### Selector Class

Unified selector interface.

```typescript
class Selector {
  select(
    evaluations: Evaluation[],
    thoughts: Thought[],
    nSelect: number
  ): number[]
}
```

#### Selection Methods

**selectGreedy** - Choose top-k by score
```typescript
function selectGreedy(
  evaluations: Evaluation[],
  nSelect: number
): number[]
```

**selectSample** - Probabilistic sampling
```typescript
function selectSample(
  evaluations: Evaluation[],
  nSelect: number,
  temperature?: number
): number[]
```

**selectHybrid** - Balance score and diversity
```typescript
function selectHybrid(
  evaluations: Evaluation[],
  thoughts: Thought[],
  nSelect: number,
  diversityWeight?: number
): number[]
```

### Utility Functions

#### extractPath

Extract path from root to target thought.

```typescript
function extractPath(
  allThoughts: Thought[],
  targetId: string
): Thought[]
```

#### calculateTreeStatistics

Get statistics about the thought tree.

```typescript
function calculateTreeStatistics(thoughts: Thought[]): {
  totalNodes: number;
  maxDepth: number;
  avgBranchingFactor: number;
  claudeCount: number;
  codexCount: number;
}
```

#### parseRatio

Parse Claude:Codex ratio string.

```typescript
function parseRatio(ratio: string): [number, number]
```

**Example:**
```typescript
const [claude, codex] = parseRatio('3:2');
// Returns: [3, 2]
```

#### getClaudeCount / getCodexCount

Get thought counts based on ratio.

```typescript
function getClaudeCount(args: ToTArgs): number
function getCodexCount(args: ToTArgs): number
```

## Advanced Usage

### Custom Task Implementation

```typescript
import { BaseTask, createTaskConfig, createToTArgs } from '@tot/core';

class CustomTask extends BaseTask {
  constructor() {
    const config = createTaskConfig({
      taskType: 'custom',
      steps: 3,
      stepNames: ['Step 1', 'Step 2', 'Step 3'],
      defaultArgs: createToTArgs({
        nGenerate: 5,
        nEvaluate: 3,
        nSelect: 3,
        algorithm: 'BFS',
        ratio: '5:5',
      }),
      promptTemplates: {
        step_0: 'Analyze: {problem}',
        step_1: 'Design solution for: {analysis}',
        step_2: 'Implement: {design}',
      },
    });
    super(config);
  }

  generateProposalPrompt(problem: string, currentState: string): string {
    return `Problem: ${problem}\nCurrent: ${currentState}\nNext step:`;
  }

  generateValuePrompt(problem: string, thought: string): string {
    return `Rate 0-10: ${thought}`;
  }

  generateVotePrompt(problem: string, thoughts: string[]): string {
    return `Rank: ${thoughts.join(', ')}`;
  }

  parseValueOutput(response: string): number {
    const match = response.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 5;
  }

  parseVoteOutput(response: string): number[] {
    return response.split(',').map(n => parseInt(n.trim(), 10) - 1);
  }
}
```

### Custom Generator Implementation

```typescript
import { ThoughtGenerator, Thought, ToTArgs, createThought } from '@tot/core';

class CustomGenerator implements ThoughtGenerator {
  async generate(
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]> {
    // Your custom generation logic
    return [
      createThought({
        id: `custom-${depth}-${Date.now()}`,
        text: `Generated thought for: ${problem}`,
        model: 'claude',
        depth,
        parentId: currentThoughts[0]?.id || null,
      }),
    ];
  }
}
```

### Evaluation Caching

```typescript
import { clearCache, getCachedValue, setCachedValue } from '@tot/core';

// Enable caching in configuration
const args = createToTArgs({
  enableCache: true,
  // ... other config
});

// Manually manage cache
clearCache();  // Clear all cached evaluations
```

## Performance Tips

### 1. Choose Appropriate Parameters

```typescript
// Quick exploration (< 1 min)
const quickArgs = createToTArgs({
  nGenerate: 3,
  nEvaluate: 2,
  nSelect: 2,
  maxDepth: 3,
});

// Thorough analysis (3-5 min)
const thoroughArgs = createToTArgs({
  nGenerate: 7,
  nEvaluate: 5,
  nSelect: 4,
  maxDepth: 5,
});

// Deep dive (10-15 min)
const deepArgs = createToTArgs({
  nGenerate: 10,
  nEvaluate: 7,
  nSelect: 5,
  maxDepth: 8,
});
```

### 2. Use DFS for Memory Efficiency

```typescript
// BFS: O(b^d) memory
const bfsResult = await executeBFS(problem, config, generator);

// DFS: O(d) memory
const dfsResult = await executeDFS(problem, config, generator);
```

### 3. Enable Early Stopping

```typescript
const args = createToTArgs({
  confidenceThreshold: 9.5,  // Stop when solution is good enough
  maxDepth: 10,
});
```

## TypeScript Support

This package is written in TypeScript and provides complete type definitions.

```typescript
import type {
  Thought,
  ToTArgs,
  SearchResult,
  ThoughtGenerator,
  Evaluation,
} from '@tot/core';
```

## Examples

See [Examples Documentation](../../docs/EXAMPLES.md) for comprehensive examples.

## License

MIT © [youkchansim](https://github.com/youkchansim)

## Links

- [GitHub Repository](https://github.com/youkchansim/tree-of-thought)
- [Full Documentation](../../README.md)
- [Examples](../../docs/EXAMPLES.md)
- [Integration Guide](../../docs/INTEGRATION.md)
