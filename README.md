# Tree of Thought (ToT)

Systematic problem-solving framework for Claude Code CLI based on Princeton NLP research.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/tree-of-thought-cli)](https://www.npmjs.com/package/tree-of-thought-cli)

## 🌳 What is Tree of Thought?

Tree of Thought (ToT) enables AI to solve complex problems through systematic exploration of solution spaces. Based on [Princeton NLP's research](https://arxiv.org/abs/2305.10601), it:

- **Generates multiple solution paths** at each decision point
- **Evaluates and compares** different approaches systematically
- **Backtracks and explores alternatives** when paths don't work
- **Finds optimal solutions** through structured search

## 🚀 Quick Start

Install the `/tot` command for Claude Code CLI:

```bash
npm install -g tree-of-thought-cli
```

Then use it in Claude Code:
```
/tot "your problem description"
```

### What Gets Installed

- `/tot` command in `~/.claude/commands/`
- Algorithm guides in `~/.claude/tot/core/`
- Problem templates in `~/.claude/tot/templates/`
- Usage examples in `~/.claude/tot/examples/`

### How It Works

Claude Code reads documentation files and implements ToT dynamically. No code execution - purely prompt-based and transparent.

## 🔧 Codex MCP Setup (Optional)

To enable Hybrid mode with Codex MCP for deeper analysis:

### Prerequisites
```bash
# 1. Install Codex MCP
npm install -g @anthropics/codex-mcp

# 2. Login to Codex
codex login

# 3. Add Codex to Claude Code MCP
claude mcp add codex --scope user codex mcp
```

### Verify Installation
```bash
# Check if Codex MCP is configured
claude mcp list
```

You should see `codex` in the MCP server list.

> **💡 Note**: Without Codex MCP configured, `/tot` runs in Claude-only mode (~55s). With Codex MCP, Hybrid mode provides deeper analysis (~90s).

## 📖 Example Usage

### Debug a Memory Leak
```
/tot "Production app memory grows 50MB/hour after user logout"
```

**Output:**
```
Level 1: Generate 5 hypotheses
├─ [8.5] Unclosed event listeners
├─ [9.1] Timer not cleared ⭐
├─ [7.9] Cache not released
...

Level 2: Expand top 3
├─ Timer → [9.5] Search for setInterval ⭐
├─ Timer → [8.8] Search for setTimeout
...

Solution: Found 3 setInterval calls without cleanup
```

### Design System Architecture
```
/tot "Design real-time notification system for 100k concurrent users"
```

### Optimize Performance
```
/tot "Database query takes 5 seconds on 1M+ rows with JOINs"
```

## 🎯 Core Methodology

Based on Princeton ToT paper parameters:

1. **Generate** 5 diverse solution approaches (n_generate=5)
2. **Evaluate** each approach 3 times independently (n_evaluate=3)
3. **Select** top 3 for further exploration (n_select=3)
4. **Search** using BFS or DFS with early stopping
5. **Return** optimal solution path

## ⚡ Execution Modes

### Performance Comparison

| Mode | Codex MCP | Execution Time | AI Distribution | Use Case |
|------|-----------|----------------|-----------------|----------|
| **Claude-Only** (`/tot -c`) | Any | ~55s | Claude 100% | Quick, practical solutions |
| **Hybrid** (`/tot`) | ❌ Not configured | ~55s | Claude 100% | Same as Claude-Only |
| **Hybrid** (`/tot`) | ✅ Configured | ~90s | Claude 60% + Codex 40% | Deep technical analysis |

> **🔑 Key Point**: Codex MCP not configured? Both `/tot` and `/tot -c` perform identically (~55s).

### Mode Details

#### 🚀 Claude-Only Mode
```bash
/tot -c "your problem"           # Force Claude-only
/tot debug -c                    # Debug with Claude
/tot refactor --claude           # Refactor with Claude
```

**Characteristics:**
- **Speed**: ~55 seconds
- **Strengths**: Fast, practical, proven patterns
- **Best for**: Quick fixes, standard problems, time-critical situations

#### 🤖 Hybrid Mode (Claude + Codex)
```bash
/tot "your problem"              # Default mode
/tot debug                       # Debug with both AIs
/tot refactor                    # Refactor with both AIs
/tot --ratio 3:7                 # 30% Claude, 70% Codex
```

**Characteristics:**
- **Speed**: ~90 seconds (with Codex MCP configured)
- **Strengths**: Deep analysis, algorithm optimization, multiple perspectives
- **Best for**: Complex algorithms, performance optimization, novel problems

**AI Distribution:**
- **Claude** (60%): Practical solutions, quick fixes, user experience
- **Codex** (40%): Deep technical analysis, algorithm optimization
- **Ratio**: Configurable via `--ratio` flag (e.g., "5:5", "7:3", "3:7")

### Problem Type Examples

#### Debug Problems
```bash
/tot debug "Memory leak grows 50MB/hour"
/tot -c debug "React component infinite re-render"
```

#### Refactoring
```bash
/tot refactor "PaymentService has 500 lines, needs modularization"
/tot --ratio 7:3 refactor "Extract algorithm to separate module"
```

#### Design & Architecture
```bash
/tot design "Real-time notification system for 100k users"
/tot -c design "API versioning strategy"
```

#### Performance Optimization
```bash
/tot optimize "Database query takes 5s on 1M+ rows"
/tot --ratio 3:7 optimize "Reduce bundle size from 2MB to 500KB"
```

#### Custom Problems
```bash
/tot "How to implement distributed cache invalidation?"
/tot -c "Best approach for handling file uploads in React?"
```

### When to Choose Which Mode

| Scenario | Recommended Mode | Reason |
|----------|------------------|--------|
| Quick bug fix | Claude-Only (`-c`) | Faster, sufficient for common issues |
| Algorithm optimization | Hybrid with Codex ratio high | Deep technical analysis needed |
| Standard refactoring | Claude-Only (`-c`) | Proven patterns work well |
| Novel architecture | Hybrid (default) | Multiple perspectives valuable |
| Time-critical | Claude-Only (`-c`) | 35 seconds faster |
| Research-oriented | Hybrid with Codex ratio high | Cutting-edge approaches |

## 📊 Algorithm Comparison

| Algorithm | Best For | Memory | Speed |
|-----------|----------|--------|-------|
| **BFS** | Comprehensive exploration | High | Medium |
| **DFS** | Deep analysis with backtracking | Low | Fast |

## 📖 Documentation

- [Command Reference](./packages/cli/commands/tot.md) - Full `/tot` usage guide
- [Core Algorithms](./docs/guide/core/) - BFS, DFS, evaluation methods
- [Problem Templates](./docs/guide/templates/) - Debug, refactor, design
- [Usage Examples](./docs/examples/) - Real-world scenarios
- [Output Format](./docs/OUTPUT_FORMAT.md) - Transparent thought display

## 🏗️ Project Structure

```
tree-of-thought/
├── packages/cli/              # npm package
│   ├── commands/tot.md        # Command definition
│   └── scripts/install.js     # Installation script
└── docs/
    ├── guide/
    │   ├── core/              # 15+ algorithm guides
    │   └── templates/         # 6 problem templates
    ├── examples/              # 6 usage examples
    └── OUTPUT_FORMAT.md
```

## 🤝 Contributing

Contributions welcome! Open an issue or pull request.

### Local Development

```bash
git clone https://github.com/youkchansim/tree-of-thought.git
cd tree-of-thought/packages/cli

# Test locally
npm link

# The /tot command will be available in Claude Code
# Make changes to documentation in docs/guide/

# Publish updates
npm version patch
npm publish
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

Based on Princeton NLP's Tree of Thought research:
- [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601) (Yao et al., 2023)
- [Princeton NLP Repository](https://github.com/princeton-nlp/tree-of-thought-llm)

## 📧 Support

- **Issues**: [github.com/youkchansim/tree-of-thought/issues](https://github.com/youkchansim/tree-of-thought/issues)
- **Author**: [@youkchansim](https://github.com/youkchansim)
