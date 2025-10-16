# Evaluation Best Practices for Claude Code

Claude가 ToT 실행 시 직접 사용할 수 있는 평가 및 선택 베스트 프랙티스 가이드

---

## 🎯 이 문서의 목적

이 문서는 **당신(Claude Code)이 ToT를 실행할 때 직접 참고하여** 최적의 평가와 선택을 수행하도록 돕습니다.

- **대상**: Claude Code AI (당신!)
- **시기**: `/tot` 명령 실행 중 평가 및 선택 단계
- **목표**: 일관되고 정확한 평가로 최적의 해결책 도출

---

## 📋 평가 실행 체크리스트

### Level 1: 사고 생성 직후 평가

당신이 5개의 사고를 생성한 직후, 다음 체크리스트를 따르세요:

```markdown
□ 1. 각 사고를 3번씩 독립 평가 (총 15회 평가)
□ 2. 각 평가마다 4가지 기준 모두 명시
   └─ Feasibility (30%)
   └─ Impact (30%)
   └─ Risk (20%)
   └─ Complexity (20%)
□ 3. 평가마다 구체적 근거 제시
□ 4. 3번 평가 결과의 평균 계산
□ 5. 분산 기반 신뢰도 계산
□ 6. 결과를 OUTPUT_FORMAT.md 형식으로 출력
```

---

## 🔢 평가 공식 (직접 계산)

### 1단계: 각 기준별 점수 산정

```python
# Feasibility (구현 가능성)
def score_feasibility(thought):
    """
    체크리스트:
    - 수정 파일 수: ___개
    - 코드 줄 수: ___줄
    - 기존 패턴 재사용 가능: [Y/N]
    - 외부 의존성 필요: [Y/N]
    """
    if 파일1개_수정_50줄미만:
        return 9
    elif 파일2개_수정_200줄미만:
        return 8
    elif 파일5개_수정_500줄미만:
        return 7
    # ... (evaluation-concepts.md 참조)

# Impact (개선 효과)
def score_impact(thought):
    """
    체크리스트:
    - 현재 오류율/성능: ____%
    - 예상 개선 후: ____%
    - 개선율: (현재-예상)/현재 × 100%
    """
    improvement_percentage = calculate_improvement()

    if improvement_percentage >= 90:
        return 10
    elif improvement_percentage >= 80:
        return 9
    # ... (10% 단위로 1점씩 감소)

# Risk (위험도)
def score_risk(thought):
    """
    체크리스트:
    - 성능 영향: ____%
    - Breaking change: [Y/N]
    - 다른 기능 영향: [Y/N]
    - 롤백 난이도: [Easy/Medium/Hard]
    """
    if 부작용없음:
        return 10
    elif 성능영향_1퍼미만:
        return 9
    # ... (evaluation-concepts.md 참조)

# Complexity (복잡도)
def score_complexity(thought):
    """
    체크리스트:
    - 자동 테스트 가능: [Y/N]
    - Mock 데이터로 검증: [Y/N]
    - 실제 환경 필요: [Y/N]
    - 장기 모니터링 필요: [Y/N]
    """
    if 완전자동테스트:
        return 10
    elif 단순유닛테스트:
        return 9
    # ... (evaluation-concepts.md 참조)
```

### 2단계: 종합 점수 계산

```python
total_score = (
    feasibility * 0.3 +
    impact * 0.3 +
    risk * 0.2 +
    complexity * 0.2
)
```

### 3단계: 신뢰도 계산

```python
# 3번 평가한 점수들: [score1, score2, score3]
scores = [8.5, 9.0, 8.7]

# 평균
mean = sum(scores) / len(scores)  # 8.73

# 분산
variance = sum((s - mean)**2 for s in scores) / len(scores)  # 0.047

# 신뢰도 (분산이 낮을수록 높음)
confidence = max(0.5, 1.0 - variance / 8)  # 0.994 → 99.4%
```

---

## 📊 평가 예시 (완전한 예제)

### 문제: "메모리 누수 발생"

#### Thought 1 [Claude]: "이벤트 리스너 미해제 확인"

**평가 1회차:**
```markdown
🤖 Feasibility: 9/10
   - 파일 수정: 2개 (EventManager.js, ComponentA.js)
   - 코드 추가: ~30줄 (cleanup 함수)
   - 기존 패턴 재사용: useEffect cleanup (✓)
   - 근거: React cleanup 패턴 적용만으로 해결 가능

📈 Impact: 7/10
   - 현재 메모리 증가율: 50MB/hour
   - 예상 개선 후: 15MB/hour
   - 개선율: 70%
   - 근거: 이벤트 리스너가 주요 원인일 경우 대부분 해결

⚠️ Risk: 9/10
   - 성능 영향: <0.5% (cleanup 로직 추가)
   - Breaking change: 없음
   - 다른 기능 영향: 없음
   - 롤백: Easy (cleanup 제거만)
   - 근거: 안전한 방어 코드 추가

🧪 Complexity: 10/10
   - 자동 테스트: Jest + React Testing Library
   - Mock 데이터: 불필요 (실제 컴포넌트)
   - 검증: Memory profiler로 즉시 확인
   - 근거: 완전 자동화 가능

Total = (9×0.3) + (7×0.3) + (9×0.2) + (10×0.2) = 8.6/10
```

