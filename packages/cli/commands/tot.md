---
name: tot
description: "Tree of Thought - Systematic problem solving through structured exploration"
---

# /tot - Tree of Thought Framework

Systematic problem-solving framework based on Princeton NLP research. Explores multiple solution paths, evaluates approaches, and finds optimal solutions through structured search.

## Quick Start

```
/tot "your problem description"
```

The framework will automatically:
1. Analyze problem type and complexity
2. Generate multiple solution approaches
3. Evaluate each approach systematically
4. Select and expand promising paths
5. Present the optimal solution

## Problem Types

The framework automatically detects and handles:

- **Debug**: Bug analysis and root cause identification
- **Refactor**: Code restructuring and improvement strategies
- **Design**: Architecture and system design decisions
- **Optimize**: Performance and efficiency improvements
- **Custom**: Any problem requiring systematic exploration

## How It Works

### Princeton ToT Methodology

1. **Generation** (n=5)
   - Generate 5 diverse solution thoughts
   - Hybrid: Claude (3) + Codex (2) for balanced perspectives

2. **Evaluation** (n=3)
   - Each thought evaluated 3 times independently
   - Cross-evaluation: Claude evaluates Codex, vice versa
   - Confidence scoring based on evaluation consistency

3. **Selection** (n=3)
   - Select top 3 thoughts based on scores
   - Balance quality with diversity
   - Prepare for next expansion level

4. **Search Algorithm**
   - **BFS** (Breadth-First): Explore all options level-by-level
   - **DFS** (Depth-First): Deep dive with backtracking
   - Early stopping when confidence threshold met

## Examples

### Debug a Memory Leak
```
/tot "Production app has memory leak - grows 50MB/hour, happens after user logout"
```

**Expected Flow:**
- Level 1: Generate 5 hypotheses (event listeners, timers, cache, etc.)
- Level 2: Expand top 3 hypotheses with specific checks
- Level 3: Verify most promising solution
- Result: Actionable fix with root cause identified

### Design System Architecture
```
/tot "Design real-time notification system for 100k concurrent users"
```

**Expected Flow:**
- Level 1: Technology choices (WebSocket, SSE, polling, etc.)
- Level 2: Scalability strategies for top choices
- Level 3: Implementation details and cost analysis
- Result: Complete architecture with trade-offs

### Optimize Database Query
```
/tot "Query takes 5 seconds - SELECT with JOIN on 1M+ rows, no indexes"
```

**Expected Flow:**
- Level 1: Identify bottleneck (missing index, query structure, etc.)
- Level 2: Propose optimizations for each bottleneck
- Level 3: Validate solutions and estimate impact
- Result: Specific optimization with expected improvement

## Integration with @tot/core

This command uses the `@tot/core` library for execution. For programmatic usage:

```javascript
const { executeBFS, DebugTask, MockThoughtGenerator } = require('@tot/core');

const task = new DebugTask();
const generator = new MockThoughtGenerator();
const result = await executeBFS(problem, task.config, generator);
```

See [@tot/core documentation](https://github.com/youkchansim/tree-of-thought) for advanced usage.

## Configuration

Default parameters (aligned with Princeton ToT paper):

```yaml
n_generate: 5        # Generate 5 thoughts per level
n_evaluate: 3        # Evaluate each thought 3 times
n_select: 3          # Keep top 3 for next level
algorithm: BFS       # Breadth-first search
ratio: "3:2"         # Claude:Codex ratio
max_depth: 6         # Maximum search depth
confidence: 9.0      # Early stopping threshold
```

## Tips for Best Results

1. **Be Specific**: Provide context and constraints
   - ❌ "app is slow"
   - ✅ "API endpoint /users takes 3s - 10k users, no caching"

2. **Include Details**: Error messages, metrics, requirements
   - ❌ "fix this bug"
   - ✅ "NullPointerException in UserService.login() after OAuth update"

3. **State Goals**: What success looks like
   - ❌ "improve performance"
   - ✅ "reduce response time from 3s to <500ms without adding servers"

## Technical Details

- **Search Algorithms**: BFS for breadth, DFS for depth
- **Evaluation Methods**: Value (scoring) and Vote (ranking)
- **Selection Strategies**: Greedy, Sample, Hybrid
- **Model Integration**: Claude for practicality, Codex for technical depth
- **Caching**: Evaluation results cached for efficiency

## Limitations

- Does not execute code or make changes automatically
- Requires clear problem description for best results
- Complex problems may take 2-3 minutes to fully explore
- Limited to text-based analysis (no visual debugging)

## Support

- Documentation: https://github.com/youkchansim/tree-of-thought
- Issues: https://github.com/youkchansim/tree-of-thought/issues
- Examples: See `docs/EXAMPLES.md` in repository

---

**Made possible by Princeton NLP's Tree of Thought research**
[Paper: Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601)
