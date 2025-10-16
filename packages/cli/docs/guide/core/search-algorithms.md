# ToT Search Algorithms

## 🔍 Search Algorithm Guide

Comparison and selection guide for 3 core search algorithms used in Tree of Thought

**Implementation Code:**
- BFS implementation: `bfs-implementation.md`
- DFS implementation: `dfs-implementation.md`
- Best-First: BFS variant (using priority queue)

## 🌊 BFS (Breadth-First Search)

### Characteristics
```markdown
- Equal exploration of all options
- Complete level exploration before next
- Optimal solution guaranteed (with sufficient exploration)
```

### Structure
```markdown
     [Problem]         Level 0
    /    |    \
   A     B     C       Level 1 (all explored)
  /|    /|    /|
 A1 A2 B1 B2 C1 C2     Level 2 (all explored)
```

### Process
```markdown
1. Level 1: Generate all initial thoughts
   → [A, B, C, D, E] 5 generated
   → [Claude]: 3 thoughts (Korean)
   → [Codex]: 2 thoughts (Korean)

2. Evaluation and selection
   → Select top 3: [A:8.5, B:7.9, C:7.2]

3. Level 2: Expand each selected thought
   → A: [A1, A2, A3]
   → B: [B1, B2, B3]
   → C: [C1, C2, C3]

4. Re-evaluate and select
   → Top 3 from 9: [A2:9.1, B1:8.7, A1:8.3]

5. Level 3: Final implementation details
```

### Best For
```markdown
✅ Uncertain correct answer
✅ Need equal consideration of possibilities
✅ Time available for exploration
✅ Need complete picture
```

### BFS Progress Display
```markdown
🌊 BFS Progress
Level 1: [■■■■■] 5/5 complete
├─ [Claude]: 3 thoughts
└─ [Codex]: 2 thoughts
Level 2: [■■■□□] 3/5 exploring
Level 3: [□□□□□] 0/5 pending

Queue: [A2, B1, C3, ...]
Visited: 8 nodes
Best so far: A2 (score: 9.1)
```

## 🎯 DFS (Depth-First Search)

### Characteristics
```markdown
- Explore one path to completion
- Backtrack when stuck
- Fast solution discovery possible
```

### Structure
```markdown
     [Problem]
        |
        A         (Select A)
        |
       A2         (Select A2)
        |
      A2-impl     (Complete implementation)
        ↑
    (Backtrack to B if needed)
```

### Process
```markdown
1. Select most promising thought
   → Select A (score: 8.5)

2. Explore A to completion
   → A → A2 → A2-implementation

3. Evaluate result
   → Satisfied: Done
   → Unsatisfied: Backtrack

4. Backtracking (if needed)
   → Try A → A3
   → Or start B path

5. Repeat
```

### Best For
```markdown
✅ Need quick prototype
✅ One direction highly promising
✅ Memory constraints
✅ Need immediate feedback
```

### DFS Progress Display
```markdown
🎯 DFS Progress
Current Path: Root → [C]A → [C]A2 → Implementation
Model: Claude (practical approach)
Depth: 3/4
Stack: [A2-impl, A2, A, Root]
Backtrack count: 0
Status: Exploring...

Alternative paths ready:
- [X]B (score: 7.9) - Codex
- [C]C (score: 7.2) - Claude
```

## ⭐ Best-First Search

### Characteristics
```markdown
- Priority queue based on evaluation scores
- Combines BFS and DFS advantages
- Efficient exploration
```

### Structure
```markdown
     [Problem]
    /    |    \
[C]A(8.5) [X]B(7.9) [C]C(7.2)
     ↓ (highest score)
   A expanded
   /     \
[C]A1(9.1) [C]A2(7.8)
  ↓ (global highest)
A1 expanded
```

### Process
```markdown
1. Initialize priority queue
   PQ: []

2. Add initial thoughts with model attribution
   PQ: [([X]A:8.5), ([C]B:7.9), ([C]C:7.2)]

3. Select and expand highest score node
   Select: [X]A
   Expand: A1(9.1), A2(7.8)
   PQ: [([X]A1:9.1), ([C]B:7.9), ([X]A2:7.8), ([C]C:7.2)]

4. Select highest again
   Select: [X]A1
   Expand: A1-impl1(9.3), A1-impl2(8.9)

5. Repeat until goal reached
```

### Best For
```markdown
✅ Clear evaluation criteria
✅ Efficiency important
✅ Large search space
✅ Reliable heuristics
```

