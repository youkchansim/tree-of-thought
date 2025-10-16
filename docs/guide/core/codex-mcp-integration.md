# Codex MCP Integration Guide

How to integrate Codex MCP into the ToT system within the Claude Code CLI environment

## 🎯 Core Concepts

```yaml
Execution Environment:
  - Runs inside Claude Code CLI
  - No API calls
  - Codex MCP invocation via Task tool

Thought Generation Method:
  - Claude thoughts: Self-generated (immediate)
  - Codex thoughts: Task tool → MCP call
```

---

## 📋 Codex MCP Call Interface

### 1. Basic Call Structure

```python
# Calling Codex MCP from Claude Code
Task(
    subagent_type="general-purpose",
    description="ToT Codex thought generation",
    prompt=f"""
{task_context}

**Task**: {task.get_proposal_prompt(x, current_thought)}

**Requirements**:
1. Generate {n_codex_thoughts} distinct solution approaches
2. Output format (JSON):
{{
  "thoughts": [
    {{
      "id": "codex_1",
      "text": "solution approach description",
      "reasoning": "why this approach"
    }},
    ...
  ]
}}

**Important**:
- 한국어로 응답
- 기술적 깊이 우선
- 알고리즘/성능 최적화 관점
"""
)
```

### 2. Prompt Structure

```yaml
Codex MCP Prompt Composition:
  1. Context Provision:
     - Problem description (x)
     - Current thought state (current_thought)
     - Task type (Debug/Refactor/Design)

  2. Generation Instructions:
     - Number of thoughts to generate
     - Output format (JSON)
     - Quality criteria

  3. Constraints:
     - Korean response
     - Technical depth
     - Specific perspective (algorithm/performance)
```

---

## 🔄 Integration Workflow

### Codex MCP Integration in BFS

```python
def generate_thoughts_hybrid(task, x, current_thoughts, args):
    """
    Hybrid thought generation: Claude self + Codex MCP

    Args:
        task: Task object (DebugTask/RefactorTask/DesignTask)
        x: Initial problem description
        current_thoughts: List of thoughts at current level
        args: ToT parameters (n_generate_sample, ratio, etc.)

    Returns:
        List[Thought]: Integrated list of Claude + Codex thoughts
    """

    # 1. Calculate ratio
    claude_ratio, codex_ratio = parse_ratio(args.ratio)  # e.g., "5:5" → 0.5, 0.5
    n_total = args.n_generate_sample
    n_claude = int(n_total * claude_ratio)
    n_codex = int(n_total * codex_ratio)

    all_thoughts = []

    # 2. Generate Claude thoughts (self)
    for i in range(n_claude):
        prompt = task.get_proposal_prompt(x, current_thoughts[-1] if current_thoughts else "")

        # Claude Code self-response (immediate generation)
        claude_response = f"""
[Claude 사고 {i+1}]

{generate_claude_thought(prompt)}
"""

        thought = Thought(
            id=f"claude_{len(all_thoughts)}",
            text=extract_thought_text(claude_response),
            model="claude",
            depth=len(current_thoughts)
        )
        all_thoughts.append(thought)

    # 3. Generate Codex thoughts (MCP call)
    if n_codex > 0:
        codex_thoughts = call_codex_mcp(
            task=task,
            x=x,
            current_thought=current_thoughts[-1] if current_thoughts else "",
            n_thoughts=n_codex,
            depth=len(current_thoughts)
        )
        all_thoughts.extend(codex_thoughts)

    return all_thoughts


def call_codex_mcp(task, x, current_thought, n_thoughts, depth):
    """
    Thought generation via Codex MCP

    In actual implementation, uses Task tool:
    - subagent_type: "general-purpose"
    - prompt: Structured thought generation request
    """

    # Construct prompt for Task tool call
    task_context = f"""
# ToT Thought Generation Request

## Problem Context
{x}

## Current Progress
{current_thought if current_thought else "Starting fresh"}

## Task Type
{task.__class__.__name__}

## Current Depth
Level {depth + 1}
"""

    generation_prompt = task.get_proposal_prompt(x, current_thought)

    codex_prompt = f"""
{task_context}

{generation_prompt}

**Generate {n_thoughts} distinct solution approaches.**

**Output Format** (strict JSON):
```json
{{
  "thoughts": [
    {{
      "id": "codex_1",
      "text": "첫 번째 해결 방안 설명",
      "reasoning": "이 방안을 선택한 이유"
    }},
    {{
      "id": "codex_2",
      "text": "두 번째 해결 방안 설명",
      "reasoning": "이 방안을 선택한 이유"
    }}
  ]
}}
```

**Requirements**:
- 한국어로 작성
- 기술적 깊이 우선
- 알고리즘/성능 최적화 관점
- 각 사고는 명확히 구분되어야 함
"""

    # In actual execution:
    # Task(subagent_type="general-purpose",
    #      description="ToT Codex thought generation",
    #      prompt=codex_prompt)
    # is called in this format

    # Parse response
    codex_response = """
    여기에 Task tool의 실제 응답이 들어옴
    JSON 형태로 파싱 가능해야 함
    """

    return parse_codex_response(codex_response, depth)


def parse_codex_response(response, depth):
    """
    Convert Codex MCP response to Thought object list
    """
    thoughts = []

    try:
        # Attempt JSON parsing
        import json
        data = json.loads(extract_json(response))

        for item in data.get("thoughts", []):
            thought = Thought(
                id=item["id"],
                text=item["text"],
                model="codex",
                depth=depth,
                metadata={
                    "reasoning": item.get("reasoning", "")
                }
            )
            thoughts.append(thought)

    except Exception as e:
        # Fallback to text parsing if JSON parsing fails
        thoughts = parse_text_fallback(response, depth)

    return thoughts
```

