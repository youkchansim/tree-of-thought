# Task System for Tree of Thoughts

Task Definition and Implementation Guide by Problem Type

## 📚 Task System Overview

A Task is a core component that defines **thought generation**, **evaluation criteria**, and **goal achievement conditions** according to the problem type.

```yaml
Task Responsibilities:
1. Problem analysis and step definition
2. Prompt generation for each step
3. LLM response parsing and scoring
4. Goal achievement determination
```

---

## 🎯 Task Interface Definition

### Base Task Class

```yaml
class BaseTask:
    """Base interface for all Tasks"""

    # Required attributes
    name: str                  # Task name
    steps: int                 # Number of exploration steps
    value_map: Dict[str, float] # Evaluation score mapping

    # Required methods
    def get_proposal_prompt(x: str, y: str) -> str:
        """Prompt for generating new thoughts"""
        pass

    def get_value_prompt(x: str, y: str) -> str:
        """Prompt for evaluating thoughts"""
        pass

    def get_vote_prompt(x: str, ys: List[str]) -> str:
        """Prompt for comparing multiple thoughts"""
        pass

    def parse_value_output(response: str) -> float:
        """Convert evaluation response → score"""
        pass

    def parse_vote_output(response: str) -> List[int]:
        """Convert vote response → ranking"""
        pass

    def is_goal_state(y: str) -> bool:
        """Determine if goal is achieved"""
        pass

    # Optional methods
    def get_initial_state() -> str:
        """Return initial state (default: '')"""
        return ''

    def get_current_step(y: str) -> int:
        """Calculate current step"""
        pass

    def format_output(y: str) -> str:
        """Format final output"""
        pass
```

---

## 🐛 DebugTask Implementation

### 1. Task Definition

```yaml
name: "DebugTask"
description: "Bug root cause analysis and solution proposal"

steps: 4
  - Step 1: Root Cause Analysis
  - Step 2: Verification Method
  - Step 3: Solution Proposal
  - Step 4: Implementation Plan

value_map:
  impossible: 0.001       # Impossible cause/method
  unlikely: 0.5          # Low likelihood
  possible: 1.0          # Possible
  likely: 5.0            # High likelihood
  certain: 20.0          # Certain
```

### 2. Prompt Implementation

```yaml
get_proposal_prompt(x, y):
  """
  x: Bug description
  y: Current state (previous thoughts)
  """

  current_step = get_current_step(y)

  if current_step == 0:
      # Step 1: Root cause analysis
      return f'''
버그 증상: {x}

다음 중 가장 가능성 높은 원인을 1개 제안하세요:

분석 기준:
- 증상과의 연관성
- 발생 빈도
- 재현 가능성

형식:
원인: [구체적 원인]
근거: [왜 이 원인이 가능한지]
검증 방법: [어떻게 확인할 수 있는지]

Hybrid 모드:
[Claude] 실용적 원인 (환경, 설정, 사용자 입력 등)
[Codex] 기술적 원인 (메모리, 동시성, 알고리즘 등)
'''

  elif current_step == 1:
      # Step 2: Verification method
      previous_cause = extract_cause(y)
      return f'''
원인 가설: {previous_cause}

이 원인을 검증하기 위한 구체적인 방법을 제안하세요:

필수 포함:
- 확인할 코드/설정 위치
- 실행할 명령어/테스트
- 예상 결과

형식:
검증 방법: [구체적 방법]
예상 소요 시간: [시간]
확실도: [높음/중간/낮음]
'''

  elif current_step == 2:
      # Step 3: Solution proposal
      verified_cause = extract_verified_cause(y)
      return f'''
확인된 원인: {verified_cause}

해결책을 제안하세요:

고려사항:
- 최소 변경 원칙
- 부작용 가능성
- 테스트 커버리지

형식:
해결책: [구체적 해결 방법]
위험도: [높음/중간/낮음]
테스트 계획: [검증 방법]
'''

  else:
      # Step 4: Implementation plan
      solution = extract_solution(y)
      return f'''
선택된 해결책: {solution}

단계별 구현 계획을 작성하세요:

형식:
1. [첫 번째 단계] - 예상 시간: X분
2. [두 번째 단계] - 예상 시간: Y분
...

체크포인트:
- [ ] 코드 리뷰
- [ ] 유닛 테스트
- [ ] 통합 테스트
'''
```

