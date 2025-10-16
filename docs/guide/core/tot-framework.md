# Tree of Thought Core Framework

## 🎯 Core Principles

Tree of Thought is a framework for **deliberate and systematic problem solving**.
**By default, it operates in Hybrid mode with Claude and Codex collaboration** for deeper and more diverse solutions.

## 🌳 Framework Structure

### STEP 1: Thought Generation (Hybrid Default)

```markdown
Default Hybrid mode: Claude 3 + Codex 2 = Total 5 thoughts

[Claude] Generated Thoughts (3):
1. **[Claude] Practical Approach**
   - 빠른 구현 가능
   - 검증된 방법론
   - 낮은 리스크

2. **[Claude] Balanced Approach**
   - 중간 복잡도
   - 적절한 효과

3. **[Claude] Creative Approach**
   - 새로운 시도
   - 높은 효과 기대

[Codex] Generated Thoughts (2):
4. **[Codex] Technical Optimization**
   - 깊은 알고리즘 분석
   - 성능 극대화

5. **[Codex] Innovative Solution**
   - 최신 기술 적용
   - 근본적 해결

Single AI Mode:
- Claude only (-c): 3-5 thoughts
- Codex only (-x): 2-3 thoughts
```

#### Model Role Distribution

```yaml
Claude Role:
  - Fast initial analysis
  - Practical approaches
  - Domain knowledge utilization
  - Business logic focus
  - User experience priority

Codex Role:
  - Deep technical analysis
  - Innovative approaches
  - Algorithm optimization
  - System architecture
  - Performance tuning
```

### STEP 2: Evaluation (Cross-Validation)

```markdown
Evaluate each approach using these criteria:

| Approach | Model | Feasibility | Impact | Risk | Complexity | Total Score |
|----------|-------|------------|--------|------|------------|-------------|
| Approach 1 | Claude | 8/10 | 9/10 | 3/10 | 5/10 | 7.5 |
| Approach 2 | Claude | 6/10 | 7/10 | 2/10 | 7/10 | 5.5 |
| Approach 3 | Claude | 5/10 | 8/10 | 6/10 | 8/10 | 6.2 |
| Approach 4 | Codex | 7/10 | 9/10 | 4/10 | 9/10 | 7.8 |
| Approach 5 | Codex | 6/10 | 10/10 | 5/10 | 9/10 | 7.6 |

Formula: (Feasibility×0.3 + Impact×0.4 + (10-Risk)×0.2 + (10-Complexity)×0.1)

Cross-Validation Benefits:
1. Claude validates Codex technical feasibility
2. Codex validates Claude performance impact
3. Combined perspective reduces blind spots
4. Diverse solution space coverage
```

### STEP 3: Branch Selection (BFS Strategy)

```markdown
Select top [K] approaches:
✅ Selected Approaches:
   1. [Codex] Technical Optimization - Score: 7.8
   2. [Codex] Innovative Solution - Score: 7.6
   3. [Claude] Practical Approach - Score: 7.5

❌ Pruned Approaches:
   - [Claude] Creative Approach: Too risky
   - [Claude] Balanced Approach: Low score

Diversity Check:
- At least 1 Claude + 1 Codex thought
- Different approach types
```

### STEP 4: Depth Exploration

```markdown
Tree Structure:
        [Problem]
       /    |    \
   [X]4   [X]5   [C]1     (Selected branches)
    /\     /\     /\
   S1 S2  S3 S4  S5 S6    (Solution refinements)
    |      |      |
   ✓      ✓      ✓        (Final evaluations)
           ↑
    [OPTIMAL PATH]

Legend: [C]=Claude, [X]=Codex, ✓=Evaluated

Level-by-Level Collaboration:
- Level 1: Multi-AI thought generation
- Level 2: Each AI deepens its own thoughts
- Level 3: Integrated evaluation and selection
```

### STEP 5: Path Optimization

```markdown
🏆 Final Selected Path:
[Problem] → [Codex] Technical Optimization → Solution S3 → Implementation

📊 Selection Rationale:
- Strengths: Maximum performance, scalability
- Weaknesses: Implementation complexity
- Alternatives: Claude's practical approach
- Risk Mitigation: Phased deployment
- Model Contribution: Codex 60%, Claude 40%
```

## 🔄 Iteration Process

### Backtracking
```markdown
When current path hits dead end:
1. Return to parent node
2. Select next best option
3. Explore new path
4. Re-evaluate scores
```

