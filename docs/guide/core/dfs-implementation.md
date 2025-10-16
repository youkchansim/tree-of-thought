# DFS Implementation for Tree of Thoughts

Princeton NLP-style DFS (Depth-First Search) Algorithm Implementation Guide

## 📚 Core Concepts

DFS is an algorithm that explores one path to its end before backtracking to try other paths.

```
[Problem]
    |
    A (선택, 깊이 탐색)
    |
   A2 (계속 깊이)
    |
  A2-impl (구현)
    |
   성공? → 종료
   실패? → 백트래킹 → B 시도
```

---

## 🔧 Algorithm Structure

### 1. Initialization

```yaml
Input Parameters:
  task: Task object
  x: Initial problem
  args:
    max_depth: 5              # Maximum search depth
    prune_threshold: 5.0      # Pruning threshold
    confidence_threshold: 9.0  # Early stopping threshold
    method_generate: "propose"
    method_evaluate: "value"

Initial State:
  stack = [{'state': '', 'depth': 0, 'path': []}]
  visited = set()
  best_solution = None
  best_score = 0.0
```

### 2. Main Loop (Recursive Structure)

```python
def dfs_search(current_state, depth, path):
    # Termination condition 1: Maximum depth reached
    if depth >= max_depth:
        return evaluate_final_state(current_state)

    # Termination condition 2: Goal achieved
    if is_goal_state(current_state):
        return current_state, get_score(current_state)

    # Generate thoughts
    thoughts = generate_thoughts(task, x, current_state)

    # Evaluate and sort each thought
    scored_thoughts = []
    for thought in thoughts:
        score = evaluate_thought(task, x, thought)

        # Pruning: Don't explore low scores
        if score < prune_threshold:
            continue

        scored_thoughts.append((thought, score))

    # Sort by score (highest first)
    scored_thoughts.sort(key=lambda x: x[1], reverse=True)

    # DFS recursive call for each thought
    for thought, score in scored_thoughts:
        # Check if visited
        thought_hash = hash(thought['text'])
        if thought_hash in visited:
            continue
        visited.add(thought_hash)

        # Recursive call
        result = dfs_search(
            current_state=thought,
            depth=depth + 1,
            path=path + [thought]
        )

        # Update if better solution found
        if result and result['score'] > best_score:
            best_solution = result
            best_score = result['score']

            # Early stopping: Good enough solution found
            if best_score >= confidence_threshold:
                return best_solution

        # Backtracking: Try next thought

    return best_solution
```

---

## 🎨 Detailed Function Implementation

### Function 1: generate_thoughts_dfs()

```yaml
Purpose: Generate next step thoughts from current node

Feature: DFS generates small number (1-3) at a time

Input:
  task: Task object
  x: Initial problem
  current_state: Current state
  depth: Current depth

Processing Logic:
  # DFS prefers sequential proposal method
  prompt = task.get_proposal_prompt(x, current_state)
  prompt += f"\n\n현재 깊이: {depth}/{max_depth}"
  prompt += f"\n이전 경로: {format_path(path)}"

  # Hybrid mode: Select model based on depth
  if depth <= 2:
      # Initial stage: Claude-centric (practical direction)
      claude_thoughts = call_claude(prompt, n=2)
      codex_thoughts = call_codex(prompt, n=1)
  else:
      # Deep stage: Codex-centric (technical details)
      claude_thoughts = call_claude(prompt, n=1)
      codex_thoughts = call_codex(prompt, n=2)

  thoughts = [
      {'text': t, 'model': 'claude', 'depth': depth}
      for t in claude_thoughts
  ] + [
      {'text': t, 'model': 'codex', 'depth': depth}
      for t in codex_thoughts
  ]

  return thoughts

Output:
  [
      {'text': 'Thought 1', 'model': 'claude', 'depth': 1},
      {'text': 'Thought 2', 'model': 'codex', 'depth': 1},
      ...
  ]
```

### Function 2: evaluate_thought_dfs()

