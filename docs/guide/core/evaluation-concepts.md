# ToT Evaluation & Selection Concepts

Philosophy and criteria for evaluating and selecting thoughts in the Tree of Thought system

## 🎯 Overview

The core of ToT is **correct evaluation and selection**. Each thought is systematically evaluated, and the most promising path is selected to reach the optimal solution.

---

## 📊 Part 1: Evaluation Criteria

### 4 Core Evaluation Metrics

#### 1. Feasibility (Implementation Feasibility)
**Weight: 30%**

```markdown
Scoring Criteria:
10 points - Simple parameter/configuration changes
9 points  - Single file modification (<50 lines)
8 points  - 1-2 file modifications (50-200 lines)
7 points  - 3-5 file modifications (200-500 lines)
6 points  - New feature/module addition
5 points  - Complex algorithm implementation
4 points  - Large-scale refactoring (10+ files)
3 points  - Architecture change required
2 points  - External dependencies/APIs needed
1 point   - Human intervention/testing required

Evaluation Items:
□ Number of code lines to modify/add
□ Number of files affected
□ Ability to reuse existing code patterns
□ AI's domain understanding
□ Testing/validation complexity
```

#### 2. Impact (Improvement Effect)
**Weight: 30%**

```markdown
Scoring Criteria (Quantitative %):
10 points - 90-100% improvement
9 points  - 80-89% improvement
8 points  - 70-79% improvement
7 points  - 60-69% improvement
6 points  - 50-59% improvement
5 points  - 40-49% improvement
4 points  - 30-39% improvement
3 points  - 20-29% improvement
2 points  - 10-19% improvement
1 point   - <10% improvement

Measurement Areas:
□ Error rate reduction
□ Performance increase
□ Accuracy improvement
□ User satisfaction increase
□ Resource usage optimization
```

#### 3. Risk (Risk Level)
**Weight: 20%**

```markdown
Scoring Criteria:
10 points - No side effects
9 points  - Minimal impact (<1% performance)
8 points  - Low impact (1-3% performance)
7 points  - Acceptable impact (3-5% performance)
6 points  - Medium impact (minor adjustments needed)
5 points  - Notable impact (configuration changes needed)
4 points  - Significant impact (affects other features)
3 points  - Major impact (refactoring required)
2 points  - Severe impact (breaking changes)
1 point   - System-wide impact

Impact Categories:
⚠️ Performance degradation
⚠️ Memory usage increase
⚠️ API compatibility
⚠️ User workflow changes
⚠️ Data migration necessity
```

#### 4. Complexity (Implementation Complexity)
**Weight: 20%**

```markdown
Scoring Criteria:
10 points - Fully automatable testing
9 points  - Simple unit tests sufficient
8 points  - Integration testing required
7 points  - Simulation/mock data sufficient
6 points  - Real data testing required
5 points  - Manual validation required
4 points  - Complex test scenarios
3 points  - Production-like environment needed
2 points  - User acceptance testing required
1 point   - Long-term monitoring required

Testing Elements:
📈 Test case complexity
📈 Data preparation effort
📈 Environment setup necessity
📈 Result validation clarity
📈 Regression test coverage
```

### Total Score Calculation Formula

```python
Total Score = (Feasibility × 0.3) + (Impact × 0.3) +
              (Risk × 0.2) + (Complexity × 0.2)
```

### Calculation Example

```markdown
Example: GPS Warp Detection Enhancement

- Feasibility: 9점 (2 file modifications, <100 lines)
- Impact: 7점 (60% error reduction)
- Risk: 9점 (minimal performance impact)
- Complexity: 10점 (fully automatable with JSON data)

Total Score = (9×0.3) + (7×0.3) + (9×0.2) + (10×0.2)
            = 2.7 + 2.1 + 1.8 + 2.0
            = 8.6 points ✅
```

### Dynamic Weight Adjustment

```yaml
# Quick Fix Mode
weights_quick:
  feasibility: 0.5   # Easy implementation critical
  impact: 0.2        # Some improvement acceptable
  risk: 0.2          # Safety important
  complexity: 0.1    # Quick validation

# Maximum Impact Mode
weights_impact:
  feasibility: 0.2
  impact: 0.5        # Maximize improvement
  risk: 0.1          # Accept some risk
  complexity: 0.2    # Must be measurable

# Safe Refactoring Mode
weights_safe:
  feasibility: 0.2
  impact: 0.2
  risk: 0.4          # No breaking changes
  complexity: 0.2    # Thorough testing

# Experimental Mode
weights_experimental:
  feasibility: 0.1
  impact: 0.4        # High potential gains
  risk: 0.1          # Risk acceptable
  complexity: 0.4    # Must validate results
```

---

## 🎯 Part 2: Selection Criteria

### 3 Selection Methods

#### 1. Greedy Selection (Default)
```markdown
Algorithm: Select top k scores
Characteristics: Deterministic
When to use: When evaluation confidence is high
```

