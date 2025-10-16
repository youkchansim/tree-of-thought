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

### Hybrid Mode (Claude + Codex)

When Codex MCP is available:
- **Claude**: Practical solutions, quick fixes, user experience
- **Codex**: Deep technical analysis, algorithm optimization
- **Ratio**: Configurable (e.g., "5:5", "7:3", "3:7")

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
