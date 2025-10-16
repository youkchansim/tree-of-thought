# ToT Execution Flow in Claude Code CLI

How to actually execute Tree of Thoughts in the Claude Code CLI environment

## 🎯 Execution Environment

```yaml
Environment:
  - Claude Code CLI
  - Prompt-based execution
  - Tool system utilization

Thought Generation:
  - Claude: Self-response (immediate)
  - Codex: Task tool → MCP

Evaluation:
  - Claude: Self-evaluation
  - Codex: Task tool → MCP (optional)

Constraints:
  - No API calls
  - Everything is prompt-based
  - Real-time progress display
```

---

## 📋 Overall Execution Flow

### 1. User Input

```bash
/tot debug "메모리 누수 발생"
```

**Processing Steps:**
1. `/tot` command executes `~/.claude/commands/tot.md`
2. `tot.md` reads ToT framework documents
3. Determines problem type (debug)
4. Activates Hybrid mode by default
5. Starts BFS algorithm

---

### 2. Initialization Stage

```markdown
# Claude Code Internal Processing

## Step 1: Task Creation
- Problem type: debug
- TaskFactory → Create DebugTask
- Load task parameters

## Step 2: Parameter Configuration
n_generate_sample: 5
n_evaluate_sample: 3
n_select_sample: 3
ratio: "5:5" (Claude:Codex)
max_depth: 3
algorithm: BFS

## Step 3: Ratio Calculation
Generate total 5 thoughts:
- Claude: 2-3 thoughts (self-generated)
- Codex: 2-3 thoughts (MCP call)
```

---

### 3. Level 1: Thought Generation (Hybrid)

#### 3-1. Claude Self-Thought Generation

```markdown
# Generated immediately by Claude

## Prompt (internal):
{DebugTask.get_proposal_prompt(x="메모리 누수 발생", y="")}

## Generation Instruction:
"Analyze 3 possible causes"

## Response (Claude self):

### [Claude 사고 1]
**원인**: 캐시 메모리 미해제
**설명**: Redis/Memcached 연결 후 명시적 close() 미호출
**가능성**: 높음 (8/10)

### [Claude 사고 2]
**원인**: 이벤트 리스너 미제거
**설명**: addEventListener 후 removeEventListener 누락
**가능성**: 중간 (6/10)

### [Claude 사고 3]
**원인**: 전역 변수 대용량 데이터
**설명**: window/global 객체에 배열/객체 누적
**가능성**: 낮음 (4/10)
```

**Thought Object Creation:**
```python
thoughts = [
    Thought(
        id="claude_0",
        text="캐시 메모리 미해제: Redis/Memcached 연결 후...",
        model="claude",
        depth=0,
        metadata={"possibility": 8}
    ),
    Thought(
        id="claude_1",
        text="이벤트 리스너 미제거: addEventListener 후...",
        model="claude",
        depth=0,
        metadata={"possibility": 6}
    ),
    Thought(
        id="claude_2",
        text="전역 변수 대용량 데이터: window/global 객체에...",
        model="claude",
        depth=0,
        metadata={"possibility": 4}
    )
]
```

#### 3-2. Codex MCP Thought Generation

```markdown
# Task tool invocation

## Tool Call:
Task(
    subagent_type="general-purpose",
    description="ToT Codex debugging thoughts",
    prompt="""
# Bug Debugging - Technical Analysis

## Problem
메모리 누수 발생

## Generate 2 technical hypotheses

Focus on:
- Memory management
- Algorithm complexity
- System-level issues

Output JSON:
{
  "thoughts": [
    {"id": "codex_1", "text": "...", "reasoning": "..."},
    {"id": "codex_2", "text": "...", "reasoning": "..."}
  ]
}
"""
)

## Codex MCP 응답:
{
  "thoughts": [
    {
      "id": "codex_1",
      "text": "setInterval/setTimeout 미정리: Timer 핸들러가 메모리에 남아있음",
      "reasoning": "JavaScript Timer는 명시적 clear 없이는 GC되지 않음"
    },
    {
      "id": "codex_2",
      "text": "Closure 순환 참조: 이벤트 핸들러 내부에서 외부 스코프 참조",
      "reasoning": "순환 참조는 일부 엔진에서 GC 불가"
    }
  ]
}
```

**Add Thought Objects:**
```python
thoughts.extend([
    Thought(
        id="codex_1",
        text="setInterval/setTimeout 미정리: Timer 핸들러가...",
        model="codex",
        depth=0,
        metadata={"reasoning": "JavaScript Timer는..."}
    ),
    Thought(
        id="codex_2",
        text="Closure 순환 참조: 이벤트 핸들러 내부에서...",
        model="codex",
        depth=0,
        metadata={"reasoning": "순환 참조는..."}
    )
])
```