### Lookahead
```markdown
Preview next steps:
- Predict impact of current choice
- Identify potential obstacles
- Prepare alternative paths
```

## 📊 Progress Display

```markdown
🌳 Tree of Thought Progress
├─ Level 1: ████████████ 100% (5/5 thoughts generated)
│   ├─ [Claude]: 3 thoughts
│   └─ [Codex]: 2 thoughts
├─ Level 2: ████████░░░░ 66% (2/3 selected, exploring)
└─ Level 3: ████░░░░░░░░ 33% (1/3 paths validated)

⏱️ Estimated time remaining: ~2 minutes
```

## 🎨 Visualization

```markdown
        [Problem]
       /    |    \
    🟢[C]  🟡[C]  🔵[X]    (🟢 Claude high, 🟡 Claude med, 🔵 Codex)
    / \     |      / \
   S1  S2   S3    S4  S5    (Solutions)
   |    |   |     |   |
   ✅   🚧  🚧   ✅  ❌     (✅ Complete, 🚧 In progress, ❌ Pruned)
        ↑
  [SELECTED PATH]
```

## 🛠️ Configuration

```yaml
# Default configuration
tot_config:
  max_depth: 3          # Maximum tree depth
  branching_factor: 5   # Branches per level
  selection_ratio: 0.6  # Select top 60%
  algorithm: BFS        # BFS/DFS/Best-First

  # Model distribution (Hybrid mode default)
  model_distribution:
    claude: 3           # Claude thoughts
    codex: 2           # Codex thoughts

  evaluation_weights:
    feasibility: 0.3    # Implementation feasibility
    impact: 0.4        # Expected impact
    risk: 0.2          # Risk factor
    complexity: 0.1    # Implementation complexity

  display:
    show_progress: true # Show progress bar
    show_model: true   # Show model attribution
    verbose: true      # Detailed logging
    interactive: true  # User confirmation
```

## 💬 Interaction Points

```markdown
🔔 User Confirmation Required:
"Level 1 analysis complete. Most promising path is [Codex] Technical Optimization.
Continue with this direction? (Y/N/Custom)"

🔄 Mid-process Adjustment:
"Enter new information to recalculate paths.
Current best: [Codex] Solution S3"

✋ Early Stopping:
"Optimal solution found with 85% confidence.
Continue exploring? (Continue/Stop)"
```

## 📝 Output Format

### Summary Mode
```markdown
ToT Analysis Complete ✅
- Explored paths: 15
- Optimal path: [Codex] → Technical Optimization → S3
- Success probability: 85%
- Model contribution: Codex 60%, Claude 40%
- Time taken: 3 minutes
```

### Detailed Mode
```markdown
[Full tree structure with evaluation scores for each node]
[Model attribution for each thought]
[Complete path history with backtracking]
```

## 🚀 Hybrid Mode Details (Default)

### Command Structure

```bash
# Default = Hybrid mode
/tot debug              # Claude + Codex (default)
/tot refactor           # Claude + Codex (default)
/tot design             # Claude + Codex (default)

# Single AI mode
/tot debug -c           # Claude only
/tot debug -x           # Codex only

# AI ratio adjustment
/tot debug --ratio 3:7  # Codex 70%
/tot debug -r 7:3       # Claude 70%
/tot debug -r 5:5       # Equal (default)
```

### Problem-Specific Strategies

#### Debugging (Default Mix)
```yaml
strategy:
  initial_thoughts:
    claude: ["빠른 수정", "워크어라운드", "리팩토링"]
    codex: ["근본 원인", "성능 분석"]
  ratio: "4:6"  # Codex 우선
  selection: best_combined_score
```

#### Refactoring
```yaml
strategy:
  initial_thoughts:
    claude: ["점진적 개선", "위험 최소화"]
    codex: ["패턴 적용", "구조 개선", "최적화"]
  ratio: "6:4"  # Claude 우선 (안정성)
  selection: balance_risk_reward
```

#### System Design
```yaml
strategy:
  initial_thoughts:
    claude: ["MVP 접근", "사용자 중심", "비즈니스 가치"]
    codex: ["확장성", "기술 스택"]
  ratio: "5:5"  # 균형
  selection: long_term_viability
```

#### Algorithm Optimization
```yaml
strategy:
  initial_thoughts:
    claude: ["간단한 개선"]
    codex: ["복잡도 분석", "자료구조 변경", "알고리즘 대체"]
  ratio: "2:8"  # Codex 중심
  selection: maximum_performance
```

### Dynamic Ratio Adjustment

