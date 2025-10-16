# @tot/cli

CLI installer for Tree of Thought framework - adds `/tot` command to Claude Code.

## Installation

```bash
npm install -g @tot/cli
```

That's it! The `/tot` command is now available in Claude Code.

## Usage

Open Claude Code and use the `/tot` command:

```
/tot "your problem description"
```

### Examples

```bash
# Debug a problem
/tot "Memory leak in production - grows 50MB/hour"

# Design architecture
/tot "Design notification system for 100k users"

# Optimize performance
/tot "Database query takes 5 seconds on large dataset"

# Refactor code
/tot "PaymentService has 500 lines and needs restructuring"
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
- 🔍 **Multiple Approaches**: Generates and evaluates 5 diverse solutions
- 🎯 **Smart Selection**: Chooses top 3 approaches to expand
- 🔄 **Iterative Exploration**: BFS/DFS algorithms for thorough analysis
- 🤖 **Hybrid AI**: Combines Claude + Codex for balanced perspectives

## Requirements

- Node.js 16+
- Claude Code CLI

## Uninstallation

```bash
npm uninstall -g @tot/cli
rm ~/.claude/commands/tot.md
```

## Documentation

- [Tree of Thought Framework](https://github.com/youkchansim/tree-of-thought)
- [Usage Examples](https://github.com/youkchansim/tree-of-thought/blob/main/docs/EXAMPLES.md)
- [Core API Reference](https://github.com/youkchansim/tree-of-thought/blob/main/packages/core/README.md)

## Troubleshooting

### Command not found after installation

The installation script should have copied files to `~/.claude/commands/`. Verify:

```bash
ls ~/.claude/commands/tot.md
```

If the file is missing, try reinstalling:

```bash
npm uninstall -g @tot/cli
npm install -g @tot/cli
```

### Permission errors

If you get permission errors during installation:

```bash
# macOS/Linux
sudo npm install -g @tot/cli

# Or use npx (no global install needed)
npx @tot/cli
```

## Links

- [GitHub Repository](https://github.com/youkchansim/tree-of-thought)
- [Report Issues](https://github.com/youkchansim/tree-of-thought/issues)
- [Core Library (@tot/core)](https://www.npmjs.com/package/@tot/core)

## License

MIT © [youkchansim](https://github.com/youkchansim)