**Total 5 Thoughts Generated**

---

### 4. Level 1: Evaluation (Hybrid Cross-Evaluation)

#### 4-1. Claude Thought Evaluation

```markdown
# Claude evaluates directly (Value method)

## Thought: claude_0 (캐시 메모리 미해제)

### 평가 1회:
- Feasibility: 8 (구현 가능성 높음)
- Impact: 9 (문제 해결 효과 큼)
- Risk: 3 (위험도 낮음)
- Complexity: 5 (중간 복잡도)
**Overall: 8.2**

### 평가 2회:
- Feasibility: 9
- Impact: 8
- Risk: 2
- Complexity: 6
**Overall: 8.5**

### 평가 3회:
- Feasibility: 8
- Impact: 9
- Risk: 3
- Complexity: 5
**Overall: 8.3**

**평균 점수: 8.33**
```

#### 4-2. Codex Thought Evaluation (Cross-Evaluation)

```markdown
# Claude evaluates Codex thoughts

## Thought: codex_1 (setInterval/setTimeout 미정리)

### 평가 1회:
- Feasibility: 9 (매우 현실적)
- Impact: 10 (근본 원인일 가능성)
- Risk: 2 (안전한 접근)
- Complexity: 4 (간단한 검증)
**Overall: 9.0**

### 평가 2회:
- Feasibility: 10
- Impact: 9
- Risk: 2
- Complexity: 3
**Overall: 9.2**

### 평가 3회:
- Feasibility: 9
- Impact: 10
- Risk: 1
- Complexity: 4
**Overall: 9.1**

**평균 점수: 9.10**
```

**Overall Evaluation Results:**
```python
evaluations = {
    "claude_0": {"score": 8.33, "confidence": 0.88},
    "claude_1": {"score": 7.50, "confidence": 0.83},
    "claude_2": {"score": 6.20, "confidence": 0.78},
    "codex_1": {"score": 9.10, "confidence": 0.92},  # 최고점
    "codex_2": {"score": 7.90, "confidence": 0.85}
}
```

---

### 5. Level 1: Selection (Greedy)

```markdown
# Select top 3

## 정렬 (점수 내림차순):
1. codex_1: 9.10 ✅
2. claude_0: 8.33 ✅
3. codex_2: 7.90 ✅
4. claude_1: 7.50 ❌
5. claude_2: 6.20 ❌

## 선택 결과:
selected_thoughts = [
    thoughts[3],  # codex_1
    thoughts[0],  # claude_0
    thoughts[4]   # codex_2
]
```

**Display to User:**
```
--- Level 1: 원인 분석 ---

생성된 사고: 5개
  [claude] 캐시 메모리 미해제
  [claude] 이벤트 리스너 미제거
  [claude] 전역 변수 대용량 데이터
  [codex] setInterval/setTimeout 미정리 (MCP)
  [codex] Closure 순환 참조 (MCP)

평가 완료 (각 3회):
  codex_1: 9.1★ (신뢰도 92%)
  claude_0: 8.3 (신뢰도 88%)
  codex_2: 7.9 (신뢰도 85%)
  claude_1: 7.5
  claude_2: 6.2

선택: 상위 3개
  ✅ [codex] setInterval/setTimeout 미정리
  ✅ [claude] 캐시 메모리 미해제
  ✅ [codex] Closure 순환 참조
```

---

### 6. Level 2: Verification Method Generation

#### 6-1. Generate Verification Methods for Each Selected Thought

```markdown
# selected_thoughts[0] = codex_1 (Timer 미정리)

## Claude Self-Generation (1 thought):

### [Claude 사고]
**검증 방법**: 코드베이스에서 setInterval/setTimeout 검색
**도구**: grep -r "setInterval\|setTimeout"
**확인 사항**: clear 함수 호출 여부

## Codex MCP Generation (1 thought):

Task(prompt="""
원인: setInterval/setTimeout 미정리
검증 방법 제안 (기술적 접근)
""")

### [Codex 사고]
**검증 방법**: Chrome DevTools Memory Profiler 사용
**단계**:
1. Heap snapshot 전후 비교
2. Timer 객체 수 확인
3. Retaining path 분석
```