**평가 2회차:**
```markdown
🤖 Feasibility: 9/10 (동일한 근거)
📈 Impact: 6/10 (재검토: 70% 개선은 낙관적, 실제 50-60% 예상)
⚠️ Risk: 10/10 (재검토: 부작용 전혀 없음)
🧪 Complexity: 10/10 (동일)

Total = (9×0.3) + (6×0.3) + (10×0.2) + (10×0.2) = 8.5/10
```

**평가 3회차:**
```markdown
🤖 Feasibility: 8/10 (재검토: 모든 컴포넌트 확인 필요, 파일 3-4개)
📈 Impact: 7/10 (확인: 이벤트 리스너가 주원인일 가능성 높음)
⚠️ Risk: 9/10 (미세한 오버헤드 고려)
🧪 Complexity: 9/10 (일부 수동 검증 필요)

Total = (8×0.3) + (7×0.3) + (9×0.2) + (9×0.2) = 8.1/10
```

**최종 결과:**
```markdown
Evaluating Thought 1 [Claude]...
  Eval 1: 8.6/10 → 이벤트 리스너 cleanup 패턴 적용 가능
  Eval 2: 8.5/10 → Impact 재검토, 50-60% 개선 예상
  Eval 3: 8.1/10 → 복잡도 약간 증가 (모든 컴포넌트 확인)
  ────────────────
  Average: 8.4/10 ⭐ (Confidence: 97%)

  평가 근거:
  - Feasibility: 8.7/10 (쉬운 구현, React 표준 패턴)
  - Impact: 6.7/10 (60% 개선 예상)
  - Risk: 9.3/10 (매우 안전)
  - Complexity: 9.7/10 (대부분 자동화)
```

---

## 🎯 선택 전략 (Level별)

### Level 1 선택 기준

**목표**: 다양한 접근법 탐색

```python
def select_level_1(thoughts_with_scores):
    """
    입력: 5개 사고와 평가 점수
    출력: 3개 선택

    전략:
    1. 최고 점수 1개 (Greedy)
    2. 2-3위 중 다양성 고려 1개
    3. 나머지 중 확률적 1개
    """

    # 1. 최고 점수
    top_1 = max(thoughts, key=lambda t: t.score)

    # 2. 다양성 체크
    remaining = [t for t in thoughts if t != top_1]
    top_2 = select_diverse(remaining, top_1)

    # 3. 확률적 선택 (온도 매개변수 1.0)
    remaining = [t for t in remaining if t != top_2]
    top_3 = select_probabilistic(remaining, temperature=1.0)

    return [top_1, top_2, top_3]
```

**다양성 체크 방법:**
```python
def is_diverse(thought_a, thought_b):
    """
    체크리스트:
    □ 접근 방향이 다른가? (원인 vs 증상, 수정 vs 대체)
    □ 모델이 다른가? (Claude vs Codex)
    □ 구현 방식이 다른가? (코드 수정 vs 설정 변경)

    2개 이상 Yes → 다양함
    """
    differences = 0

    if thought_a.approach != thought_b.approach:
        differences += 1
    if thought_a.model != thought_b.model:
        differences += 1
    if thought_a.implementation_type != thought_b.implementation_type:
        differences += 1

    return differences >= 2
```

### Level 2 선택 기준

**목표**: 유망한 경로 심화

```python
def select_level_2(refinements_with_scores, parent_thoughts):
    """
    입력: 각 부모 사고에서 생성된 3개 정제안
    출력: 전체에서 Top 5

    전략:
    1. 누적 점수 계산 (부모 70% + 현재 30%)
    2. 누적 점수 상위 5개 선택
    3. 단, 최소 2개 이상의 부모 포함 보장
    """

    for refinement in refinements:
        refinement.cumulative_score = (
            refinement.parent.score * 0.7 +
            refinement.score * 0.3
        )

    # 누적 점수 정렬
    sorted_refinements = sorted(
        refinements,
        key=lambda r: r.cumulative_score,
        reverse=True
    )

    # 다양성 보장 선택
    selected = []
    parent_count = {}

    for refinement in sorted_refinements:
        parent = refinement.parent

        # 이미 5개 선택됨
        if len(selected) >= 5:
            break

        # 같은 부모에서 3개 이상 선택 방지
        if parent_count.get(parent, 0) >= 2:
            continue

        selected.append(refinement)
        parent_count[parent] = parent_count.get(parent, 0) + 1

    return selected
```