```bash
# Manual adjustment
/tot debug --ratio 7:3  # More Claude (practical focus)
/tot debug --ratio 3:7  # More Codex (technical focus)
/tot debug --ratio 5:5  # Equal balance (default)
```

```markdown
Automatic adjustment based on problem:
- Error messages mentioning algorithms → Codex +2
- User experience issues → Claude +2
- Performance problems → Codex +1
- Business logic → Claude +1
```

### Hybrid Advantages

#### Complementary Strengths
```markdown
Claude:
✅ Practical implementation
✅ User experience
✅ Business value
✅ Risk assessment
✅ Quick solutions

Codex:
✅ Technical optimization
✅ Algorithm analysis
✅ System architecture
✅ Performance tuning
✅ Deep debugging
```

#### Synergy Examples
```markdown
Example 1: Database Optimization
- Claude: "인덱스 추가로 빠른 개선"
- Codex: "쿼리 플랜 분석 후 파티셔닝"
- Result: Immediate fix + long-term solution

Example 2: API Design
- Claude: "RESTful 표준 준수"
- Codex: "GraphQL로 오버페칭 해결"
- Result: Standard + innovative options

Example 3: Memory Leak
- Claude: "캐시 정리 로직 추가"
- Codex: "Timer 미해제 근본 원인 발견"
- Result: Quick fix + root cause resolution
```

### Performance Metrics

```markdown
Hybrid vs Single Model:

| Metric | Single | Hybrid | Improvement |
|--------|--------|--------|-------------|
| Solution Quality | 7.2 | 8.8 | +22% |
| Coverage | 60% | 95% | +58% |
| Innovation | 6.5 | 9.1 | +40% |
| Practicality | 7.8 | 8.5 | +9% |

Best results when:
- Problem has both technical and practical aspects
- Multiple valid approaches exist
- Trade-offs need evaluation
- Innovation and safety both matter
```

### Advanced Hybrid Features

#### Thought Fusion
```markdown
Combining complementary thoughts:

Claude: "캐싱으로 빠른 응답"
   +
Codex: "비동기 처리로 처리량 증대"
   =
Hybrid: "캐싱 + 비동기로 종합 개선"
```

#### Confidence Calibration
```markdown
Higher confidence when:
- Both models agree on approach
- Scores are consistently high
- Multiple paths lead to same solution

Lower confidence triggers:
- Models disagree significantly
- High variance in evaluations
- Conflicting trade-offs
```

#### Adaptive Exploration
```markdown
If Claude paths fail → Increase Codex ratio
If Codex too complex → Increase Claude ratio
Dynamic adjustment during execution
```

## 🔗 Integration with Other Modules

### Core Implementation
- `bfs-implementation.md`: BFS algorithm actual code
- `dfs-implementation.md`: DFS algorithm actual code
- `task-system.md`: Task interface and implementations
- `evaluation-functions.md`: Evaluation methods (Value/Vote/Hybrid)
- `selection-algorithms.md`: Selection strategies (Greedy/Sample/Hybrid)

### Integration & Execution
- `codex-mcp-integration.md`: Codex MCP integration for Claude Code CLI
- `claude-code-execution.md`: Execution flow in Claude Code environment
- `data-structures.md`: Standard data structures (Thought, ToTArgs, etc.)

### Concepts & Strategy
- `search-algorithms.md`: Algorithm comparison and selection guide
- `evaluation-concepts.md`: Evaluation philosophy and criteria
- `implementation-summary.md`: Overall summary and usage guide

### Templates & Examples
- `templates/*.md`: Problem-specific templates
- `examples/*.md`: Real-world examples

---

## 📌 Quick Reference

### When to Use Hybrid (Default)
```markdown
✅ Complex problems
✅ Unknown solution space
✅ Need diverse perspectives
✅ Risk-sensitive decisions
✅ Innovation with safety
```

### When to Override to Single Model
```markdown
Claude only (-c):
- Quick fixes needed
- User-facing features
- Business logic heavy

Codex only (-x):
- Pure algorithm problems
- Performance optimization
- System architecture
```

### Typical Workflow
```markdown
1. /tot debug "problem description"
2. Review Level 1 thoughts (Claude 3 + Codex 2)
3. System selects top 3 automatically
4. Expand selected thoughts in Level 2
5. Get optimal solution with confidence score
6. Optional: Adjust ratio if needed (/tot debug -r 7:3)
```

---

*Tree of Thought Framework: Combining Claude's practicality with Codex's technical depth for superior problem solving.*