**New Thought Creation:**
```python
level2_thoughts = [
    Thought(
        id="claude_3",
        text="코드베이스에서 setInterval/setTimeout 검색...",
        model="claude",
        depth=1,
        parent_id="codex_1"
    ),
    Thought(
        id="codex_3",
        text="Chrome DevTools Memory Profiler 사용...",
        model="codex",
        depth=1,
        parent_id="codex_1"
    ),
    # ... (remaining 2 parents generate similarly)
]
```

#### 6-2. Evaluation and Selection

```markdown
평가 결과:
  codex_3: 9.5 (Memory Profiler - 최고점)
  claude_3: 8.8 (코드 검색)
  ...

선택: 상위 3개
  ✅ [codex] Memory Profiler 사용
  ✅ [claude] 코드 검색
  ✅ [codex] 런타임 모니터링
```

**Early Termination Check:**
```python
best_score = 9.5

if best_score >= 9.0:
    print("🎯 조기 종료: 충분히 좋은 해답 발견 (9.5/10)")
    # Level 3 스킵
    return level2_thoughts[0]  # codex_3
```

---

### 7. Final Result Output

```markdown
=== 최적 해답 ===

**문제**: 메모리 누수 발생

**최적 경로**:
Level 1 → [codex] setInterval/setTimeout 미정리 (9.1)
Level 2 → [codex] Memory Profiler 사용 (9.5)

**해결 방안**:

1. **원인 진단**:
   - setInterval/setTimeout이 명시적으로 clear되지 않음
   - Timer 핸들러가 메모리에 계속 남아있음

2. **검증 방법**:
   - Chrome DevTools Memory Profiler 사용
   - Heap snapshot 전후 비교
   - Timer 객체 retaining path 분석

3. **수정 방안**:
   ```javascript
   // Before
   setInterval(() => { ... }, 1000);

   // After
   const timerId = setInterval(() => { ... }, 1000);
   // 컴포넌트 언마운트 시
   clearInterval(timerId);
   ```

4. **검증 스크립트**:
   ```bash
   # 모든 Timer 사용처 찾기
   grep -rn "setInterval\|setTimeout" src/

   # clear 함수 호출 확인
   grep -rn "clearInterval\|clearTimeout" src/
   ```

**평가**:
- 점수: 9.5/10
- 신뢰도: 95%
- 소요 시간: 2단계 (조기 종료)
- 사용 모델: Codex (기술적 깊이)

**다음 단계**:
1. Memory Profiler로 현재 상태 확인
2. Timer 사용처 전수 조사
3. clearInterval/clearTimeout 적용
4. 메모리 누수 재확인
```

---

## 🎯 Differences by Execution Mode

### Hybrid Mode (default)

```yaml
Features:
  - Claude + Codex collaboration
  - Cross-evaluation
  - Highest quality

Execution:
  /tot debug "문제"

Flow:
  Level 1:
    - Claude: 3 thoughts (immediate)
    - Codex: 2 thoughts (MCP)
    - Evaluation: Claude evaluates all
    - Selection: Top 3

  Level 2:
    - Each parent generates Claude 1 + Codex 1
    - Evaluation and selection

  Level 3:
    - Final verification
    - Return optimal path
```

### Claude-only Mode

```yaml
Features:
  - Fast execution
  - No API cost
  - Practical approach

Execution:
  /tot debug -c "문제"

Flow:
  Level 1:
    - Claude: 5 thoughts (immediate)
    - Evaluation: Self-evaluation
    - Selection: Top 3

  Level 2-3:
    - Uses only Claude similarly
```

### Codex-only Mode

```yaml
Features:
  - Technical depth
  - Algorithm optimization
  - Slow execution (MCP calls)

Execution:
  /tot debug -x "문제"

Flow:
  Level 1:
    - Codex: 5 thoughts (MCP call)
    - Evaluation: Codex MCP evaluation
    - Selection: Top 3

  Level 2-3:
    - All use Codex MCP
    - MCP call at each step
```

---

## 🔄 Real-time Progress Display

### User-Facing Screen