```yaml
Purpose: Evaluate single thought (DFS uses immediate evaluation)

Input:
  task: Task object
  x: Initial problem
  thought: Thought to evaluate
  depth: Current depth

Processing Logic:
  # Evaluation prompt
  eval_prompt = task.get_value_prompt(x, thought['text'])

  # Single evaluation (DFS prefers fast evaluation)
  response = call_llm(eval_prompt, temperature=0.3)
  score = task.parse_value_output(response)

  # Depth penalty: Slightly penalize deeper nodes (prevent infinite search)
  depth_penalty = 0.1 * depth
  adjusted_score = score - depth_penalty

  # Model bonus: Bonus for Codex technical thoughts
  if thought['model'] == 'codex' and is_technical_problem(task):
      adjusted_score += 0.2

  return adjusted_score

Output:
  adjusted_score: 8.7
```

### Function 3: prune_decision()

```yaml
Purpose: Pruning decision

Input:
  score: Current thought score
  prune_threshold: Threshold
  context: Additional context

Processing Logic:
  # Basic pruning
  if score < prune_threshold:
      return True, "점수 미달"

  # Dynamic pruning: Compare with sibling nodes
  if len(siblings_scores) > 0:
      avg_sibling = sum(siblings_scores) / len(siblings_scores)
      if score < avg_sibling * 0.7:
          return True, "형제 노드 대비 낮음"

  # Resource-based pruning
  if visited_nodes > max_nodes:
      return True, "탐색 노드 수 초과"

  return False, "계속 탐색"

Output:
  should_prune: bool
  reason: str
```

---

## 🔄 Complete Execution Flow Example

```yaml
Problem: "크로스워드 퍼즐 해결"

=== Depth 0: 초기화 ===
Current: ''
Path: []

=== Depth 1: 첫 단어 선택 ===

1. Thought Generation
   Generated (n=3):
   [Claude] A: "1-Across 'TREE' 시도" (score: 8.5)
   [Codex] B: "제약조건 많은 단어 우선" (score: 9.1) ⭐
   [Claude] C: "짧은 단어부터" (score: 7.2)

2. Evaluation & Sorting
   Sorted: B(9.1), A(8.5), C(7.2)

3. Pruning Check
   C(7.2) < prune_threshold(8.0) → 가지치기 ✂️

4. DFS Recursion
   선택: B (9.1) - "제약조건 많은 단어 우선"
   → dfs_search(B, depth=1)

=== Depth 2: 제약조건 분석 ===

Current: B
Path: [B]

1. Thought Generation (from B)
   [Codex] B1: "5-Down '_ _ R _ _' 패턴 분석" (score: 9.3)
   [Claude] B2: "교차점 검증" (score: 8.7)
   [Codex] B3: "사전 검색" (score: 8.9)

2. Sorting
   B1(9.3), B3(8.9), B2(8.7)

3. DFS Recursion
   선택: B1 (9.3)
   → dfs_search(B1, depth=2)

=== Depth 3: 단어 후보 생성 ===

Current: B1
Path: [B, B1]

1. Thought Generation
   [Codex] B1-1: "'HORSE' 시도" (score: 9.5)
   [Codex] B1-2: "'FORCE' 시도" (score: 8.8)
   [Claude] B1-3: "다른 패턴 검토" (score: 7.5)

2. Pruning
   B1-3(7.5) < 8.0 → 가지치기

3. DFS Recursion
   선택: B1-1 (9.5)
   → dfs_search(B1-1, depth=3)

=== Depth 4: 충돌 검증 ===

Current: B1-1 ('HORSE')
Path: [B, B1, B1-1]

1. Validation Check
   교차점 검증... ✅ 통과
   주변 단어 검증... ✅ 통과

2. Score
   Final Score: 9.7

3. Goal Check
   is_goal_state() → True (충분히 검증됨)

4. Early Stopping
   9.7 >= confidence_threshold(9.0) → 조기 종료 ✅

=== 결과 ===

🎯 DFS 탐색 완료

최적 경로:
  Depth 1: [Codex] 제약조건 많은 단어 우선 (9.1)
  Depth 2: [Codex] 5-Down 패턴 분석 (9.3)
  Depth 3: [Codex] 'HORSE' 시도 (9.5)
  Depth 4: [검증] 충돌 없음 (9.7)

탐색 통계:
  - 방문 노드: 8개
  - 가지치기: 3개
  - 백트래킹: 0회 (첫 경로 성공)
  - 총 깊이: 4

모델 기여:
  - Codex: 90% (기술적 분석)
  - Claude: 10% (대안 제시)

효율성: 매우 높음 (조기 종료)
```

