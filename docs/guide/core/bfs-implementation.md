# BFS Implementation for Tree of Thoughts

Practical BFS algorithm implementation guide based on Princeton NLP approach

## 📚 Core Concepts

BFS (Breadth-First Search) is an algorithm that explores all nodes level by level to find the optimal path.

```
Level 0: [Problem]
Level 1: [A, B, C, D, E] → Evaluate → Select top-k → [A, D, E]
Level 2: [A1, A2, D1, D2, E1, E2] → Evaluate → Select top-k → [A2, D1, E2]
Level 3: Continue until goal or max_depth
```

---

## 🔧 Algorithm Structure

### 1. Initialization

```yaml
Input parameters:
  task: Task object (problem definition)
  x: Initial problem description
  args:
    n_generate_sample: 5    # Number of thoughts to generate per level
    n_evaluate_sample: 3    # Number of evaluations per thought
    n_select_sample: 3      # Number of top thoughts to select
    method_generate: "propose"  # propose or sample
    method_evaluate: "value"    # value or vote
    method_select: "greedy"     # greedy or sample
    max_depth: 3            # Maximum search depth

Initial state:
  ys = ['']               # Start from empty state
  infos = []              # Detailed information per level
```

### 2. Main Loop

```python
for step in range(task.steps):
    # Step A: Thought Generation
    new_ys = generate_thoughts(task, x, ys, args)

    # Step B: Thought Evaluation
    values = evaluate_thoughts(task, x, new_ys, args)

    # Step C: Top-k Selection
    selected_ids = select_thoughts(values, args)

    # Step D: Prepare next level
    ys = [new_ys[i] for i in selected_ids]

    # Step E: Record progress
    infos.append({
        'step': step,
        'generated': len(new_ys),
        'selected': len(selected_ids),
        'scores': [values[i] for i in selected_ids]
    })
```

---

## 🎨 Detailed Function Implementation

### Function 1: generate_thoughts()

```yaml
Purpose: Generate new thoughts from current state

Input:
  task: Task object
  x: Initial problem
  ys: Current state list ['state1', 'state2', ...]
  args: Parameter object

Processing logic:

1. method_generate == 'sample':
   Sample independently from each state

   for y in ys:
       proposals = []
       for _ in range(n_generate_sample):
           prompt = task.get_proposal_prompt(x, y)

           # Hybrid mode: Claude + Codex
           if hybrid_mode:
               claude_samples = call_claude(prompt, n=claude_count)
               codex_samples = call_codex(prompt, n=codex_count)
               proposals.extend([
                   {'text': s, 'model': 'claude'} for s in claude_samples
               ])
               proposals.extend([
                   {'text': s, 'model': 'codex'} for s in codex_samples
               ])
           else:
               samples = call_llm(prompt, n=n_generate_sample)
               proposals.extend([
                   {'text': s, 'model': 'default'} for s in samples
               ])

       new_ys.extend(proposals)

2. method_generate == 'propose':
   Sequential proposals (utilizing previous context)

   for y in ys:
       prompt = task.get_proposal_prompt(x, y)
       prompt += "\n\n이전 시도: " + str(previous_thoughts)

       proposals = call_llm(prompt, n=n_generate_sample)
       new_ys.extend([
           {'text': p, 'model': detect_model()} for p in proposals
       ])

Output:
  new_ys: [
      {'text': 'Thought 1', 'model': 'claude'},
      {'text': 'Thought 2', 'model': 'codex'},
      ...
  ]
```

### Function 2: evaluate_thoughts()

```yaml
Purpose: Evaluate generated thoughts and assign scores

Input:
  task: Task object
  x: Initial problem
  ys: List of thoughts to evaluate
  args: Parameter object

Processing logic:

1. method_evaluate == 'value':
   Evaluate each thought independently

   values = []
   value_cache = {}  # Prevent duplicate evaluations

   for y in ys:
       y_text = y['text']

       # Check cache
       if y_text in value_cache:
           values.append(value_cache[y_text])
           continue

       # Generate evaluation prompt
       eval_prompt = task.get_value_prompt(x, y_text)

       # Evaluate n_evaluate_sample times
       evaluations = []
       for _ in range(n_evaluate_sample):
           response = call_llm(eval_prompt, temperature=0.5)
           score = task.parse_value_output(response)
           evaluations.append(score)

       # Calculate average score
       avg_score = sum(evaluations) / len(evaluations)

       # Save to cache
       value_cache[y_text] = avg_score
       values.append(avg_score)

   return values

2. method_evaluate == 'vote':
   Compare and evaluate all thoughts simultaneously

   vote_prompt = task.get_vote_prompt(x, [y['text'] for y in ys])

   # Vote multiple times to ensure stability
   vote_results = []
   for _ in range(n_evaluate_sample):
       response = call_llm(vote_prompt, temperature=0.3)
       rankings = task.parse_vote_output(response)
       vote_results.append(rankings)

   # Aggregate vote results
   final_scores = aggregate_votes(vote_results, len(ys))

   return final_scores

Output:
  values: [8.5, 7.9, 6.2, 9.1, 7.5, ...]
```