```yaml
get_value_prompt(x, y):
  """Thought evaluation prompt"""

  return f'''
버그: {x}
제안된 사고: {y}

다음 기준으로 평가하세요:

1. Feasibility (구현 가능성): X/10
   - 기술적 실현 가능성
   - 필요한 리소스
   - 팀 역량

2. Impact (효과): X/10
   - 버그 해결 가능성
   - 근본 원인 해결 여부
   - 재발 방지 효과

3. Risk (위험도): X/10
   - 부작용 가능성
   - 시스템 영향 범위
   - 롤백 난이도

4. Complexity (복잡도): X/10
   - 코드 변경 범위
   - 테스트 난이도
   - 유지보수 영향

최종 평가:
- 점수: [0-10]
- 판단: [impossible/unlikely/possible/likely/certain]
- 근거: [한 문장 요약]

판단 기준:
- impossible: 실현 불가능하거나 관련 없음
- unlikely: 가능성 30% 미만
- possible: 가능성 30-60%
- likely: 가능성 60-90%
- certain: 90% 이상 확실
'''
```

### 3. Response Parsing

```yaml
parse_value_output(response):
  """
  Response example:
    "판단: likely"
    "최종 점수: 8.5"
  """

  import re

  # Extract judgment
  judgment_match = re.search(
      r'판단:\s*(impossible|unlikely|possible|likely|certain)',
      response,
      re.IGNORECASE
  )

  if judgment_match:
      judgment = judgment_match.group(1).lower()
      base_score = value_map[judgment]
  else:
      base_score = 5.0  # Default value

  # Extract score (apply weight if present)
  score_match = re.search(r'점수:\s*(\d+\.?\d*)', response)
  if score_match:
      detailed_score = float(score_match.group(1))
      # Mix judgment-based score and detailed score
      final_score = base_score * 0.7 + detailed_score * 0.3
  else:
      final_score = base_score

  return final_score
```

---

## ♻️ RefactorTask Implementation

### 1. Task Definition

```yaml
name: "RefactorTask"
description: "Code refactoring strategy planning"

steps: 5
  - Step 1: Identify refactoring targets
  - Step 2: Determine priorities
  - Step 3: Select refactoring strategy
  - Step 4: Develop detailed plan
  - Step 5: Risk analysis

value_map:
  high_risk: 0.5          # High risk
  medium_risk: 5.0        # Acceptable risk
  low_risk: 10.0          # Safe
  minimal_impact: 0.1     # No effect
  high_impact: 20.0       # High impact
```

### 2. Prompt Implementation

```yaml
get_proposal_prompt(x, y):
  current_step = get_current_step(y)

  if current_step == 0:
      # Step 1: Identify refactoring targets
      return f'''
코드베이스: {x}

리팩토링이 필요한 영역을 식별하세요:

분석 기준:
- 코드 복잡도 (순환 복잡도, 중첩 깊이)
- 중복도 (Copy-Paste 코드)
- 유지보수성 (변경 빈도, 버그 발생률)
- 테스트 커버리지

형식:
대상: [파일명/클래스명/함수명]
문제: [구체적 문제점]
영향 범위: [영향받는 코드 범위]
우선순위: [HIGH/MEDIUM/LOW]

[Claude] 실용적 관점 (유지보수, 가독성)
[Codex] 기술적 관점 (성능, 알고리즘)
'''

  elif current_step == 2:
      # Step 3: Refactoring strategy
      targets = extract_targets(y)
      return f'''
리팩토링 대상: {targets}

적용할 리팩토링 전략을 제안하세요:

전략 옵션:
1. Extract Method: 큰 메서드 분리
2. Extract Class: 책임 분리
3. Move Method: 적절한 위치로 이동
4. Replace Algorithm: 알고리즘 교체
5. Introduce Parameter Object: 매개변수 객체화

형식:
전략: [전략 이름]
적용 위치: [구체적 위치]
예상 효과: [개선 예상 지표]
리스크: [발생 가능한 문제]
'''
```

---

## 🏗️ DesignTask Implementation

### 1. Task Definition

```yaml
name: "DesignTask"
description: "System architecture design"

steps: 6
  - Step 1: Requirements analysis
  - Step 2: Architecture pattern selection
  - Step 3: Component design
  - Step 4: Data flow definition
  - Step 5: Technology stack selection
  - Step 6: Implementation prioritization

value_map:
  poor_fit: 0.5           # Requirements mismatch
  acceptable: 5.0         # Acceptable
  good_fit: 10.0          # Suitable
  excellent: 20.0         # Optimal
```