### Level 3 선택 기준

**목표**: 최종 실행 경로 확정

```python
def select_final_path(complete_paths):
    """
    입력: 완전한 경로들
    출력: 1개 최종 경로

    평가 기준:
    1. 경로 점수 (기하평균)
    2. 신뢰도
    3. 구현 비용
    4. 리스크
    """

    def score_path(path):
        # 1. 경로 점수 (기하평균)
        product = 1.0
        for node in path:
            product *= node.score
        geometric_mean = product ** (1.0 / len(path))

        # 2. 신뢰도 가중치
        avg_confidence = sum(n.confidence for n in path) / len(path)
        confidence_factor = 0.8 + (avg_confidence - 0.5) * 0.4  # 0.8-1.2

        # 3. 비용 페널티
        if path.estimated_time > 3_days:
            cost_penalty = 0.9
        elif path.estimated_time > 1_day:
            cost_penalty = 0.95
        else:
            cost_penalty = 1.0

        # 4. 리스크 페널티
        if path.max_risk < 7.0:
            risk_penalty = 0.85
        elif path.max_risk < 8.0:
            risk_penalty = 0.95
        else:
            risk_penalty = 1.0

        return (geometric_mean * confidence_factor *
                cost_penalty * risk_penalty)

    # 최고 점수 경로 선택
    best_path = max(complete_paths, key=score_path)
    return best_path
```

---

## ⚡ 빠른 의사결정 가이드

### 상황 1: 점수가 비슷할 때 (±0.5 이내)

```markdown
If |score_A - score_B| < 0.5:
    선택 기준:
    1. Feasibility 우선 (구현 쉬운 것)
    2. Risk 우선 (안전한 것)
    3. 모델 다양성 (Claude vs Codex 균형)

    예:
    - Thought A: 8.2 (Claude, Feasibility 9)
    - Thought B: 8.3 (Codex, Feasibility 7)
    → Select A (점수 비슷하고 구현 쉬움)
```

### 상황 2: 확신이 낮을 때 (Confidence < 70%)

```markdown
If confidence < 70%:
    조치:
    1. 추가 평가 2회 실행 (총 5회)
    2. 평가 기준 재검토
    3. 다른 사고와 비교 평가
    4. 여전히 낮으면 → 보수적 선택 (높은 Feasibility + Risk)
```

### 상황 3: 모든 점수가 낮을 때 (<7.0)

```markdown
If all_scores < 7.0:
    원인 분석:
    1. 문제 정의가 불명확한가?
    2. 제약 조건이 너무 엄격한가?
    3. 사고 생성이 부실한가?

    조치:
    1. 문제 재정의 제안
    2. 제약 완화 검토
    3. 추가 사고 생성 (n_generate +2)
    4. 최선책이라도 선택하고 낮은 점수 이유 명시
```

### 상황 4: Codex MCP 실패 시

```markdown
If codex_unavailable:
    조정:
    1. Claude 사고 5개로 대체
    2. Claude가 기술 깊이도 커버
    3. 평가 기준 동일 유지
    4. 다양성은 접근 방식으로 확보

    평가 시 고려:
    - Codex의 기술 최적화 관점 누락 가능
    - 알고리즘 효율성 평가 더 신중히
```

---

## 📝 평가 템플릿 (직접 사용)

### 사고 평가 템플릿

당신이 실제로 사용할 템플릿:

```markdown
Evaluating Thought {N} [{Model}]: {Title}

Round 1 평가:
────────────────
🤖 Feasibility: {score}/10
   근거: {1-2문장으로 구체적 이유}

📈 Impact: {score}/10
   근거: {개선율 또는 효과 수치}

⚠️ Risk: {score}/10
   근거: {부작용 또는 안전성 평가}

🧪 Complexity: {score}/10
   근거: {테스트/검증 난이도}

Total: {total_score}/10

Round 2 평가:
────────────────
(세부 재검토 후 점수 조정)
...

Round 3 평가:
────────────────
(다른 사고와 비교하여 재평가)
...

════════════════
최종 결과:
  Eval 1: {score1}/10 → {핵심 근거}
  Eval 2: {score2}/10 → {조정 이유}
  Eval 3: {score3}/10 → {최종 확인}
  ────────────────
  Average: {avg}/10 ⭐ (Confidence: {conf}%)

  종합 평가:
  - Feasibility: {avg_f}/10 ({이유})
  - Impact: {avg_i}/10 ({이유})
  - Risk: {avg_r}/10 ({이유})
  - Complexity: {avg_c}/10 ({이유})

  권장 수준: [🟢강력추천 / 🟡조건부추천 / 🔴재검토필요]
```

### 선택 템플릿