### Function 3: select_thoughts()

```yaml
Purpose: Select top k thoughts based on evaluation scores

Input:
  values: List of scores for each thought
  args: Parameter object

Processing logic:

1. method_select == 'greedy':
   Deterministic selection in descending score order

   # Sort indices by score
   sorted_ids = sorted(
       range(len(values)),
       key=lambda i: values[i],
       reverse=True
   )

   # Select top n_select_sample
   selected_ids = sorted_ids[:n_select_sample]

   return selected_ids

2. method_select == 'sample':
   Convert scores to probabilities for stochastic selection

   import numpy as np

   # Normalize scores to probabilities
   values_array = np.array(values)

   # Handle negative scores (shift minimum to 0)
   if values_array.min() < 0:
       values_array = values_array - values_array.min()

   # Create probability distribution
   probabilities = values_array / values_array.sum()

   # Probability-based sampling (without replacement)
   selected_ids = np.random.choice(
       len(values),
       size=min(n_select_sample, len(values)),
       replace=False,
       p=probabilities
   )

   return list(selected_ids)

Output:
  selected_ids: [3, 0, 4]  # Indices of selected thoughts
```

---

## 🔄 Complete Execution Flow Example

```yaml
Problem: "메모리 누수 버그 디버깅"

=== Level 0 ===
Initial state: ['']

=== Level 1: 원인 분석 ===

1. Thought Generation (n_generate=5)
   Generated:
   [Claude] A: "캐시 미해제" (model: claude)
   [Claude] B: "이벤트 리스너 누적" (model: claude)
   [Claude] C: "전역 변수 증가" (model: claude)
   [Codex] D: "Timer 미해제" (model: codex)
   [Codex] E: "Closure 순환 참조" (model: codex)

2. Thought Evaluation (n_evaluate=3, method=value)
   Evaluating A:
     Round 1: 8.7
     Round 2: 8.3
     Round 3: 8.5
     Average: 8.5

   Evaluating B:
     Round 1: 8.0
     Round 2: 7.8
     Round 3: 7.9
     Average: 7.9

   Evaluating C:
     Round 1: 6.0
     Round 2: 6.5
     Round 3: 6.1
     Average: 6.2

   Evaluating D:
     Round 1: 9.3
     Round 2: 8.9
     Round 3: 9.1
     Average: 9.1 ⭐ HIGHEST

   Evaluating E:
     Round 1: 7.6
     Round 2: 7.4
     Round 3: 7.5
     Average: 7.5

   Values: [8.5, 7.9, 6.2, 9.1, 7.5]

3. Top-k Selection (n_select=3, method=greedy)
   Sorted indices by score: [3, 0, 1, 4, 2]
   Selected: [3, 0, 1]
   → D (9.1), A (8.5), B (7.9)

4. Next Level Preparation
   ys = [
       {'text': 'Timer 미해제', 'model': 'codex'},
       {'text': '캐시 미해제', 'model': 'claude'},
       {'text': '이벤트 리스너 누적', 'model': 'claude'}
   ]

=== Level 2: 구체적 검증 방법 ===

1. Thought Generation
   From D (Timer 미해제):
     D1: "setInterval 검색"
     D2: "setTimeout 검색"

   From A (캐시 미해제):
     A1: "캐시 구현 코드 검토"
     A2: "메모리 프로파일러"

   From B (이벤트 리스너):
     B1: "addEventListener 검색"
     B2: "이벤트 바인딩 추적"

2. Evaluation
   D1: 9.5 ⭐ HIGHEST
   D2: 8.8
   A1: 8.2
   A2: 8.7
   B1: 7.9
   B2: 7.6

3. Selection (top 3)
   Selected: D1 (9.5), D2 (8.8), A2 (8.7)

=== Level 3: 구현 계획 ===

1. Thought Generation
   From D1 (setInterval 검색):
     D1-1: "코드베이스 전체 검색"
     D1-2: "최근 변경 파일 우선"

   ...

2. Evaluation
   D1-1: 9.7 ⭐

3. Early Stopping Check
   confidence_threshold = 9.0
   max(scores) = 9.7 > 9.0

   → 조기 종료 결정
   → 최적 경로: D → D1 → D1-1

=== 최종 출력 ===

🌳 BFS 탐색 완료

최적 경로:
  Level 1: [Codex] Timer 미해제 (9.1)
  Level 2: [Codex] setInterval 검색 (9.5)
  Level 3: [Codex] 코드베이스 전체 검색 (9.7)

실행 계획:
  1. grep -r "setInterval" src/
  2. 각 파일에서 clearInterval 확인
  3. 누락된 정리 코드 추가

모델 기여도:
  - Codex: 100% (기술적 정확성)
  - Claude: 대안 경로 제공

신뢰도: 9.7/10 (97%)
탐색 노드: 11개
선택된 노드: 3개
효율성: 73% (8개 노드 프루닝)
```