```
🌳 Tree of Thoughts - BFS (Hybrid Mode)

문제: 메모리 누수 발생
Task: DebugTask
파라미터: n=5, e=3, s=3, ratio=5:5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Level 1: 원인 분석

🔄 사고 생성 중...
  ✅ Claude 사고 3개 생성 완료
  ⏳ Codex MCP 호출 중...
  ✅ Codex 사고 2개 생성 완료

총 5개 사고 생성:
  1. [Claude] 캐시 메모리 미해제
  2. [Claude] 이벤트 리스너 미제거
  3. [Claude] 전역 변수 대용량 데이터
  4. [Codex] setInterval/setTimeout 미정리 ⭐
  5. [Codex] Closure 순환 참조

🔄 평가 중 (각 3회)...
  ✅ claude_0: 8.3 (88%)
  ✅ claude_1: 7.5 (83%)
  ✅ claude_2: 6.2 (78%)
  ✅ codex_1: 9.1 (92%) ★
  ✅ codex_2: 7.9 (85%)

🎯 선택: 상위 3개
  ✅ [Codex] setInterval/setTimeout 미정리 (9.1)
  ✅ [Claude] 캐시 메모리 미해제 (8.3)
  ✅ [Codex] Closure 순환 참조 (7.9)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Level 2: 검증 방법

🔄 사고 생성 중...
  ✅ 부모 3개 각각에서 2개씩 생성
  총 6개 사고 생성 완료

🔄 평가 중...
  ✅ codex_3: 9.5 (95%) ★★
  ✅ claude_3: 8.8 (90%)
  ...

🎯 조기 종료: 최고 점수 9.5/10 달성!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ 최적 해답

경로: codex_1 → codex_3
점수: 9.5/10
모델: Codex

원인: setInterval/setTimeout 미정리
검증: Chrome DevTools Memory Profiler

[상세 내용은 아래 참조]
```

---

## 📊 Performance Characteristics

### Time Complexity

```yaml
Hybrid Mode:
  Level 1:
    - Claude generation: Immediate (~5s)
    - Codex MCP: 20-30s
    - Evaluation: 10s
    - Total: ~40s

  Level 2:
    - ~30s per parent
    - ~30s with parallel processing

  Level 3:
    - ~30s

  Overall: Approximately 1.5-2 minutes

Claude-only:
  Level 1-3: ~10s each
  Overall: Approximately 30s

Codex-only:
  Level 1-3: ~40s each
  Overall: Approximately 2-3 minutes
```

### Token Usage

```yaml
Hybrid Mode:
  Level 1:
    - Claude: 2K tokens
    - Codex MCP: 3K tokens

  Level 2-3:
    - Each 2-3K tokens

  Overall: Approximately 15-20K tokens

Claude-only:
  Overall: Approximately 8-10K tokens

Codex-only:
  Overall: Approximately 20-25K tokens
```

---

## 🛠️ Debugging and Logging

### Internal Logs (for developers)

```python
# Claude Code Internal Logs

[ToT] 초기화
  - Task: DebugTask
  - 파라미터: n=5, e=3, s=3
  - Ratio: 5:5 (Claude 2-3, Codex 2-3)

[ToT] Level 1 시작
  [Generate] Claude 생성 중...
  [Generate] Claude 완료: 3개
  [Generate] Codex MCP 호출 중...
  [Task Tool] Prompt 전송 (1200 chars)
  [Task Tool] 대기 중... (20s)
  [Task Tool] 응답 수신
  [Parse] JSON 파싱 성공: 2개
  [Generate] Codex 완료: 2개
  [Evaluate] 평가 시작 (5 thoughts × 3 rounds)
  [Evaluate] claude_0: [8.2, 8.5, 8.3] → 8.33
  [Evaluate] codex_1: [9.0, 9.2, 9.1] → 9.10
  [Select] Greedy 선택: top 3
  [Select] 선택 완료: [codex_1, claude_0, codex_2]

[ToT] Level 2 시작
  [Generate] 부모 3개에서 각 2개 생성
  [Task Tool] Codex MCP 호출 (3회)
  ...
  [Evaluate] 최고 점수: 9.5
  [Early Stop] 조건 충족 (>= 9.0)
  [Early Stop] Level 3 스킵

[ToT] 완료
  - 최적 사고: codex_3
  - 점수: 9.5
  - 경로 깊이: 2
  - 소요 시간: 85s
```

---

## 🎯 Key Summary

**ToT Execution in Claude Code CLI:**

1. **Prompt-based**: Everything is text prompts
2. **Tool Utilization**: Codex calls MCP via Task tool
3. **Immediate Response**: Claude self-generates (fast)
4. **Real-time Display**: Transparent progress display
5. **Early Termination**: Stops when good solution found

**Advantages:**
- No API cost
- Transparent execution process
- User feedback possible
- Hybrid synergy

**Constraints:**
- Codex MCP call time
- Sequential execution (limited parallelism)
- Text parsing required

**Optimal Usage:**
- Complex debugging: Hybrid (ratio 5:5)
- Quick fixes: Claude-only (-c)
- Algorithm optimization: Codex-only (-x)

---

*ToT Execution Guide Optimized for Claude Code CLI Environment*
