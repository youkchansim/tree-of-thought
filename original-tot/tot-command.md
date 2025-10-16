# tot

Tree of Thought (ToT) - Systematic Problem Solving Framework

## Usage

```bash
/tot [type] [options] "problem description"
/tot "problem description"  # auto type detection
```

## Types

- `debug` - Bug analysis and resolution
- `refactor` - Refactoring strategy formulation
- `design` - Architecture design
- `custom` - Custom problem solving

## Options

### AI Model Selection
- `-c, --claude` - Claude-only mode
- `-x, --codex` - Codex-only mode
- `-r, --ratio <C:X>` - AI ratio adjustment (Claude:Codex)
- No option - Hybrid mode (default: Claude 3 + Codex 2)

### Princeton ToT Parameters
- `-n, --n-generate <N>` - Number of thoughts to generate (default: 5)
- `-e, --n-evaluate <N>` - Number of evaluations per thought (default: 3)
- `-s, --n-select <N>` - Number of thoughts to select (default: 3)
- `-a, --algorithm <BFS|DFS|best-first>` - Search algorithm (default: BFS)
- `-t, --temperature <0.0-1.0>` - Sampling temperature (default: 0.7)

### Generation & Evaluation Methods
- `--method-generate <propose|sample>` - Generation method (default: propose)
- `--method-evaluate <value|vote>` - Evaluation method (default: value)
- `--method-select <greedy|sample>` - Selection method (default: greedy)

## Examples

```bash
# Hybrid mode with default parameters (Princeton-style)
/tot debug "memory leak issue"

# Claude-only with custom parameters
/tot debug -c -n 3 -s 2 "quick bug fix"

# Codex-only with deep exploration
/tot debug -x -n 4 -e 5 "algorithm optimization"

# Custom ratio with Princeton parameters
/tot debug -r 3:7 -a best-first "performance optimization"

# Full Princeton configuration
/tot debug \
  --n-generate 6 \
  --n-evaluate 3 \
  --n-select 2 \
  --algorithm BFS \
  --method-generate propose \
  --method-evaluate value \
  --method-select greedy \
  "complex system issue"

# Auto detection with defaults
/tot "app is too slow"
```

## Execution Process (Princeton-Aligned)

This command executes the Tree of Thought framework following Princeton NLP methodology:

1. **Problem Analysis**: Identify problem type and complexity
2. **Parameter Configuration**: Apply Princeton ToT parameters
3. **Thought Generation** (`n_generate_sample`):
   - Hybrid: Claude(3) + Codex(2) = 5 thoughts (default)
   - Method: `propose` or `sample`
   - Output: Korean language thoughts
4. **Evaluation** (`n_evaluate_sample`):
   - Each thought evaluated 3 times (default)
   - Method: `value` (scoring) or `vote` (ranking)
   - Model attribution: [Claude] or [Codex]
5. **Selection** (`n_select_sample`):
   - Select top 3 thoughts (default)
   - Method: `greedy` (deterministic) or `sample` (probabilistic)
6. **Tree Traversal**:
   - Algorithm: BFS (default), DFS, or Best-First
   - Expand selected thoughts iteratively
7. **Path Optimization**: Choose and implement optimal solution path

## Configuration Defaults

```yaml
tot_config:
  # Princeton parameters
  n_generate_sample: 5
  n_evaluate_sample: 3
  n_select_sample: 3

  # Methods
  method_generate: propose
  method_evaluate: value
  method_select: greedy

  # Search
  algorithm: BFS
  temperature: 0.7

  # Model distribution (Hybrid default)
  model_ratio:
    claude: 3
    codex: 2

  # Output
  thought_language: korean
  framework_language: english
```

## Framework Components

ToT framework location: `~/.claude/tot/`

### Core Concepts
- `core/tot-framework.md` - ToT Framework (with Hybrid mode)
- `core/search-algorithms.md` - Algorithm comparison and selection guide
- `core/evaluation-concepts.md` - Evaluation and selection philosophy

### Implementation
- `core/bfs-implementation.md` - BFS algorithm actual code
- `core/dfs-implementation.md` - DFS algorithm actual code
- `core/task-system.md` - Task system implementation
- `core/evaluation-functions.md` - Evaluation functions (Value/Vote/Hybrid)
- `core/selection-algorithms.md` - Selection algorithms (Greedy/Sample)
- `core/codex-mcp-integration.md` - Codex MCP integration (Claude Code CLI)
- `core/claude-code-execution.md` - Claude Code CLI execution flow
- `core/data-structures.md` - Standard data structures

### Summary & Guide
- `core/implementation-summary.md` - Complete summary and usage guide

### Templates & Examples
- `templates/[type]-template.md` - Problem-specific templates (debug/refactor/design)
- `examples/*.md` - Real-world examples

---

Now starting Princeton-aligned Tree of Thought. What problem would you like to solve?