---

## 📊 Performance Optimization

### 1. Caching Strategy

```yaml
Evaluation cache:
  Purpose: Prevent re-evaluation of identical thoughts
  Structure:
    value_cache = {
        "사고 텍스트": 평가 점수,
        ...
    }

  Application:
    if thought_text in value_cache:
        return value_cache[thought_text]
    else:
        score = evaluate(thought_text)
        value_cache[thought_text] = score
        return score

Prompt cache:
  Purpose: Reduce LLM call costs
  Structure:
    prompt_cache = {
        "prompt_hash": "response",
        ...
    }
```

### 2. Parallel Processing

```yaml
Evaluation parallelization:
  from concurrent.futures import ThreadPoolExecutor

  with ThreadPoolExecutor(max_workers=5) as executor:
      futures = [
          executor.submit(evaluate_single, task, x, y)
          for y in ys
      ]
      values = [f.result() for f in futures]

Hybrid mode parallelization:
  # Call Claude and Codex simultaneously
  with ThreadPoolExecutor(max_workers=2) as executor:
      claude_future = executor.submit(call_claude, prompt, n=3)
      codex_future = executor.submit(call_codex, prompt, n=2)

      claude_results = claude_future.result()
      codex_results = codex_future.result()
```

### 3. Early Termination

```yaml
Confidence-based:
  if max(current_scores) >= confidence_threshold:
      return "최적해 발견, 탐색 종료"

Time limit:
  import time
  start_time = time.time()

  if time.time() - start_time > max_time_seconds:
      return "시간 초과, 현재 최선 반환"

No improvement detection:
  if len(score_history) >= 3:
      recent_scores = score_history[-3:]
      if max(recent_scores) - min(recent_scores) < 0.1:
          return "개선 정체, 탐색 종료"
```

---

## 🎯 Task Interface Requirements

For the BFS algorithm to work, the Task object must provide the following methods:

```yaml
Required methods:

1. task.steps: int
   - Number of search steps (e.g., 3)

2. task.get_proposal_prompt(x: str, y: str) -> str
   - Returns prompt for generating new thoughts
   - x: Initial problem
   - y: Current state

3. task.get_value_prompt(x: str, y: str) -> str
   - Returns prompt for thought evaluation
   - Used when method_evaluate='value'

4. task.get_vote_prompt(x: str, ys: List[str]) -> str
   - Returns prompt for comparing multiple thoughts
   - Used when method_evaluate='vote'

5. task.parse_value_output(response: str) -> float
   - Converts LLM evaluation response to score
   - Example: "Feasibility: 8/10" → 8.0

6. task.parse_vote_output(response: str) -> List[int]
   - Converts LLM vote response to rankings
   - Example: "Best: A, Second: C" → [0, 2, 1, 3, 4]
```

---

## 🔗 Next Steps

This BFS implementation integrates with the following files:

1. `task-system.md`: Task object definition
2. `evaluation-functions.md`: Detailed evaluation function implementation
3. `selection-algorithms.md`: Detailed selection algorithm implementation
4. `hybrid-integration.md`: Claude-Codex collaboration logic

---

*Implementation based on Princeton NLP ToT paper completed*