---

## 🎯 Task Type-Specific Codex Prompts

### DebugTask - Codex Call

```python
def get_codex_debug_prompt(x, current_thought):
    return f"""
# Bug Debugging - Technical Analysis

## Problem
{x}

## Current Analysis
{current_thought}

**Generate 2 technical cause hypotheses:**

Focus on:
- Memory management issues
- Algorithm complexity
- Race conditions
- System-level bottlenecks

Output JSON:
{{
  "thoughts": [
    {{
      "id": "codex_1",
      "text": "기술적 원인 분석 1",
      "reasoning": "근거"
    }},
    {{
      "id": "codex_2",
      "text": "기술적 원인 분석 2",
      "reasoning": "근거"
    }}
  ]
}}
"""
```

### RefactorTask - Codex Call

```python
def get_codex_refactor_prompt(x, current_thought):
    return f"""
# Code Refactoring - Technical Optimization

## Code/System
{x}

## Current Strategy
{current_thought}

**Generate 2 technical optimization strategies:**

Focus on:
- Algorithm optimization (O(n²) → O(n log n))
- Data structure improvements
- Design pattern applications
- Performance bottlenecks

Output JSON:
{{
  "thoughts": [
    {{
      "id": "codex_1",
      "text": "최적화 전략 1",
      "reasoning": "기술적 근거"
    }},
    {{
      "id": "codex_2",
      "text": "최적화 전략 2",
      "reasoning": "기술적 근거"
    }}
  ]
}}
"""
```

### DesignTask - Codex Call

```python
def get_codex_design_prompt(x, current_thought):
    return f"""
# System Design - Technical Architecture

## Requirements
{x}

## Current Design Direction
{current_thought}

**Generate 2 innovative architectural patterns:**

Focus on:
- Scalability (horizontal/vertical)
- Performance characteristics
- Advanced design patterns
- System optimization

Output JSON:
{{
  "thoughts": [
    {{
      "id": "codex_1",
      "text": "아키텍처 패턴 1",
      "reasoning": "기술적 장점"
    }},
    {{
      "id": "codex_2",
      "text": "아키텍처 패턴 2",
      "reasoning": "기술적 장점"
    }}
  ]
}}
"""
```

---

## 🔍 Codex MCP Integration in Evaluation

### Cross-Evaluation Implementation

