# Tree of Thought (ToT)

A TypeScript implementation of systematic problem-solving framework based on Princeton NLP research.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## 🌳 What is Tree of Thought?

Tree of Thought (ToT) is a framework that enables AI models to solve complex problems through systematic exploration of solution spaces. Based on [Princeton NLP's research](https://arxiv.org/abs/2305.10601), it allows language models to:

- **Generate multiple solution paths** at each decision point
- **Evaluate and compare** different approaches systematically
- **Backtrack and explore alternatives** when paths don't work
- **Find optimal solutions** through structured search

## ✨ Features

- 🎯 **Princeton-Aligned**: Faithful implementation of the original ToT paper
- 🤖 **Claude Code CLI Optimized**: Task tool-based Codex MCP integration
- 📊 **Multiple Search Algorithms**: BFS, DFS with backtracking support
- 🔧 **Flexible Evaluation**: Value, Vote, and Hybrid evaluation methods
- 📦 **Pure Library**: Extensible interface design
- 🧪 **Fully Typed**: TypeScript strict mode support

## 🚀 Quick Start

### For Claude Code Users (Recommended)

Install the `/tot` command directly to Claude Code:

```bash
npm install -g @tot/cli
```

Then use it in Claude Code:
```
/tot "your problem description"
```

See [@tot/cli README](./packages/cli/README.md) for details.

### For Library Users

#### Installation

```bash
# Clone the repository
git clone https://github.com/youkchansim/tree-of-thought.git
cd tree-of-thought

# Install dependencies
pnpm install

# Build
pnpm build
```

#### Basic Usage

```typescript
import {
  MockThoughtGenerator,
  executeBFS,
  DebugTask
} from '@tot/core';

// 1. Configure task
const debugTask = new DebugTask();
const config = debugTask.config;

// 2. Create thought generator
const generator = new MockThoughtGenerator();

// 3. Define problem
const problem = "Find the root cause of memory leak in production";

// 4. Execute BFS search
const result = await executeBFS(problem, config, generator);

// 5. Get results
console.log('Best solution:', result.bestThought.text);
console.log('Search path:', result.path);
console.log('Total thoughts generated:', result.allThoughts.length);
```

### Claude Code CLI Integration

See `packages/core/src/generators/claude-code.example.ts` for Task tool integration.

```typescript
import { ThoughtGenerator } from '@tot/core';

class ClaudeCodeThoughtGenerator implements ThoughtGenerator {
  async generate(problem, currentThoughts, depth, args) {
    // Integrate with Codex MCP using Task tool
    // See claude-code.example.ts for implementation details
  }
}
```

## 📖 Documentation

- **[Core API Reference](./packages/core/README.md)** - @tot/core API documentation
- **[Output Format](./docs/OUTPUT_FORMAT.md)** - Detailed output format specification
- **[Examples](./docs/EXAMPLES.md)** - Real-world usage examples
- **[Architecture](./docs/ARCHITECTURE.md)** - Design structure and principles
- **[Integration Guide](./docs/INTEGRATION.md)** - Claude Code CLI integration

## 🏗️ Architecture

```
tree-of-thought/
├── packages/
│   └── core/                    # Core ToT library
│       ├── src/
│       │   ├── types/          # Type system and data structures
│       │   ├── evaluation/     # Evaluation functions (Value, Vote, Hybrid)
│       │   ├── selection/      # Selection algorithms (Greedy, Sample, etc.)
│       │   ├── generators/     # ThoughtGenerator interface
│       │   ├── algorithms/     # Search algorithms (BFS, DFS)
│       │   └── tasks/          # Task system (Debug, Refactor, etc.)
│       └── dist/               # Build output
├── original-tot/               # Original documentation backup
└── docs/                       # Usage documentation
```

## 🎯 How It Works

1. **Problem Analysis**: Understand the problem and choose appropriate task type
2. **Thought Generation**: Generate multiple solution approaches (typically 5)
3. **Evaluation**: Score each thought using Value or Vote method (3 evaluations each)
4. **Selection**: Choose top thoughts (typically top 3) to explore further
5. **Tree Traversal**: Expand selected thoughts using BFS, DFS, or Best-First
6. **Solution**: Return the optimal path through the thought tree

### Example: Debugging a Memory Leak

```
Problem: "Memory leak in production"
    ↓
Level 1: Generate 5 hypotheses
├─ [8.5] Unclosed event listeners
├─ [9.1] Timer not cleared ⭐
├─ [7.9] Cache not released
├─ [6.2] Global variable accumulation
└─ [7.5] Closure circular reference
    ↓
Level 2: Expand top 3 (Timer, Event, Cache)
├─ Timer → [9.5] Search for setInterval ⭐
├─ Timer → [8.8] Search for setTimeout
├─ Event → [8.2] Check event listeners
    ↓
Level 3: Verify solution
└─ [9.7] Search entire codebase for uncleaned timers ⭐
    ↓
Solution: Found 3 setInterval calls without cleanup
```

## 🔧 Configuration

Princeton ToT Parameters:

```typescript
interface ToTArgs {
  // Generation parameters
  nGenerate: number;        // Number of thoughts to generate per step
  nEvaluate: number;        // Number of evaluations per thought
  nSelect: number;          // Number of thoughts to select for next step

  // Search strategy
  algorithm: 'BFS' | 'DFS' | 'best-first';
  methodGenerate: 'propose' | 'sample';
  methodEvaluate: 'value' | 'vote';
  methodSelect: 'greedy' | 'sample' | 'hybrid';

  // AI model ratio (Claude:Codex)
  ratio: string;            // e.g., "3:2", "5:5"

  // Optimization options
  maxDepth: number;
  confidenceThreshold: number;
  enableCache: boolean;
  enableParallel: boolean;
}
```

## 📊 Algorithm Comparison

| Algorithm | Characteristics | Memory | Speed | Optimality |
|-----------|----------------|--------|-------|------------|
| **BFS** | Level-by-level exploration | High | Medium | Guaranteed within depth limit |
| **DFS** | Depth-first + Backtracking | Low | Fast | With early stopping |
| **Best-First** | Heuristic-based | Medium | Fast | Heuristic-dependent |

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/youkchansim/tree-of-thought.git
cd tree-of-thought

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test

# Start development
pnpm dev
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project is based on Princeton NLP's Tree of Thought research:
- [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601)
- [Princeton NLP GitHub Repository](https://github.com/princeton-nlp/tree-of-thought-llm)

## 📧 Contact

- GitHub Issues: [tree-of-thought/issues](https://github.com/youkchansim/tree-of-thought/issues)
- Author: [@youkchansim](https://github.com/youkchansim)