#### 2. Probabilistic Sampling
```markdown
Algorithm: Probability-based sampling from score distribution
Formula: P(select) = exp(score/temperature) / Σexp(scores/temperature)
Temperature: Controls exploration vs exploitation trade-off
When to use: During initial exploration phase
```

#### 3. Hybrid Selection
```markdown
Algorithm: Top 2 greedy + 1 probabilistic
Balance: Best options + guaranteed exploration
When to use: When balanced exploration is needed
```

### Selection Strategy by Level

#### Level 1: Initial Thought Generation
**Goal: Diverse exploration of solution space**

```yaml
selection_at_level_1:
  n_select: 3 (from 5 generated)
  method: hybrid
  criteria:
    - diversity: 40%     # Different approaches
    - feasibility: 30%   # Can be implemented
    - potential: 30%     # Maximum possible impact
```

**Selection Process:**
```markdown
1. Generate 5 thoughts (Claude 3 + Codex 2)
2. Calculate score for each thought:
   - Diversity score: Distinctiveness from other thoughts
   - Feasibility score: Implementation ease
   - Potential score: Best possible outcome
3. Selection:
   - Top 2 by total score (greedy)
   - 1 probabilistic selection from remainder
```

**Example:**
```markdown
Generated thoughts:
[C1] Quick fix approach - Score: 7.5
[C2] Refactoring approach - Score: 8.2
[C3] Workaround solution - Score: 6.8
[X1] Algorithm optimization - Score: 9.1 ← Selected (highest)
[X2] Architecture redesign - Score: 8.5 ← Selected (second)

Diversity check:
- X1 vs X2: Different (✓)
- Claude perspective needed → C2 선택 (✓)

선택됨: [X1: 9.1], [X2: 8.5], [C2: 8.2]
```

#### Level 2: Solution Refinement
**Goal: Deep exploration of promising paths**

```yaml
selection_at_level_2:
  n_select: 2-3 (from each parent)
  method: greedy
  criteria:
    - cumulative_score: 50%    # Parent + current score
    - implementation_detail: 30% # How concrete
    - risk_assessment: 20%      # Identified risks
```

**Selection Process:**
```markdown
For each Level 1 thought:
1. Generate 3 refinements
2. Calculate cumulative score:
   cumulative = parent_score × 0.7 + refinement_score × 0.3
3. Select top 2 refinements per parent
4. Global pruning: Keep only top 5 overall
```

**Example:**
```markdown
Parent [X1: 9.1] Algorithm optimization:
├─ X1.1: Heap implementation - Local: 9.5, Cumulative: 9.2 ← Keep
├─ X1.2: Index optimization - Local: 8.8, Cumulative: 8.9 ← Keep
└─ X1.3: Parallel processing - Local: 7.5, Cumulative: 8.5 ← Prune

Parent [X2: 8.5] Architecture redesign:
├─ X2.1: Microservices - Local: 8.3, Cumulative: 8.4 ← Keep
├─ X2.2: Event-driven - Local: 7.9, Cumulative: 8.3 ← Maybe
└─ X2.3: Serverless - Local: 7.2, Cumulative: 7.9 ← Prune

전체 선택: [X1.1, X1.2, X2.1, C2.1, C2.2]
```

#### Level 3: Final Path Selection
**Goal: Select single best implementation path**

```yaml
selection_at_level_3:
  n_select: 1 (final path)
  method: weighted_scoring
  criteria:
    - total_path_score: 40%     # Entire path quality
    - confidence: 25%           # Certainty of success
    - implementation_cost: 20%  # Time/resource needed
    - risk_mitigation: 15%      # Backup plans available
```

**Path Score Formula:**
```python
path_score = Π(node_scores) ^ (1/depth) × confidence_factor

Where:
- Π(node_scores): Product of all node scores in path
- depth: Number of levels in path
- confidence_factor: 0.8-1.2 based on evaluation consistency
```

**Example:**
```markdown
Candidate paths:
Path 1: [Problem] → [X1: 9.1] → [X1.1: 9.5] → [Implementation]
  - Path score: (9.1 × 9.5)^0.5 × 1.1 = 10.2
  - Confidence: 90%
  - Cost: 2 days
  - Risk: Low

Path 2: [Problem] → [C2: 8.2] → [C2.1: 8.8] → [Implementation]
  - Path score: (8.2 × 8.8)^0.5 × 1.0 = 8.5
  - Confidence: 85%
  - Cost: 1 day
  - Risk: Medium

🏆 선택: Path 1 (최고 종합 점수)
```

### Dynamic Selection Adjustment

#### Early Stopping
```markdown
Conditions:
1. One path score > 9.5 AND confidence > 95%
2. All other paths score < 7.0
3. Time constraint requires immediate decision
```

#### Backtracking Triggers
```markdown
Conditions:
1. Selected path implementation fails
2. New information invalidates assumptions
3. Risk exceeds critical threshold
4. Better alternative discovered
```