```python
def evaluate_thoughts_hybrid(task, x, thoughts, args):
    """
    Hybrid evaluation: Claude + Codex cross-evaluation

    - Claude-generated thoughts → Evaluated by Codex
    - Codex-generated thoughts → Evaluated by Claude
    - Self-generated thoughts → Self-evaluation
    """

    evaluations = {}

    for thought in thoughts:
        if thought.model == "claude":
            # Claude thought → Codex evaluation
            codex_scores = call_codex_evaluation(task, x, thought, args.n_evaluate_sample)
            claude_scores = evaluate_self(task, x, thought, args.n_evaluate_sample)

            # Weighted average (Cross-evaluation has higher reliability)
            final_score = (
                sum(codex_scores) / len(codex_scores) * 0.6 +
                sum(claude_scores) / len(claude_scores) * 0.4
            )

        elif thought.model == "codex":
            # Codex thought → Claude evaluation
            claude_scores = evaluate_self(task, x, thought, args.n_evaluate_sample)
            # Skip Codex self-evaluation (MCP call cost)

            final_score = sum(claude_scores) / len(claude_scores)

        evaluations[thought.id] = {
            "score": final_score,
            "confidence": calculate_confidence(thought),
            "breakdown": {
                "feasibility": score_feasibility(thought),
                "impact": score_impact(thought),
                "risk": score_risk(thought),
                "complexity": score_complexity(thought)
            }
        }

    return evaluations


def call_codex_evaluation(task, x, thought, n_evaluate):
    """
    Thought evaluation via Codex MCP
    """

    evaluation_prompt = f"""
# Thought Evaluation Request

## Original Problem
{x}

## Thought to Evaluate
{thought.text}
(Generated by: {thought.model})

## Task
Evaluate this solution approach on 4 criteria:

1. **Feasibility** (1-10): 구현 가능성
2. **Impact** (1-10): 문제 해결 효과
3. **Risk** (1-10): 위험도 (낮을수록 좋음)
4. **Complexity** (1-10): 구현 복잡도 (낮을수록 좋음)

**Perform {n_evaluate} independent evaluations.**

**Output Format** (JSON):
```json
{{
  "evaluations": [
    {{
      "feasibility": 8,
      "impact": 9,
      "risk": 3,
      "complexity": 5,
      "overall": 8.2,
      "reasoning": "평가 근거"
    }},
    ...
  ]
}}
```

**Technical perspective required.**
"""

    # Task tool call
    # codex_response = Task(...)

    # Parse response
    scores = parse_evaluation_response(codex_response)
    return [eval["overall"] for eval in scores["evaluations"]]
```

---

## ⚙️ Execution Examples

### Complete BFS Execution Flow

```python
def run_tot_bfs_hybrid(problem, task_type="debug", ratio="5:5"):
    """
    Hybrid ToT BFS execution

    Example:
        run_tot_bfs_hybrid(
            problem="메모리 누수 발생",
            task_type="debug",
            ratio="5:5"
        )
    """

    # 1. Create Task
    task = TaskFactory.create(task_type)

    # 2. Set parameters
    args = ToTArgs(
        n_generate_sample=5,    # Total 5 thoughts
        n_evaluate_sample=3,    # Each evaluated 3 times
        n_select_sample=3,      # Select top 3
        ratio=ratio,            # Claude:Codex = 5:5 → 2-3 each
        max_depth=3
    )

    # 3. Run BFS
    print("=== ToT BFS 시작 ===\n")

    current_thoughts = []

    for depth in range(args.max_depth):
        print(f"--- Level {depth + 1} ---")

        # Generate thoughts (Claude self + Codex MCP)
        new_thoughts = generate_thoughts_hybrid(
            task, problem, current_thoughts, args
        )

        print(f"생성된 사고: {len(new_thoughts)}개")
        for t in new_thoughts:
            print(f"  [{t.model}] {t.id}: {t.text[:50]}...")

        # Evaluate (Hybrid cross-evaluation)
        evaluations = evaluate_thoughts_hybrid(
            task, problem, new_thoughts, args
        )

        print(f"\n평가 결과:")
        for t_id, eval_data in sorted(
            evaluations.items(),
            key=lambda x: x[1]["score"],
            reverse=True
        ):
            print(f"  {t_id}: {eval_data['score']:.1f} (신뢰도: {eval_data['confidence']:.0%})")

        # Select (Greedy with diversity)
        selected = select_thoughts_hybrid(
            new_thoughts, evaluations, args.n_select_sample
        )

        print(f"\n선택된 사고: {len(selected)}개")
        for t in selected:
            score = evaluations[t.id]["score"]
            print(f"  [{t.model}] {t.id}: {score:.1f}")

        # Early termination check
        best_score = max(evaluations[t.id]["score"] for t in selected)
        if best_score >= 9.0:
            print(f"\n🎯 조기 종료: 최고 점수 {best_score:.1f} 달성")
            current_thoughts = selected
            break

        current_thoughts = selected
        print()

    # 4. Return optimal path
    best_thought = max(
        current_thoughts,
        key=lambda t: evaluations[t.id]["score"]
    )

    print("=== 최적 해답 ===")
    print(f"모델: {best_thought.model}")
    print(f"점수: {evaluations[best_thought.id]['score']:.1f}")
    print(f"내용:\n{best_thought.text}")

    return best_thought
```

---

## 🛠️ Utility Functions

### JSON Extraction and Parsing

