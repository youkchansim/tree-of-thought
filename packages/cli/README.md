# @tot/cli

CLI installer for Tree of Thought framework - adds `/tot` command to Claude Code with **Multi-AI support** (Claude + Gemini + Codex).

## Installation

### Option 1: Global Install (Recommended)

```bash
npm install -g tree-of-thought-cli
```

### Option 2: One-line Install with npx

```bash
npx tree-of-thought-cli
```

That's it! The `/tot` command is now available in Claude Code.

## Update

```bash
npm update -g tree-of-thought-cli
```

> 💡 **Auto Update Check**: The installer automatically checks for new versions and notifies you when updates are available.

### MCP Setup (Optional but Recommended)

For **Multi-AI mode** (Claude + Gemini + Codex), install MCP servers:

```bash
# Install Gemini MCP (for architecture & design)
claude mcp add gemini-cli -s user -- npx -y gemini-mcp-tool

# Install Codex MCP (for performance & optimization)
# Follow Codex MCP setup instructions
```

## Usage

### Multi-AI Mode (Default - Recommended) 🚀

Combines 3 AI perspectives for maximum diversity:

```bash
# Default: Claude + Gemini + Codex (2:2:2)
/tot "Memory leak in production - grows 50MB/hour"

# Custom ratio (Claude-focused: 3:2:1)
/tot --ratio 3:2:1 "Design notification system for 100k users"

# Custom ratio (Performance-focused: 1:2:3)
/tot --ratio 1:1:4 "Database query takes 5 seconds"
```

**Output:** 6 thoughts
- 2 practical solutions (Claude)
- 2 architectural designs (Gemini)
- 2 performance optimizations (Codex)

### Hybrid Mode (2 AIs)

Focus on 2 specific perspectives:

```bash
# Claude + Gemini (Practical + Architecture)
/tot --hybrid cg "Refactor PaymentService with 500 lines"

# Claude + Codex (Practical + Performance) - Classic
/tot --hybrid cx "Optimize image processing pipeline"

# Gemini + Codex (Architecture + Performance)
/tot --hybrid gx "Design high-throughput message queue"
```

### Single-AI Mode

Quick analysis with one AI:

```bash
# Claude-only (practical solutions)
/tot -c "Fix authentication bug"

# Gemini-only (architecture focus)
/tot -g "Design microservices system"

# Codex-only (performance focus)
/tot -x "Reduce API latency to <50ms"
```

## What Gets Installed

This package installs command definitions to `~/.claude/commands/`:

- `tot.md` - Main Tree of Thought command

## How It Works

1. **npm install** runs automatically
2. **postinstall script** copies command files to `~/.claude/commands/`
3. **Claude Code** recognizes the `/tot` command
4. Use `/tot` to solve problems systematically

## Features

- 🌳 **Systematic Problem Solving**: Princeton NLP's Tree of Thought methodology
- 🤖 **Multi-AI Intelligence**: Claude + Gemini + Codex (3 perspectives)
- 🔍 **Maximum Diversity**: 6 thoughts from 3 different AI models
- 🎯 **Smart Selection**: Chooses top 3-4 approaches to expand
- 🔄 **Iterative Exploration**: BFS/DFS algorithms for thorough analysis
- ⚡ **Parallel Execution**: All AIs run simultaneously (~20s)
- 🎛️ **Flexible Modes**: Multi-AI, Hybrid (2 AIs), or Single-AI

### AI Role Differentiation

- **Claude**: Practical, user-focused, proven patterns
- **Gemini**: Innovative architecture, creative system design
- **Codex**: Algorithm optimization, performance analysis

## Requirements

### Required
- Node.js 16+
- Claude Code CLI

### Optional (for Multi-AI mode)
- Gemini MCP: `claude mcp add gemini-cli -s user -- npx -y gemini-mcp-tool`
- Codex MCP: Follow Codex MCP setup guide

**Note:** `/tot` works without MCPs (Claude-only mode) but Multi-AI provides best results.

## Uninstallation

```bash
npm uninstall -g tree-of-thought-cli
rm -rf ~/.claude/commands/tot.md ~/.claude/tot/
```

## Documentation

### Core Documentation
- [Tree of Thought Framework](https://github.com/youkchansim/tree-of-thought)
- [Multi-AI Template](./docs/templates/multi-ai-template.md) - Multi-AI usage patterns
- [Usage Examples](https://github.com/youkchansim/tree-of-thought/blob/main/docs/EXAMPLES.md)

### MCP Integration Guides
- [Gemini MCP Integration](./docs/core/gemini-mcp-integration.md) - Gemini setup & usage
- [Codex MCP Integration](https://github.com/youkchansim/tree-of-thought/blob/main/docs/guide/core/codex-mcp-integration.md) - Codex setup & usage

## Troubleshooting

### Command not found after installation

The installation script should have copied files to `~/.claude/commands/`. Verify:

```bash
ls ~/.claude/commands/tot.md
```

If the file is missing, try reinstalling:

```bash
npm uninstall -g tree-of-thought-cli
npm install -g tree-of-thought-cli
```

### MCP connection issues

If Multi-AI mode falls back to Claude-only:

```bash
# Check Gemini MCP
claude mcp list | grep gemini-cli

# Check Codex MCP
claude mcp list | grep codex

# Reinstall if needed
claude mcp add gemini-cli -s user -- npx -y gemini-mcp-tool
```

**Auto-fallback:** If MCP fails, Claude automatically generates replacement thoughts.

### Permission errors

If you get permission errors during installation:

```bash
# macOS/Linux
sudo npm install -g tree-of-thought-cli

# Or use npx (no global install needed)
npx tree-of-thought-cli
```

### Slow execution

Multi-AI mode takes 15-20s (parallel execution). To speed up:

```bash
# Use Hybrid mode (2 AIs) - ~18s
/tot --hybrid cx "problem"

# Use Claude-only - ~15s
/tot -c "problem"
```

## Links

- [GitHub Repository](https://github.com/youkchansim/tree-of-thought)
- [Report Issues](https://github.com/youkchansim/tree-of-thought/issues)
- [Core Library (@tot/core)](https://www.npmjs.com/package/@tot/core)

## License

MIT © [youkchansim](https://github.com/youkchansim)