### Best-First Progress Display
```markdown
⭐ Best-First Progress
Priority Queue (top 5):
1. [X]A1-impl (9.3) 🔥 - Codex
2. [X]A1 (9.1) - Codex
3. [C]B2 (8.7) - Claude
4. [X]A2 (7.8) - Codex
5. [C]B (7.9) - Claude

Explored: 12 nodes
Current best: [X]A1-impl
Model contribution: Codex 60%, Claude 40%
Efficiency: 85% (avoided 23 nodes)
```

## 🔄 Algorithm Selection Guide

### Quick Decision Tree
```markdown
Severe time constraint?
  Yes → DFS
  No ↓

Need complete option review?
  Yes → BFS
  No ↓

Have clear evaluation criteria?
  Yes → Best-First
  No → BFS
```

### Situation-Based Recommendations
```markdown
🐛 Bug Fixing
  - Urgent: DFS
  - Normal: Best-First
  - Complex: BFS

♻️ Refactoring
  - Small: DFS
  - Large: BFS
  - High risk: BFS

🏗️ Architecture Design
  - Initial: BFS
  - Improvement: Best-First
  - Experimental: DFS
```

## 🎮 Hybrid Strategies

### Iterative Deepening
```markdown
Progressively increase depth:

Round 1: Depth 1 only (BFS)
Round 2: Depth 2 (BFS)
Round 3: Depth 3 (BFS)

Advantage: Memory efficient + completeness
```

### Beam Search
```markdown
Keep only top K at each level:

Level 1: Generate 5 → Select top 3
Level 2: Generate 9 → Select top 3
Level 3: Generate 9 → Select top 1

Advantage: BFS completeness + efficiency
```

### A* Inspired
```markdown
f(n) = g(n) + h(n)

g(n): Cost so far
h(n): Estimated remaining cost

Priority = actual_score + potential_score

Advantage: Fast optimal path discovery
```

## 📊 Performance Comparison

```markdown
| Algorithm | Time     | Space    | Complete | Optimal |
|-----------|----------|----------|----------|---------|
| BFS       | O(b^d)   | O(b^d)   | ✅       | ✅      |
| DFS       | O(b^m)   | O(bm)    | ❌       | ❌      |
| Best-F    | O(b^d)   | O(b^d)   | ❌       | ❌      |

b: branching factor
d: goal depth
m: maximum depth
```

## 🛠️ Algorithm Configuration

```yaml
# BFS Configuration
bfs_config:
  branching_factor: 5
  selection_ratio: 0.6
  level_timeout: 30s
  model_balance:
    claude: 3
    codex: 2

# DFS Configuration
dfs_config:
  max_depth: 5
  backtrack_threshold: 3.0
  timeout_per_path: 60s
  prefer_model: auto  # claude/codex/auto

# Best-First Configuration
best_first_config:
  queue_size: 20
  expansion_limit: 3
  score_threshold: 7.0
  model_weight:
    claude: 1.0
    codex: 1.1  # Slight preference for technical
```

## 💡 Practical Tips

### Stopping Criteria
```markdown
✋ When to stop:
- Satisfactory solution found
- Time/resource limit reached
- All paths below threshold
- User interruption
```

### Path Recording
```markdown
📝 Record:
- Selected paths and reasons
- Abandoned paths and reasons
- Evaluation scores at each step
- Backtracking points
- Model attribution for each decision
```

### Learning and Improvement
```markdown
📈 Improvement points:
- Analyze successful path patterns
- Identify failure causes
- Adjust evaluation criteria
- Tune algorithm parameters
- Balance model contributions
```

## 🤖 Model-Aware Search

### Claude-Preferred Paths
```markdown
When Claude thoughts dominate:
- Practical implementation focus
- User experience priority
- Risk mitigation emphasis
- Business value optimization
```

### Codex-Preferred Paths
```markdown
When Codex thoughts dominate:
- Technical optimization needed
- Algorithm complexity
- Performance critical
- System architecture focus
```

### Balanced Exploration
```markdown
Hybrid advantage:
- Claude provides practicality check
- Codex provides technical depth
- Combined evaluation more robust
- Diverse solution space coverage
```

---

## 🔗 Related Documents

### Concepts and Strategy
- `tot-framework.md`: Overall ToT framework
- `evaluation-concepts.md`: Evaluation and selection philosophy

### Implementation
- `bfs-implementation.md`: BFS algorithm implementation code
- `dfs-implementation.md`: DFS algorithm implementation code
- `task-system.md`: Task system implementation

### Execution Environment
- `claude-code-execution.md`: Claude Code CLI execution flow
- `codex-mcp-integration.md`: Codex MCP integration

---

*Algorithm selection depends on problem characteristics and constraints. Discover optimal strategies through experimentation and experience.*