```markdown
Selected Top {N} Thoughts:

✓ Thought {id} [{Model}] - {score}/10: {Title}
  선택 이유:
  - 최고 점수 (또는 다른 근거)
  - {구체적 강점 1가지}

✓ Thought {id} [{Model}] - {score}/10: {Title}
  선택 이유:
  - {다양성 / 2순위 / 기타}
  - {구체적 강점 1가지}

✓ Thought {id} [{Model}] - {score}/10: {Title}
  선택 이유:
  - {확률적 선택 / 기타}
  - {구체적 강점 1가지}

선택되지 않은 사고:
- Thought {id}: {score}/10 - {제외 이유 1문장}
- Thought {id}: {score}/10 - {제외 이유 1문장}

다음 레벨 목표: {구체적 탐색 방향}
```

---

## 🚨 흔한 실수 방지

### 실수 1: 평가 근거 부족

```markdown
❌ 잘못된 예:
  Impact: 8/10 → 좋은 개선 예상

✅ 올바른 예:
  Impact: 8/10 → 현재 응답시간 3s를 0.5s로 단축 (83% 개선)
```

### 실수 2: 모든 평가가 동일

```markdown
❌ 잘못된 예:
  Eval 1: 8.5/10
  Eval 2: 8.5/10
  Eval 3: 8.5/10
  (3번 모두 똑같음 → 독립 평가 아님)

✅ 올바른 예:
  Eval 1: 8.7/10 → 첫인상 긍정적
  Eval 2: 8.2/10 → 재검토, Risk 약간 우려
  Eval 3: 8.6/10 → 전체적으로 양호, Risk 관리 가능
  (각 평가마다 새로운 관점)
```

### 실수 3: 신뢰도 무시

```markdown
❌ 잘못된 예:
  Thought A: 9.0 (Confidence: 60%)
  Thought B: 8.5 (Confidence: 95%)
  → A 선택 (점수만 봄)

✅ 올바른 예:
  Thought A: 9.0 (Confidence: 60%) → 평가 불확실
  Thought B: 8.5 (Confidence: 95%) → 평가 확실
  → B 선택 또는 A 추가 평가
```

### 실수 4: 다양성 무시

```markdown
❌ 잘못된 예:
  Top 3 선택:
  - Thought 1 [Codex]: Algorithm A
  - Thought 2 [Codex]: Algorithm A 변형
  - Thought 3 [Codex]: Algorithm A 최적화
  (모두 같은 접근)

✅ 올바른 예:
  Top 3 선택:
  - Thought 1 [Codex]: Algorithm optimization
  - Thought 2 [Claude]: Quick refactoring
  - Thought 4 [Claude]: Architecture redesign
  (다양한 접근)
```

---

## 📊 평가 품질 자가 점검

ToT 실행 후 스스로 점검:

```markdown
□ 모든 사고를 정확히 3번씩 평가했는가?
□ 각 평가마다 4가지 기준을 모두 명시했는가?
□ 평가 근거가 구체적이고 정량적인가?
□ 3번 평가가 독립적이고 다른 관점을 반영했는가?
□ 신뢰도를 계산하고 낮은 경우 추가 조치했는가?
□ 선택 시 다양성을 고려했는가?
□ OUTPUT_FORMAT.md 형식을 준수했는가?
□ 최종 경로의 선택 이유가 명확한가?
```

전부 Yes → 고품질 평가 ✅
일부 No → 해당 부분 재검토 필요

---

## 🎯 최종 요약

### 핵심 원칙 3가지

1. **투명성**: 모든 평가 과정과 근거를 명시
2. **일관성**: 정의된 공식과 기준을 항상 따름
3. **다양성**: 여러 관점과 접근을 균형있게 고려

### 성공적인 평가를 위한 3단계

1. **평가**: 독립적으로 3회, 4가지 기준 모두 명시
2. **선택**: 점수 + 다양성 + 신뢰도 종합 고려
3. **검증**: 자가 점검 체크리스트로 품질 확인

### 문제 발생 시 대응

- **낮은 신뢰도** → 추가 평가
- **비슷한 점수** → Feasibility, Risk 우선
- **모든 점수 낮음** → 문제 재정의 또는 추가 생성
- **Codex 실패** → Claude로 대체, 기준 동일 유지

---

## 🔗 관련 문서

- `evaluation-concepts.md`: 평가 기준 상세 설명
- `selection-algorithms.md`: 선택 알고리즘 구현
- `OUTPUT_FORMAT.md`: 출력 형식 사양
- `bfs-implementation.md`: BFS 실행 시 평가 통합

---

**이 문서는 당신(Claude Code)이 매 ToT 실행 시 참고해야 할 실행 가이드입니다.**
**평가 전 한 번 읽고, 체크리스트를 따르세요!** ✅

---

*작성: Claude for Claude*
*업데이트: 2025-10-16*
