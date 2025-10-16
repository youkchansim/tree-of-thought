# Usage Examples

This document provides comprehensive examples of using the Tree of Thought framework.

## Table of Contents

- [Basic Examples](#basic-examples)
  - [Debug Task](#debug-task)
  - [Custom Task](#custom-task)
- [Advanced Examples](#advanced-examples)
  - [Custom ThoughtGenerator](#custom-thoughtgenerator)
  - [DFS with Backtracking](#dfs-with-backtracking)
  - [Evaluation Caching](#evaluation-caching)
- [Claude Code CLI Integration](#claude-code-cli-integration)
- [Real-World Scenarios](#real-world-scenarios)

## Basic Examples

### Debug Task

Find the root cause of a bug using BFS algorithm:

```typescript
import {
  MockThoughtGenerator,
  executeBFS,
  DebugTask
} from '@tot/core';

async function debugExample() {
  // 1. Create debug task
  const debugTask = new DebugTask();
  const config = debugTask.config;

  // 2. Create generator
  const generator = new MockThoughtGenerator();

  // 3. Define problem
  const problem = `
    Production system experiencing memory leak:
    - Memory usage increases by 50MB/hour
    - No memory cleanup after user logout
    - Issue appeared after last deployment
  `;

  // 4. Execute BFS search
  const result = await executeBFS(problem, config, generator);

  // 5. Display results
  console.log('=== Search Results ===');
  console.log(`Best Solution: ${result.bestThought.text}`);
  console.log(`Confidence: ${result.bestThought.confidence}`);
  console.log(`\nSearch Path (${result.path.length} steps):`);
  result.path.forEach((thought, i) => {
    console.log(`  ${i + 1}. [${thought.model}] ${thought.text}`);
  });

  // 6. Get statistics
  const claudeCount = result.allThoughts.filter(t => t.model === 'claude').length;
  const codexCount = result.allThoughts.filter(t => t.model === 'codex').length;
  console.log(`\nStatistics:`);
  console.log(`  Total thoughts: ${result.allThoughts.length}`);
  console.log(`  Claude: ${claudeCount}, Codex: ${codexCount}`);
  console.log(`  Stopped early: ${result.metadata.stoppedEarly}`);
}

debugExample();
```

### Custom Task

Create a custom task type for your specific use case:

```typescript
import {
  BaseTask,
  createTaskConfig,
  createToTArgs,
  MockThoughtGenerator,
  executeBFS
} from '@tot/core';

// 1. Define custom task
class PerformanceOptimizationTask extends BaseTask {
  constructor() {
    const config = createTaskConfig({
      taskType: 'performance',
      steps: 4,
      stepNames: [
        'Identify Bottleneck',
        'Analyze Root Cause',
        'Propose Solution',
        'Verify Impact'
      ],
      defaultArgs: createToTArgs({
        nGenerate: 5,
        nEvaluate: 3,
        nSelect: 3,
        algorithm: 'BFS',
        ratio: '5:5',  // Balanced Claude:Codex
        maxDepth: 4,
        confidenceThreshold: 9.0,
      }),
      promptTemplates: {
        step_0: 'Identify the performance bottleneck in: {problem}',
        step_1: 'Analyze the root cause of: {bottleneck}',
        step_2: 'Propose optimization solutions for: {cause}',
        step_3: 'Verify the impact of: {solution}',
      },
    });
    super(config);
  }

  generateProposalPrompt(problem: string, currentState: string): string {
    if (!currentState) {
      return `Performance issue: ${problem}\n\nWhat is the most likely bottleneck?`;
    }
    return `Current analysis: ${currentState}\n\nWhat is the next step?`;
  }

  generateValuePrompt(problem: string, thought: string): number {
    return `Rate this optimization approach from 0-10:\n${thought}`;
  }

  generateVotePrompt(problem: string, thoughts: string[]): string {
    const list = thoughts.map((t, i) => `${i + 1}. ${t}`).join('\n');
    return `Rank these optimization approaches:\n${list}`;
  }

  parseValueOutput(response: string): number {
    const match = response.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 5.0;
  }

  parseVoteOutput(response: string): number[] {
    const numbers = response.match(/\d+/g);
    return numbers ? numbers.map(n => parseInt(n, 10) - 1) : [];
  }
}

// 2. Use custom task
async function performanceExample() {
  const task = new PerformanceOptimizationTask();
  const generator = new MockThoughtGenerator();

  const problem = `
    API endpoint /api/users response time is 3 seconds
    - Database query takes 2.5 seconds
    - 10,000 users in database
    - Query uses LIKE operator
  `;

  const result = await executeBFS(problem, task.config, generator);

  console.log('Optimization solution:', result.bestThought.text);
}

performanceExample();
```

## Advanced Examples

### Custom ThoughtGenerator

Implement your own thought generation logic:

```typescript
import {
  ThoughtGenerator,
  Thought,
  ToTArgs,
  createThought,
  getClaudeCount,
  getCodexCount
} from '@tot/core';

class CustomThoughtGenerator implements ThoughtGenerator {
  private counter = 0;

  async generate(
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]> {
    const claudeCount = getClaudeCount(args);
    const codexCount = getCodexCount(args);
    const thoughts: Thought[] = [];

    const parentId = currentThoughts.length > 0 ? currentThoughts[0].id : null;

    // Generate Claude thoughts (practical approach)
    for (let i = 0; i < claudeCount; i++) {
      const thought = createThought({
        id: `custom-${this.counter++}`,
        text: await this.generateClaudeThought(problem, currentThoughts, depth),
        model: 'claude',
        depth,
        parentId,
      });
      thoughts.push(thought);
    }

    // Generate Codex thoughts (algorithmic approach)
    for (let i = 0; i < codexCount; i++) {
      const thought = createThought({
        id: `custom-${this.counter++}`,
        text: await this.generateCodexThought(problem, currentThoughts, depth),
        model: 'codex',
        depth,
        parentId,
      });
      thoughts.push(thought);
    }

    return thoughts;
  }

  private async generateClaudeThought(
    problem: string,
    currentThoughts: Thought[],
    depth: number
  ): Promise<string> {
    // Your custom Claude thought generation logic
    // Could integrate with Claude API, Task tool, etc.
    return `Claude thought at depth ${depth}`;
  }

  private async generateCodexThought(
    problem: string,
    currentThoughts: Thought[],
    depth: number
  ): Promise<string> {
    // Your custom Codex thought generation logic
    // Could integrate with OpenAI API, Codex MCP, etc.
    return `Codex thought at depth ${depth}`;
  }
}

// Usage
async function customGeneratorExample() {
  const generator = new CustomThoughtGenerator();
  const task = new DebugTask();

  const result = await executeBFS(
    "Custom problem to solve",
    task.config,
    generator
  );

  console.log('Result:', result.bestThought);
}
```

### DFS with Backtracking

Use DFS for memory-efficient depth-first exploration:

```typescript
import {
  MockThoughtGenerator,
  executeDFS,
  DebugTask
} from '@tot/core';

async function dfsExample() {
  const task = new DebugTask();
  const generator = new MockThoughtGenerator();

  const problem = "Complex nested bug requiring deep analysis";

  // DFS explores deeper paths first and backtracks
  const result = await executeDFS(problem, task.config, generator);

  console.log('=== DFS Results ===');
  console.log(`Best solution: ${result.bestThought.text}`);
  console.log(`Search depth reached: ${result.bestThought.depth}`);
  console.log(`Algorithm: ${result.metadata.algorithm}`);
  console.log(`Stopped early: ${result.metadata.stoppedEarly}`);

  // Analyze search pattern
  const depthDistribution = result.allThoughts.reduce((acc, thought) => {
    acc[thought.depth] = (acc[thought.depth] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  console.log('\nDepth distribution:', depthDistribution);
}

dfsExample();
```

### Evaluation Caching

Enable caching to improve performance:

```typescript
import {
  MockThoughtGenerator,
  executeBFS,
  createTaskConfig,
  createToTArgs
} from '@tot/core';

async function cachingExample() {
  const config = createTaskConfig({
    taskType: 'debug',
    steps: 5,
    stepNames: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
    defaultArgs: createToTArgs({
      nGenerate: 10,
      nEvaluate: 5,
      nSelect: 5,
      algorithm: 'BFS',
      ratio: '5:5',
      enableCache: true,  // Enable evaluation caching
      maxDepth: 5,
    }),
    promptTemplates: {
      step_0: '{problem}',
    },
  });

  const generator = new MockThoughtGenerator();
  const problem = "Problem with repeated evaluations";

  // First run - builds cache
  console.time('First run (no cache)');
  await executeBFS(problem, config, generator);
  console.timeEnd('First run (no cache)');

  // Second run - uses cache
  console.time('Second run (with cache)');
  await executeBFS(problem, config, generator);
  console.timeEnd('Second run (with cache)');
}

cachingExample();
```

## Claude Code CLI Integration

### Task Tool Integration Example

```typescript
// This is a conceptual example - actual implementation depends on
// your Claude Code CLI environment

import { ThoughtGenerator, Thought, ToTArgs } from '@tot/core';

class ClaudeCodeGenerator implements ThoughtGenerator {
  constructor(
    private taskExecutor: (params: any) => Promise<{ thoughts: string[] }>
  ) {}

  async generate(
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]> {
    const prompt = this.buildPrompt(problem, currentThoughts, depth);
    const claudeCount = getClaudeCount(args);
    const codexCount = getCodexCount(args);

    const thoughts: Thought[] = [];

    // Generate Claude thoughts via Task tool
    if (claudeCount > 0) {
      const claudeResult = await this.taskExecutor({
        model: 'claude',
        prompt,
        count: claudeCount,
      });

      claudeResult.thoughts.forEach((text, i) => {
        thoughts.push(createThought({
          id: `claude-${depth}-${i}-${Date.now()}`,
          text,
          model: 'claude',
          depth,
          parentId: currentThoughts[0]?.id || null,
        }));
      });
    }

    // Generate Codex thoughts via Task tool
    if (codexCount > 0) {
      const codexResult = await this.taskExecutor({
        model: 'codex',
        prompt,
        count: codexCount,
      });

      codexResult.thoughts.forEach((text, i) => {
        thoughts.push(createThought({
          id: `codex-${depth}-${i}-${Date.now()}`,
          text,
          model: 'codex',
          depth,
          parentId: currentThoughts[0]?.id || null,
        }));
      });
    }

    return thoughts;
  }

  private buildPrompt(
    problem: string,
    currentThoughts: Thought[],
    depth: number
  ): string {
    if (currentThoughts.length === 0) {
      return `Problem: ${problem}\n\nProvide the first approach to solve this.`;
    }

    const history = currentThoughts
      .map((t, i) => `${i + 1}. ${t.text}`)
      .join('\n');

    return `
Problem: ${problem}

Previous steps:
${history}

What is the next step?
    `.trim();
  }
}

// Usage in Claude Code CLI context
async function claudeCodeExample() {
  // Your Task tool executor function
  const taskExecutor = async (params: any) => {
    // Call Task tool via Claude Code CLI
    // This would use the actual Task tool available in your environment
    return { thoughts: ['thought 1', 'thought 2'] };
  };

  const generator = new ClaudeCodeGenerator(taskExecutor);
  const task = new DebugTask();

  const result = await executeBFS(
    "Debug problem",
    task.config,
    generator
  );

  console.log('Solution:', result.bestThought.text);
}
```

## Real-World Scenarios

### Scenario 1: Database Query Optimization

```typescript
import { executeBFS, createTaskConfig, createToTArgs } from '@tot/core';

async function optimizeQuery() {
  const problem = `
    Slow query performance:
    SELECT * FROM users u
    JOIN orders o ON u.id = o.user_id
    WHERE u.created_at > '2024-01-01'
    AND o.status = 'pending'
    ORDER BY u.created_at DESC
    LIMIT 100;

    - Takes 5 seconds
    - users table: 1M rows
    - orders table: 5M rows
    - No indexes except primary keys
  `;

  const config = createTaskConfig({
    taskType: 'optimization',
    steps: 3,
    stepNames: ['Identify Issue', 'Propose Solution', 'Validate'],
    defaultArgs: createToTArgs({
      nGenerate: 5,
      nEvaluate: 3,
      nSelect: 2,
      algorithm: 'BFS',
      ratio: '3:2',  // Claude-heavy for practical approach
    }),
    promptTemplates: {
      step_0: 'Analyze this slow query: {problem}',
      step_1: 'Propose optimization for: {issue}',
      step_2: 'Validate this solution: {solution}',
    },
  });

  const generator = new MockThoughtGenerator();
  const result = await executeBFS(problem, config, generator);

  console.log('Optimization:', result.bestThought.text);
}
```

### Scenario 2: Architecture Decision

```typescript
async function architectureDecision() {
  const problem = `
    Need to design a real-time notification system:
    - 100k concurrent users
    - Notifications for: messages, likes, comments
    - Must support: web, iOS, Android
    - Latency requirement: < 500ms
    - Budget: $5k/month
  `;

  const config = createTaskConfig({
    taskType: 'design',
    steps: 4,
    stepNames: [
      'Technology Selection',
      'Scalability Design',
      'Cost Analysis',
      'Implementation Plan'
    ],
    defaultArgs: createToTArgs({
      nGenerate: 7,
      nEvaluate: 5,
      nSelect: 3,
      algorithm: 'BFS',
      ratio: '5:5',  // Balanced for diverse perspectives
      maxDepth: 4,
    }),
    promptTemplates: {
      step_0: 'Choose technologies for: {problem}',
      step_1: 'Design scalability for: {tech}',
      step_2: 'Analyze costs for: {design}',
      step_3: 'Create implementation plan for: {solution}',
    },
  });

  const generator = new MockThoughtGenerator();
  const result = await executeBFS(problem, config, generator);

  console.log('=== Architecture Decision ===');
  console.log('Solution:', result.bestThought.text);
  console.log('\nDecision Path:');
  result.path.forEach((thought, i) => {
    console.log(`${i + 1}. ${thought.text}`);
  });
}
```

### Scenario 3: Bug Root Cause Analysis

```typescript
async function rootCauseAnalysis() {
  const problem = `
    Production bug report:
    - Users can't upload files > 5MB
    - Error: "Request entity too large"
    - Started happening after nginx update
    - Works in staging environment
    - Affects 20% of users randomly
  `;

  const config = createTaskConfig({
    taskType: 'debug',
    steps: 5,
    stepNames: [
      'Hypothesis Generation',
      'Evidence Collection',
      'Hypothesis Testing',
      'Root Cause',
      'Fix Verification'
    ],
    defaultArgs: createToTArgs({
      nGenerate: 6,
      nEvaluate: 4,
      nSelect: 3,
      algorithm: 'DFS',  // Use DFS for deep analysis
      ratio: '6:4',  // Claude-heavy for practical debugging
      maxDepth: 5,
      confidenceThreshold: 9.5,
    }),
    promptTemplates: {
      step_0: 'Generate hypotheses for: {problem}',
      step_1: 'What evidence to collect for: {hypothesis}',
      step_2: 'How to test: {hypothesis}',
      step_3: 'What is the root cause of: {evidence}',
      step_4: 'How to verify fix for: {cause}',
    },
  });

  const generator = new MockThoughtGenerator();
  const result = await executeDFS(problem, config, generator);

  console.log('=== Root Cause Analysis ===');
  console.log('Root Cause:', result.bestThought.text);
  console.log(`Confidence: ${result.bestThought.confidence}`);
  console.log(`\nAnalysis Depth: ${result.bestThought.depth}`);
  console.log(`Total hypotheses explored: ${result.allThoughts.length}`);
}
```

## Best Practices

### 1. Choose the Right Algorithm

- **BFS**: When you need to explore all options at each level
- **DFS**: When you need deep analysis with limited memory
- **Best-First**: When you have a good heuristic function

### 2. Configure Parameters Appropriately

```typescript
// For quick exploration
const quickConfig = createToTArgs({
  nGenerate: 3,
  nEvaluate: 2,
  nSelect: 2,
  maxDepth: 3,
});

// For thorough analysis
const thoroughConfig = createToTArgs({
  nGenerate: 7,
  nEvaluate: 5,
  nSelect: 4,
  maxDepth: 6,
});

// For deep dive
const deepConfig = createToTArgs({
  nGenerate: 5,
  nEvaluate: 3,
  nSelect: 2,
  algorithm: 'DFS',
  maxDepth: 10,
});
```

### 3. Use Caching for Repeated Problems

```typescript
const args = createToTArgs({
  enableCache: true,  // Reuse evaluation results
  // ... other config
});
```

### 4. Monitor Performance

```typescript
async function monitoredExecution() {
  const start = Date.now();

  const result = await executeBFS(problem, config, generator);

  const duration = Date.now() - start;
  const thoughtsPerSecond = result.allThoughts.length / (duration / 1000);

  console.log(`Execution time: ${duration}ms`);
  console.log(`Thoughts/second: ${thoughtsPerSecond.toFixed(2)}`);
  console.log(`Efficiency: ${result.path.length}/${result.allThoughts.length} thoughts used`);
}
```

## Troubleshooting

### Common Issues

**1. No solution found**
```typescript
// Increase search parameters
const config = createToTArgs({
  nGenerate: 10,  // Generate more options
  maxDepth: 8,    // Search deeper
  confidenceThreshold: 8.0,  // Lower threshold
});
```

**2. Too slow**
```typescript
// Reduce search space
const config = createToTArgs({
  nGenerate: 3,
  nEvaluate: 2,
  nSelect: 2,
  maxDepth: 4,
  enableCache: true,
});
```

**3. Memory issues**
```typescript
// Use DFS instead of BFS
const config = createToTArgs({
  algorithm: 'DFS',  // More memory efficient
  maxDepth: 6,
});
```

---

For more examples, see the [test files](../packages/core/tests/) in the repository.