```python
def extract_json(response):
    """
    Extract JSON block from response
    """
    import re

    # Find ```json ... ``` block
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
    if json_match:
        return json_match.group(1)

    # Directly find { ... }
    json_match = re.search(r'\{.*\}', response, re.DOTALL)
    if json_match:
        return json_match.group(0)

    raise ValueError("JSON not found in response")


def parse_text_fallback(response, depth):
    """
    Text parsing fallback when JSON parsing fails
    """
    thoughts = []

    # Parse "1. ...\n2. ..." format
    import re
    matches = re.findall(r'(\d+)\.\s*([^\n]+)', response)

    for i, (num, text) in enumerate(matches):
        thought = Thought(
            id=f"codex_{i}",
            text=text.strip(),
            model="codex",
            depth=depth
        )
        thoughts.append(thought)

    return thoughts
```

---

## 📊 Performance Optimization

### Parallel Processing

```python
def generate_thoughts_parallel(task, x, current_thoughts, args):
    """
    Process Claude self-generation and Codex MCP calls in parallel
    """

    import concurrent.futures

    claude_ratio, codex_ratio = parse_ratio(args.ratio)
    n_total = args.n_generate_sample
    n_claude = int(n_total * claude_ratio)
    n_codex = int(n_total * codex_ratio)

    all_thoughts = []

    # Parallel execution
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        # Claude generation (async)
        claude_future = executor.submit(
            generate_claude_thoughts, task, x, current_thoughts, n_claude
        )

        # Codex MCP call (async)
        codex_future = executor.submit(
            call_codex_mcp, task, x,
            current_thoughts[-1] if current_thoughts else "",
            n_codex, len(current_thoughts)
        )

        # Collect results
        all_thoughts.extend(claude_future.result())
        all_thoughts.extend(codex_future.result())

    return all_thoughts
```

### Caching

```python
# Codex MCP response caching
codex_cache = {}

def call_codex_mcp_cached(task, x, current_thought, n_thoughts, depth):
    """
    Return cached response for identical requests
    """
    cache_key = f"{task.__class__.__name__}:{x[:50]}:{depth}:{n_thoughts}"

    if cache_key in codex_cache:
        print(f"[Cache Hit] {cache_key}")
        return codex_cache[cache_key]

    result = call_codex_mcp(task, x, current_thought, n_thoughts, depth)
    codex_cache[cache_key] = result

    return result
```

---

## 🎯 Practical Usage Examples

### Debugging Scenario

```bash
# Command
/tot debug -r 6:4 "메모리 누수 발생"

# Execution flow:
# Level 1:
#   - [Claude] 3 thoughts (immediate generation)
#   - [Codex] 2 thoughts (MCP call)
#   - Hybrid evaluation
#   - Select top 3

# Level 2:
#   - From each of the selected 3
#   - [Claude] 2 + [Codex] 1
#   - Evaluate and select

# Level 3:
#   - Final verification
#   - Return optimal solution
```

### Actual Execution Log

```
=== ToT BFS 시작 ===

--- Level 1: 원인 분석 ---
생성된 사고: 5개
  [claude] claude_0: 캐시 메모리 미해제로 인한 누수...
  [claude] claude_1: 이벤트 리스너 등록 후 미제거...
  [claude] claude_2: 전역 변수에 대용량 데이터 저장...
  [codex] codex_0: setInterval/setTimeout 미정리... (MCP)
  [codex] codex_1: Closure 순환 참조... (MCP)

평가 결과:
  codex_0: 9.1 (신뢰도: 92%)
  claude_0: 8.5 (신뢰도: 88%)
  codex_1: 7.9 (신뢰도: 85%)
  claude_1: 7.5 (신뢰도: 83%)
  claude_2: 6.2 (신뢰도: 78%)

선택된 사고: 3개
  [codex] codex_0: 9.1
  [claude] claude_0: 8.5
  [codex] codex_1: 7.9

--- Level 2: 검증 방법 ---
...
```

---

## 📝 Summary

**Core of Codex MCP Integration:**

1. **Use Task tool**: MCP integration without API calls
2. **Structured prompts**: Enforce JSON response format
3. **Parallel processing**: Simultaneous execution of Claude self + Codex MCP
4. **Cross-evaluation**: Ensure objectivity through mutual evaluation
5. **Caching**: Prevent duplicate MCP calls

**Advantages:**
- No API costs
- Optimized for Claude Code CLI environment
- Maximize hybrid synergy
- Transparent execution process

**Considerations:**
- Codex MCP responses must be JSON parsable
- Consider Task tool call time
- Error handling (fallback when MCP fails)

---

*ToT system based on Claude Code CLI + Codex MCP*