### 2. Dynamic Parameter Adjustment

```yaml
DesignTask Features:
  # Dynamically adjust parameters based on complexity

  complexity_factor = analyze_complexity(problem)

  if complexity_factor > 0.8:  # High complexity
      n_generate_sample = 7  # Explore more options
      n_evaluate_sample = 5  # More careful evaluation
      max_depth = 5         # Deeper analysis

  elif complexity_factor > 0.5:  # Medium complexity
      n_generate_sample = 5
      n_evaluate_sample = 3
      max_depth = 4

  else:  # Low complexity
      n_generate_sample = 3
      n_evaluate_sample = 2
      max_depth = 3
```

---

## 🎨 CustomTask Implementation

### Flexible Task Definition

```yaml
CustomTask:
  """Handle user-defined problems"""

  __init__(problem_description):
      # Analyze problem with LLM
      analysis = analyze_problem_with_llm(problem_description)

      # Dynamically determine steps
      self.steps = analysis['estimated_steps']

      # Dynamically determine value_map
      self.value_map = analysis['evaluation_criteria']

      # Generate prompt templates
      self.prompt_templates = generate_prompts(analysis)

  get_proposal_prompt(x, y):
      current_step = get_current_step(y)
      template = self.prompt_templates[current_step]

      return template.format(
          problem=x,
          current_state=y,
          step_name=self.step_names[current_step]
      )
```

---

## 🔗 Task Factory Pattern

```yaml
TaskFactory:
  """Create appropriate Task based on problem type"""

  @staticmethod
  def create_task(problem_description, task_type=None):

      # Auto-detect type
      if task_type is None:
          task_type = detect_problem_type(problem_description)

      # Create Task instance
      if task_type == "debug":
          return DebugTask(problem_description)

      elif task_type == "refactor":
          return RefactorTask(problem_description)

      elif task_type == "design":
          return DesignTask(problem_description)

      else:
          return CustomTask(problem_description)

  @staticmethod
  def detect_problem_type(description):
      """Extract type from problem description"""

      keywords = {
          "debug": ["버그", "오류", "에러", "crash", "bug", "error"],
          "refactor": ["리팩토링", "개선", "정리", "refactor"],
          "design": ["설계", "아키텍처", "구조", "design", "architecture"]
      }

      for task_type, words in keywords.items():
          if any(word in description.lower() for word in words):
              return task_type

      return "custom"
```

---

## 📊 Hybrid Mode Settings by Task Type

```yaml
Optimal Model Ratios by Task Type:

DebugTask:
  Initial root cause analysis:
    claude: 4  # Practical debugging experience
    codex: 1

  Technical verification:
    claude: 1
    codex: 4  # Deep technical analysis

RefactorTask:
  Overall balanced:
    claude: 3  # Code readability, maintainability
    codex: 2  # Algorithm optimization

DesignTask:
  Initial design:
    claude: 3  # Business requirements
    codex: 2

  Technology stack selection:
    claude: 1
    codex: 4  # Technical depth

CustomTask:
  Automatic analysis:
    claude: 3
    codex: 2  # Default
```

---

## 🎯 Task Usage Example

```yaml
# Task usage in ToT command

/tot debug "메모리 누수 발생"

→ TaskFactory.create_task("메모리 누수 발생", "debug")
→ Create DebugTask instance
→ Pass Task to BFS algorithm
→ Generate and evaluate thoughts with Task prompts
→ Return optimal path

Execution flow:
1. task.get_proposal_prompt(x, '') → Root cause analysis prompt
2. LLM invocation → Generate 5 causes
3. task.get_value_prompt(x, y) → Evaluation prompt
4. LLM evaluation → task.parse_value_output() → Score
5. Select Top-3 → Proceed to next step
```

---

## ✅ Task Implementation Checklist

```yaml
Required Implementation:
  ✅ BaseTask interface
  ✅ DebugTask complete implementation
  ✅ RefactorTask complete implementation
  ✅ DesignTask complete implementation
  ✅ CustomTask basic implementation
  ✅ TaskFactory pattern
  ✅ Response parsing logic

Recommended Implementation:
  ⬜ Test cases for each Task
  ⬜ Externalize prompt templates
  ⬜ Task performance metrics
  ⬜ Task combination (Multi-Task)
```

---

*Task system enables optimized ToT execution for each problem type*