#### Diversity Requirements
```markdown
Minimum diversity per level:
- Level 1: At least 1 Claude + 1 Codex
- Level 2: At least 2 different approach types
- Level 3: Consider at least 2 paths before decision
```

---

## 📈 Evaluation Labels

Labels for quick identification:

```markdown
🟢 GREEN (7.5+)   - Strongly recommended
🟡 YELLOW (5-7.5) - Conditionally recommended
🔴 RED (<5)       - Reconsideration needed

🚀 Quick Win     - Easy and fast results
💎 High Value    - High value
⏱️ Time Critical - Time sensitive
🔒 Safe Choice   - Safe option
⚡ High Risk-High Reward - High risk high reward
```

---

## 🤖 Model-Specific Evaluation Strengths

### Claude Strengths
```markdown
✅ User experience focus
✅ Practical implementation
✅ Quick deployment
✅ Business value
✅ Risk management
```

### Codex Strengths
```markdown
✅ Technical optimization
✅ Algorithm efficiency
✅ Performance maximization
✅ Code quality
✅ System architecture
```

---

## 📋 Evaluation Checklist

### Quick Evaluation Template

```markdown
[ Approach Name: _________________ ]
[ Model: [Claude] / [Codex] / [Hybrid] ]

🤖 Feasibility Check
□ Files to modify: _____
□ Lines of code: _____
□ Can reuse existing patterns: [Y/N]
□ Estimated AI time: ___minutes
□ Human intervention needed: [Y/N]

📈 Impact Check
□ Current error/issue rate: ____%
□ Expected after fix: ____%
□ Improvement percentage: ____%
□ Quantifiable metrics: _____________
□ User-visible improvement: [Y/N]

⚠️ Risk Check
□ Performance impact: ____%
□ Memory impact: ____%
□ Breaking changes: [Y/N]
□ Other features affected: _____
□ Rollback complexity: [Easy/Medium/Hard]

🧪 Complexity Check
□ Test with provided data: [Y/N]
□ Simulation possible: [Y/N]
□ Automated validation: [Y/N]
□ Test coverage: ____%
□ Results measurable: [Y/N]

Total Score: _____ / 10
Recommendation: [Strongly Recommend/Recommend/Neutral/Not Recommend]
```

---

## 🎯 Selection Patterns by Problem Type

### Debugging Problems
```yaml
preferred_selection:
  level_1:
    claude_weight: 60%  # Practical debugging
    codex_weight: 40%   # Deep analysis
  level_2:
    quick_fixes: 40%    # Immediate solutions
    root_causes: 60%    # Fundamental fixes
```

### Design Problems
```yaml
preferred_selection:
  level_1:
    claude_weight: 40%  # User-centric design
    codex_weight: 60%   # Technical architecture
  level_2:
    proven_patterns: 50%  # Established solutions
    innovative: 50%       # New approaches
```

### Optimization Problems
```yaml
preferred_selection:
  level_1:
    claude_weight: 20%  # Basic improvements
    codex_weight: 80%   # Algorithm optimization
  level_2:
    performance: 70%    # Speed/efficiency
    maintainability: 30% # Code quality
```

---

## 🎮 Selection Control Parameters

### User Settings
```yaml
user_preferences:
  risk_tolerance: conservative/balanced/aggressive
  time_constraint: urgent/normal/relaxed
  solution_type: quick_fix/proper_solution/optimal
  exploration: minimal/balanced/thorough
```

### Automatic Adjustment
```markdown
Based on problem analysis:
- High complexity → Increase Codex thought selection
- Urgent timeline → Prioritize greedy selection
- Unknown domain → High exploration (sampling)
- Critical system → Conservative selection
```

---

## 📊 Selection Report

### Selection Summary Format
```markdown
Level 1 Selection:
- Generated: 5 thoughts (3 Claude, 2 Codex)
- Selected: 3 thoughts (1 Claude, 2 Codex)
- Selection method: Hybrid (2 greedy + 1 sampled)
- Top score: 9.1 (Codex - Algorithm optimization)

Level 2 Selection:
- Generated: 9 refinements (3 per parent)
- Selected: 5 refinements
- Selection method: Greedy with diversity
- Pruned: 4 low-scoring options

Level 3 Selection:
- Evaluated: 5 complete paths
- Selected: Path through X1→X1.1
- Confidence: 90%
- Expected outcome: 70% performance improvement
```

---

## 🔗 Related Implementation

### Actual Implementation Code
- `evaluation-functions.md`: Value/Vote/Hybrid evaluation implementation
- `selection-algorithms.md`: Greedy/Sample/Hybrid selection implementation
- `data-structures.md`: Evaluation, Thought data structures

### Algorithm Application
- `bfs-implementation.md`: Evaluation/selection application in BFS
- `dfs-implementation.md`: Evaluation/selection application in DFS

---

*Evaluation criteria can be adjusted based on project and situation.*