---

## 📊 DFS vs BFS Comparison

| Feature | DFS | BFS |
|-----|-----|-----|
| **Search Method** | Depth-first | Breadth-first |
| **Memory** | O(depth) - Low | O(width^depth) - High |
| **Optimal Solution** | Not guaranteed | Guaranteed |
| **Fast Solution** | Possible ✅ | Slow |
| **Backtracking** | Required | Not needed |
| **Thought Generation** | 1-3 per step | 5-7 per step |
| **Evaluation Count** | 1 per thought | 3 per thought |

---

## 🎯 Problem Types Suitable for DFS

```yaml
1. Crosswords/Puzzles:
   - Many constraints
   - Early failure detection possible
   - Effective backtracking

2. Code Generation:
   - Deep exploration in one direction
   - Fast prototyping needed
   - Memory constraints

3. Debugging (specific conditions):
   - Clear hypothesis exists
   - Fast verification possible
   - Deep stack tracing

4. Optimization Problems:
   - Local optima acceptable
   - Time constraints exist
   - Incremental improvement
```

---

## 🛠️ DFS Optimization Techniques

### 1. Adaptive Depth Adjustment

```yaml
Dynamic max_depth:
  if problem_complexity == "high":
      max_depth = 7
  elif problem_complexity == "medium":
      max_depth = 5
  else:
      max_depth = 3

  # Adjust during search
  if no_improvement_count > 3:
      max_depth += 2  # Search deeper
```

### 2. Intelligent Backtracking

```yaml
Backtracking Strategy:
  # Analyze failure reason
  failure_reason = analyze_failure(current_path)

  # Skip similar paths
  if failure_reason == "리소스 부족":
      skip_similar_paths(resource_intensive_nodes)

  # Determine backtracking level
  backtrack_level = find_decision_point(failure_reason)
  return_to_depth(backtrack_level)
```

### 3. Priority-Based Search

```yaml
Using Priority Queue:
  import heapq

  # Prioritize nodes with higher scores
  priority_queue = []

  for thought, score in scored_thoughts:
      heapq.heappush(priority_queue, (-score, thought))

  while priority_queue:
      score, thought = heapq.heappop(priority_queue)
      dfs_search(thought, depth + 1, path + [thought])
```

---

## 🔗 Hybrid Mode DFS Integration

```yaml
Using Hybrid in DFS:

Initial Search (Depth 0-2):
  - Claude: 60% (direction setting)
  - Codex: 40% (technical validation)

Mid-level Search (Depth 3-4):
  - Claude: 40%
  - Codex: 60% (detailed implementation)

Deep Search (Depth 5+):
  - Claude: 20%
  - Codex: 80% (optimization)

Cross-Evaluation:
  Codex Proposal → Claude Verification:
    "실무 적용 가능성: 높음 ✅"
    "팀 이해도: 보통 ⚠️"
```

---

## 📋 Implementation Checklist

```yaml
Required Implementation:
  ✅ Recursive DFS function
  ✅ Pruning logic
  ✅ Backtracking mechanism
  ✅ Visit checking (duplicate prevention)
  ✅ Early stopping conditions

Optional Implementation:
  ⬜ Iterative Deepening
  ⬜ Heuristic-based sorting
  ⬜ Memoization
  ⬜ Dynamic depth adjustment
```

---

*Princeton NLP DFS method + Hybrid optimization complete*
