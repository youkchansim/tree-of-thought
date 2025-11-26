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

## 🔧 MCP Setup (Optional but Recommended)

Enable **Multi-AI mode** with Gemini and Codex MCP for maximum diversity and deeper analysis:

### Gemini MCP (Architecture & Design Focus)
```bash
# Install Gemini MCP - provides system architecture expertise
claude mcp add gemini-cli -s user -- npx -y gemini-mcp-tool
```

### Codex MCP (Performance & Optimization Focus)
```bash
# 1. Install OpenAI Codex CLI
npm install -g @openai/codex
# or: brew install codex

# 2. Login to Codex
codex login

# 3. Add Codex MCP to Claude Code
claude mcp add codex -s user -- codex mcp-server
```

### Verify Installation
```bash
# Check if MCPs are configured
claude mcp list
```

You should see `gemini-cli` and `codex` in the MCP server list.

> **💡 Note**:
> - **No MCPs**: `/tot` runs in Claude-only mode (~15s, 6 thoughts)
> - **Gemini only**: Claude + Gemini Hybrid mode (~20s)
> - **Codex only**: Claude + Codex Hybrid mode (~25s)
> - **Both MCPs**: Multi-AI mode (~20s, maximum diversity) ✨

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

Based on Princeton ToT paper with Multi-AI enhancements:

1. **Generate** 6 diverse solution approaches (n_generate=6)
   - Multi-AI: 2 Claude + 2 Gemini + 2 Codex
   - Hybrid: 3 from each of 2 AIs
   - Single: 6 from one AI
2. **Evaluate** each approach 3 times independently (n_evaluate=3)
3. **Select** top 3-4 for further exploration (n_select=3-4)
4. **Search** using BFS or DFS with early stopping
5. **Return** optimal solution path

### AI Role Differentiation

- **Claude**: Practical, user-focused, proven patterns
- **Gemini**: Innovative architecture, creative system design
- **Codex**: Algorithm optimization, performance analysis

This prevents thought overlap and maximizes solution diversity.

## ⚡ Execution Modes

### Performance Comparison

| Mode | MCPs Required | Execution Time | AI Distribution | Use Case |
|------|---------------|----------------|-----------------|----------|
| **Multi-AI** (Default) | Gemini + Codex | ~20s | Claude 33% + Gemini 33% + Codex 33% | Maximum diversity ✨ |
| **Hybrid CG** (`--hybrid cg`) | Gemini | ~18s | Claude 50% + Gemini 50% | Practical + Architecture |
| **Hybrid CX** (`--hybrid cx`) | Codex | ~22s | Claude 50% + Codex 50% | Practical + Performance |
| **Hybrid GX** (`--hybrid gx`) | Gemini + Codex | ~20s | Gemini 50% + Codex 50% | Architecture + Performance |
| **Claude-Only** (`-c`) | None | ~15s | Claude 100% | Quick, practical solutions |
| **Gemini-Only** (`-g`) | Gemini | ~15s | Gemini 100% | Architecture focus only |
| **Codex-Only** (`-x`) | Codex | ~18s | Codex 100% | Performance focus only |

> **🔑 Key Point**: MCPs not configured? Auto-fallback to Claude-only mode (~15s). All modes work without MCPs!

### Mode Details

#### 🌟 Multi-AI Mode (Claude + Gemini + Codex) - DEFAULT

```bash
/tot "your problem"              # Default: 3 AI perspectives
/tot --ratio 2:2:2               # Equal distribution (default)
/tot --ratio 3:2:1               # Claude-focused
/tot --ratio 1:2:3               # Performance-focused
```

**Characteristics:**
- **Speed**: ~20 seconds (all AIs run in parallel)
- **Thoughts**: 6 total (2 from each AI)
- **Strengths**: Maximum diversity, balanced perspectives, comprehensive coverage
- **Best for**: Complex problems requiring multiple viewpoints

**AI Roles:**
- **Claude** (33%): Practical solutions, proven patterns, quick wins
- **Gemini** (33%): System architecture, creative design, scalability
- **Codex** (33%): Algorithm optimization, performance tuning, profiling

**Auto-Fallback**: If Gemini or Codex unavailable, Claude generates replacement thoughts automatically.

#### 🤝 Hybrid Mode (2 AIs)

```bash
# Claude + Gemini (Practical + Architecture)
/tot --hybrid cg "your problem"

# Claude + Codex (Practical + Performance) - Classic
/tot --hybrid cx "your problem"

# Gemini + Codex (Architecture + Performance)
/tot --hybrid gx "your problem"
```

**Characteristics:**
- **Speed**: ~18-22 seconds
- **Thoughts**: 6 total (3 from each AI)
- **Best for**: Focused expertise in 2 specific areas

#### 🚀 Single-AI Mode

```bash
/tot -c "your problem"           # Claude-only (practical)
/tot -g "your problem"           # Gemini-only (architecture)
/tot -x "your problem"           # Codex-only (performance)
```

**Characteristics:**
- **Speed**: ~15-18 seconds
- **Thoughts**: 6 total (all from one AI)
- **Best for**: Quick analysis, specific expertise needed

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
| Complex system design | Multi-AI (default) | Need practical + architecture + performance |
| Quick bug fix | Claude-Only (`-c`) | Faster, sufficient for common issues |
| Architecture planning | `--hybrid cg` or `-g` | Gemini's design expertise |
| Algorithm optimization | `--hybrid cx` or `-x` | Codex's performance focus |
| Standard refactoring | Claude-Only (`-c`) | Proven patterns work well |
| Novel architecture | Multi-AI (default) | Maximum diversity needed |
| Performance tuning | `--hybrid gx` | Architecture + Optimization |
| Time-critical | Claude-Only (`-c`) | Fastest (~15s) |

## 📊 Algorithm Comparison

| Algorithm | Best For | Memory | Speed |
|-----------|----------|--------|-------|
| **BFS** | Comprehensive exploration | High | Medium |
| **DFS** | Deep analysis with backtracking | Low | Fast |

## 📖 Documentation

### Core Documentation
- [Command Reference](./packages/cli/commands/tot.md) - Full `/tot` usage guide
- [Multi-AI Template](./packages/cli/docs/templates/multi-ai-template.md) - Multi-AI usage patterns
- [Core Algorithms](./docs/guide/core/) - BFS, DFS, evaluation methods
- [Problem Templates](./docs/guide/templates/) - Debug, refactor, design
- [Usage Examples](./docs/examples/) - Real-world scenarios
- [Output Format](./docs/OUTPUT_FORMAT.md) - Transparent thought display

### MCP Integration Guides
- [Gemini MCP Integration](./packages/cli/docs/core/gemini-mcp-integration.md) - Gemini setup & usage
- [Codex MCP Integration](./docs/guide/core/codex-mcp-integration.md) - Codex setup & usage

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
