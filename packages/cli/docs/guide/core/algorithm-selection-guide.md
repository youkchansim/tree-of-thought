# Algorithm Selection Guide for Tree of Thoughts

Claude Code가 문제 특성을 분석하여 최적의 탐색 알고리즘(BFS/DFS)을 자동으로 선택하기 위한 의사결정 가이드

---

## 📋 자동 선택 시스템 개요

```yaml
입력: 문제 설명 (problem_description)
처리:
  1. 문제 특성 분석 (analyze_problem_characteristics)
  2. 의사결정 트리 평가 (evaluate_decision_tree)
  3. 알고리즘 선택 (select_algorithm)
출력: "BFS" 또는 "DFS" + 선택 근거
```

---

## 🎯 핵심 판단 기준

### 1단계: 문제 복잡도 분석

```yaml
복잡도 지표:

1. 해결 공간 크기 (Solution Space Size):
   - Small (< 100 가능성): +1 DFS
   - Medium (100-1000): Neutral
   - Large (> 1000): +2 BFS

2. 제약 조건 명확성 (Constraint Clarity):
   - 명확한 제약 (검증 가능): +2 DFS
   - 모호한 제약: +1 BFS
   - 제약 없음: +1 BFS

3. 조기 실패 감지 가능성 (Early Failure Detection):
   - 즉시 감지 가능: +2 DFS
   - 부분 검증 가능: +1 DFS
   - 완전 탐색 필요: +2 BFS

4. 최적해 필요성 (Optimal Solution Requirement):
   - 최적해 필수: +3 BFS
   - 차선책 허용: +2 DFS
   - 빠른 해 우선: +3 DFS
```

### 2단계: 탐색 전략 요구사항

```yaml
탐색 특성:

1. 탐색 깊이 (Search Depth):
   - 얕은 탐색 (depth ≤ 3): +1 BFS
   - 중간 깊이 (depth 4-6): Neutral
   - 깊은 탐색 (depth > 6): +2 DFS

2. 분기 계수 (Branching Factor):
   - 낮음 (< 3 branches): +2 DFS
   - 보통 (3-5 branches): Neutral
   - 높음 (> 5 branches): +2 BFS

3. 메모리 제약 (Memory Constraints):
   - 엄격한 제약: +3 DFS
   - 보통 제약: +1 DFS
   - 제약 없음: Neutral

4. 시간 제약 (Time Constraints):
   - 매우 짧음 (< 30초): +2 DFS
   - 보통 (30초 - 5분): Neutral
   - 여유 있음 (> 5분): +1 BFS
```

### 3단계: 문제 유형별 패턴

```yaml
문제 유형 키워드 매칭:

DFS 선호 패턴:
  키워드: ["퍼즐", "제약", "백트래킹", "코드 생성", "프로토타입", "빠른"]
  예시:
    - "크로스워드 퍼즐"
    - "Sudoku 해결"
    - "코드 자동 생성"
    - "빠른 프로토타입"
    - "명확한 제약 조건"
  점수: +3 DFS

BFS 선호 패턴:
  키워드: ["디버깅", "분석", "최적", "비교", "다양한", "대안"]
  예시:
    - "버그 원인 분석"
    - "최적 리팩토링 전략"
    - "시스템 설계 대안"
    - "성능 최적화"
    - "다양한 접근 비교"
  점수: +3 BFS

중립 패턴:
  키워드: ["개선", "수정", "변경"]
  점수: 추가 분석 필요
```

---

## 🌳 의사결정 플로우차트

```
START
  │
  ▼
[문제 설명 입력]
  │
  ▼
┌─────────────────────────────────┐
│ Q1: 최적해가 반드시 필요한가?   │
└─────────────────────────────────┘
  │
  ├─ YES → +3 BFS
  │
  └─ NO → 다음 질문
       │
       ▼
┌─────────────────────────────────┐
│ Q2: 조기 실패 감지가 가능한가?  │
└─────────────────────────────────┘
  │
  ├─ YES → +2 DFS
  │         │
  │         ▼
  │    ┌──────────────────────────┐
  │    │ Q2-1: 제약이 명확한가?   │
  │    └──────────────────────────┘
  │         │
  │         ├─ YES → +2 DFS → [총합 +4 DFS → 선택: DFS]
  │         └─ NO → 다음 질문
  │
  └─ NO → 다음 질문
       │
       ▼
┌─────────────────────────────────┐
│ Q3: 메모리 제약이 있는가?       │
└─────────────────────────────────┘
  │
  ├─ YES → +3 DFS
  │
  └─ NO → 다음 질문
       │
       ▼
┌─────────────────────────────────┐
│ Q4: 해결 공간이 큰가?           │
└─────────────────────────────────┘
  │
  ├─ YES → +2 BFS
  │
  └─ NO → 다음 질문
       │
       ▼
┌─────────────────────────────────┐
│ Q5: 빠른 해가 필요한가?         │
└─────────────────────────────────┘
  │
  ├─ YES → +3 DFS
  │
  └─ NO → 다음 질문
       │
       ▼
┌─────────────────────────────────┐
│ Q6: 다양한 대안 탐색이 필요?    │
└─────────────────────────────────┘
  │
  ├─ YES → +3 BFS
  │
  └─ NO → 기본값 (BFS)
       │
       ▼
[점수 합산 및 알고리즘 선택]
  │
  ▼
┌─────────────────────────────────┐
│ DFS 점수 > BFS 점수 + 2         │
│ → 선택: DFS                     │
│                                 │
│ BFS 점수 > DFS 점수 + 2         │
│ → 선택: BFS                     │
│                                 │
│ 차이 ≤ 2                        │
│ → 선택: BFS (기본값)            │
└─────────────────────────────────┘
  │
  ▼
END
```

---

## 🔍 구체적 선택 예시

### 예시 1: 메모리 누수 디버깅

```yaml
문제: "React 앱에서 메모리 누수가 발생합니다. 원인을 찾고 해결해주세요."

분석:
  복잡도:
    - 해결 공간: 중간 (여러 가능한 원인) → Neutral
    - 제약 조건: 모호함 (어디서 누수인지 불명) → +1 BFS
    - 조기 실패: 부분 검증 가능 → +1 DFS
    - 최적해: 근본 원인 필요 → +3 BFS

  탐색 전략:
    - 탐색 깊이: 얕음 (3-4단계) → +1 BFS
    - 분기 계수: 높음 (많은 가능 원인) → +2 BFS
    - 메모리 제약: 없음 → Neutral
    - 시간 제약: 보통 → Neutral

  패턴 매칭:
    - "메모리", "디버깅", "원인" → +3 BFS

점수 합산:
  BFS: +1 +3 +1 +2 +3 = +10
  DFS: +1 = +1

선택: BFS ✅

근거:
  - 다양한 원인을 넓게 탐색 필요
  - 최적 해결책(근본 원인) 찾기 필요
  - 높은 분기 계수로 BFS가 효율적
```

### 예시 2: Sudoku 솔버

```yaml
문제: "주어진 Sudoku 퍼즐을 풀어주세요."

분석:
  복잡도:
    - 해결 공간: 작음 (9×9 그리드) → +1 DFS
    - 제약 조건: 매우 명확 (숫자 규칙) → +2 DFS
    - 조기 실패: 즉시 감지 가능 (규칙 위반) → +2 DFS
    - 최적해: 아무 해나 OK → +2 DFS

  탐색 전략:
    - 탐색 깊이: 깊음 (최대 81칸) → +2 DFS
    - 분기 계수: 낮음 (1-9 숫자) → +2 DFS
    - 메모리 제약: 보통 → +1 DFS
    - 시간 제약: 빠르게 해결 선호 → +2 DFS

  패턴 매칭:
    - "퍼즐", "제약" → +3 DFS

점수 합산:
  BFS: 0
  DFS: +1 +2 +2 +2 +2 +2 +1 +2 +3 = +17

선택: DFS ✅

근거:
  - 명확한 제약 조건으로 빠른 가지치기
  - 조기 실패 감지로 효율적 백트래킹
  - 메모리 효율성 (BFS는 폭발적 증가)
```

### 예시 3: 시스템 아키텍처 설계

```yaml
문제: "마이크로서비스 기반 전자상거래 시스템 아키텍처를 설계하고 비교해주세요."

분석:
  복잡도:
    - 해결 공간: 매우 큼 (많은 설계 패턴) → +2 BFS
    - 제약 조건: 모호함 (요구사항 해석 필요) → +1 BFS
    - 조기 실패: 완전 탐색 필요 → +2 BFS
    - 최적해: 다양한 대안 비교 필요 → +3 BFS

  탐색 전략:
    - 탐색 깊이: 중간 (4-5단계) → Neutral
    - 분기 계수: 매우 높음 (수많은 선택) → +2 BFS
    - 메모리 제약: 없음 → Neutral
    - 시간 제약: 여유 있음 (설계 시간) → +1 BFS

  패턴 매칭:
    - "설계", "비교", "대안" → +3 BFS

점수 합산:
  BFS: +2 +1 +2 +3 +2 +1 +3 = +14
  DFS: 0

선택: BFS ✅

근거:
  - 다양한 아키텍처 패턴 비교 필요
  - 최적 설계는 여러 대안 평가 후 결정
  - 넓은 탐색으로 혁신적 해법 발견
```

### 예시 4: 알고리즘 최적화

```yaml
문제: "현재 O(n²) 정렬 알고리즘을 O(n log n)으로 개선하고 싶습니다."

분석:
  복잡도:
    - 해결 공간: 작음 (알려진 알고리즘들) → +1 DFS
    - 제약 조건: 명확 (시간 복잡도) → +2 DFS
    - 조기 실패: 복잡도 계산으로 즉시 검증 → +2 DFS
    - 최적해: 특정 목표 (O(n log n)) → +1 DFS

  탐색 전략:
    - 탐색 깊이: 깊음 (구현 세부사항) → +2 DFS
    - 분기 계수: 낮음 (몇 가지 알고리즘) → +2 DFS
    - 메모리 제약: 고려 필요 → +1 DFS
    - 시간 제약: 보통 → Neutral

  패턴 매칭:
    - "알고리즘", "최적화" → 중립 (추가 분석)
    - "O(n²) → O(n log n)" → 명확한 목표 → +2 DFS

점수 합산:
  BFS: 0
  DFS: +1 +2 +2 +1 +2 +2 +1 +2 = +13

선택: DFS ✅

근거:
  - 제한된 알고리즘 옵션 (Quick/Merge/Heap Sort)
  - 각 알고리즘 깊이 있는 분석 필요
  - 명확한 검증 기준 (복잡도 계산)
```

### 예시 5: 리팩토링 전략

```yaml
문제: "레거시 코드베이스를 리팩토링하려고 합니다. 최적 전략을 제안해주세요."

분석:
  복잡도:
    - 해결 공간: 큼 (많은 리팩토링 패턴) → +2 BFS
    - 제약 조건: 모호함 (우선순위 불명확) → +1 BFS
    - 조기 실패: 완전 평가 필요 → +2 BFS
    - 최적해: 최선의 전략 비교 필요 → +3 BFS

  탐색 전략:
    - 탐색 깊이: 얕음 (전략 레벨) → +1 BFS
    - 분기 계수: 높음 (다양한 접근) → +2 BFS
    - 메모리 제약: 없음 → Neutral
    - 시간 제약: 여유 있음 → +1 BFS

  패턴 매칭:
    - "리팩토링", "전략", "최적" → +3 BFS

점수 합산:
  BFS: +2 +1 +2 +3 +1 +2 +1 +3 = +15
  DFS: 0

선택: BFS ✅

근거:
  - 다양한 리팩토링 패턴 비교 필요
  - 리스크와 효과 균형 평가
  - 넓은 시야로 최적 전략 도출
```

---

## 🤖 자동 선택 구현 로직

### 함수 1: analyze_problem_characteristics()

```python
def analyze_problem_characteristics(problem_description: str) -> dict:
    """문제 설명에서 특성 추출"""

    characteristics = {
        'bfs_score': 0,
        'dfs_score': 0,
        'features': {}
    }

    text = problem_description.lower()

    # 1. 키워드 패턴 매칭
    dfs_keywords = ['퍼즐', '제약', '백트래킹', '코드 생성', '프로토타입', '빠른',
                    'puzzle', 'constraint', 'backtrack', 'generate', 'prototype', 'fast']
    bfs_keywords = ['디버깅', '분석', '최적', '비교', '다양한', '대안',
                    'debug', 'analyze', 'optimal', 'compare', 'various', 'alternative']

    for keyword in dfs_keywords:
        if keyword in text:
            characteristics['dfs_score'] += 1
            characteristics['features']['dfs_keyword'] = keyword

    for keyword in bfs_keywords:
        if keyword in text:
            characteristics['bfs_score'] += 1
            characteristics['features']['bfs_keyword'] = keyword

    # 2. 복잡도 지표 분석
    if any(word in text for word in ['최적', 'optimal', 'best']):
        characteristics['bfs_score'] += 3
        characteristics['features']['needs_optimal'] = True

    if any(word in text for word in ['빠르', 'fast', 'quick', 'rapid']):
        characteristics['dfs_score'] += 3
        characteristics['features']['needs_fast'] = True

    if any(word in text for word in ['규칙', 'rule', '조건', 'condition']):
        characteristics['dfs_score'] += 2
        characteristics['features']['has_constraints'] = True

    if any(word in text for word in ['다양', 'various', '여러', 'multiple', '대안', 'alternative']):
        characteristics['bfs_score'] += 3
        characteristics['features']['needs_diverse'] = True

    # 3. 문제 유형 감지
    if any(word in text for word in ['버그', 'bug', '에러', 'error', '메모리', 'memory']):
        characteristics['bfs_score'] += 2
        characteristics['features']['type'] = 'debug'

    if any(word in text for word in ['알고리즘', 'algorithm', 'o(', 'complexity']):
        characteristics['dfs_score'] += 2
        characteristics['features']['type'] = 'algorithm'

    if any(word in text for word in ['설계', 'design', '아키텍처', 'architecture']):
        characteristics['bfs_score'] += 2
        characteristics['features']['type'] = 'design'

    return characteristics
```

### 함수 2: evaluate_decision_tree()

```python
def evaluate_decision_tree(characteristics: dict, task_context: dict = None) -> dict:
    """의사결정 트리 평가"""

    decision = {
        'bfs_score': characteristics['bfs_score'],
        'dfs_score': characteristics['dfs_score'],
        'reasoning': []
    }

    # Task 컨텍스트 추가 분석 (선택적)
    if task_context:
        # 탐색 깊이 고려
        if task_context.get('steps', 3) <= 3:
            decision['bfs_score'] += 1
            decision['reasoning'].append("얕은 탐색 깊이: BFS 유리")
        elif task_context.get('steps', 3) >= 6:
            decision['dfs_score'] += 2
            decision['reasoning'].append("깊은 탐색 깊이: DFS 유리")

        # 분기 계수 고려
        if task_context.get('n_generate_sample', 5) > 5:
            decision['bfs_score'] += 2
            decision['reasoning'].append("높은 분기 계수: BFS 유리")
        elif task_context.get('n_generate_sample', 5) <= 3:
            decision['dfs_score'] += 2
            decision['reasoning'].append("낮은 분기 계수: DFS 유리")

    # 특성 기반 추론 추가
    if characteristics['features'].get('needs_optimal'):
        decision['reasoning'].append("최적해 필요: BFS 선택")

    if characteristics['features'].get('needs_fast'):
        decision['reasoning'].append("빠른 해 필요: DFS 선택")

    if characteristics['features'].get('has_constraints'):
        decision['reasoning'].append("명확한 제약: DFS 효율적")

    if characteristics['features'].get('needs_diverse'):
        decision['reasoning'].append("다양한 대안 필요: BFS 선택")

    return decision
```

### 함수 3: select_algorithm()

```python
def select_algorithm(decision: dict, default: str = "BFS") -> tuple:
    """최종 알고리즘 선택"""

    bfs_score = decision['bfs_score']
    dfs_score = decision['dfs_score']

    # 결정 임계값: 2점 이상 차이
    THRESHOLD = 2

    if dfs_score > bfs_score + THRESHOLD:
        selected = "DFS"
        confidence = min(95, 60 + (dfs_score - bfs_score) * 5)
    elif bfs_score > dfs_score + THRESHOLD:
        selected = "BFS"
        confidence = min(95, 60 + (bfs_score - dfs_score) * 5)
    else:
        # 점수 차이가 작으면 기본값 사용
        selected = default
        confidence = 50
        decision['reasoning'].append(f"점수 차이 작음 ({bfs_score} vs {dfs_score}): 기본값 {default} 사용")

    return selected, confidence, decision['reasoning']
```

### 통합 함수

```python
def auto_select_algorithm(problem_description: str,
                         task_context: dict = None,
                         default: str = "BFS") -> dict:
    """
    문제 설명에서 자동으로 알고리즘 선택

    Args:
        problem_description: 문제 설명 텍스트
        task_context: Task 설정 (선택적)
        default: 기본 알고리즘 ("BFS" 또는 "DFS")

    Returns:
        {
            'algorithm': 'BFS' 또는 'DFS',
            'confidence': 신뢰도 (0-100),
            'reasoning': 선택 근거 리스트,
            'scores': {'bfs': X, 'dfs': Y}
        }
    """

    # 1단계: 특성 분석
    characteristics = analyze_problem_characteristics(problem_description)

    # 2단계: 의사결정 트리 평가
    decision = evaluate_decision_tree(characteristics, task_context)

    # 3단계: 알고리즘 선택
    algorithm, confidence, reasoning = select_algorithm(decision, default)

    return {
        'algorithm': algorithm,
        'confidence': confidence,
        'reasoning': reasoning,
        'scores': {
            'bfs': decision['bfs_score'],
            'dfs': decision['dfs_score']
        }
    }
```

---

## 📊 선택 기준 요약표

| 기준 | BFS 선호 | DFS 선호 |
|------|---------|---------|
| **최적해 필요성** | ✅ 필수 | ❌ 불필요 |
| **조기 실패 감지** | ❌ 어려움 | ✅ 가능 |
| **메모리 사용** | ⚠️ 많음 | ✅ 적음 |
| **탐색 깊이** | ✅ 얕음 (≤3) | ✅ 깊음 (>6) |
| **분기 계수** | ✅ 높음 (>5) | ✅ 낮음 (<3) |
| **해결 공간** | ✅ 큼 (>1000) | ✅ 작음 (<100) |
| **시간 제약** | ⚠️ 여유 필요 | ✅ 빠름 |
| **다양성 필요** | ✅ 많은 대안 | ❌ 단일 해 |

---

## 🎯 알고리즘별 최적 시나리오

### BFS 최적 시나리오

```yaml
1. 디버깅 (Debugging):
   - 버그 원인 분석
   - 메모리 누수 추적
   - 성능 병목 지점 찾기
   점수: BFS +8~+10

2. 시스템 설계 (Design):
   - 아키텍처 패턴 선택
   - 기술 스택 비교
   - 확장성 전략 수립
   점수: BFS +10~+14

3. 리팩토링 전략 (Refactoring):
   - 리팩토링 패턴 비교
   - 우선순위 결정
   - 리스크 평가
   점수: BFS +10~+15

4. 최적화 대안 탐색:
   - 성능 최적화 방법
   - 비용 효율적 솔루션
   - A/B 테스트 전략
   점수: BFS +8~+12

특징:
  ✅ 넓고 얕은 탐색
  ✅ 다양한 대안 비교
  ✅ 최적해 보장
  ⚠️ 메모리 사용 많음
  ⚠️ 시간 소요 상대적으로 길음
```

### DFS 최적 시나리오

```yaml
1. 제약 만족 문제 (Constraint Satisfaction):
   - Sudoku, 크로스워드
   - 스케줄링 문제
   - 리소스 할당
   점수: DFS +15~+17

2. 코드 생성 (Code Generation):
   - 프로토타입 구현
   - 템플릿 기반 생성
   - 빠른 MVP
   점수: DFS +10~+13

3. 알고리즘 최적화 (Algorithm Optimization):
   - 시간 복잡도 개선
   - 자료구조 변경
   - 특정 목표 달성
   점수: DFS +10~+13

4. 깊이 있는 기술 분석:
   - 스택 트레이스 추적
   - 의존성 체인 분석
   - 재귀 구조 탐색
   점수: DFS +8~+12

특징:
  ✅ 빠른 해 도출
  ✅ 메모리 효율적
  ✅ 명확한 제약 활용
  ⚠️ 최적해 보장 안됨
  ⚠️ 백트래킹 필요 가능
```

---

## 🔄 하이브리드 접근 (Adaptive Search)

```yaml
상황에 따른 동적 전환:

초기 단계 (Level 1-2):
  → BFS로 시작 (넓게 탐색)

중간 평가:
  if 명확한 후보 발견:
    → DFS로 전환 (깊이 탐색)
  else:
    → BFS 계속 (더 많은 대안)

구현 예시:
  level_1_result = BFS(depth=2)

  if max(level_1_scores) >= 8.5:
    # 유망한 경로 발견
    selected_paths = top_k(level_1_result, k=2)
    final_result = DFS(selected_paths, max_depth=5)
  else:
    # 더 탐색 필요
    final_result = BFS(depth=4)
```

---

## ✅ Claude Code 사용 체크리스트

### 선택 전 확인사항

```yaml
□ 문제 설명에 키워드 분석 수행
□ 최적해 필요성 확인
□ 메모리/시간 제약 확인
□ 조기 실패 감지 가능성 평가
□ 탐색 깊이 예상
```

### 선택 후 검증

```yaml
□ 선택된 알고리즘 신뢰도 확인 (>70% 권장)
□ 선택 근거 리뷰
□ Task 파라미터 조정 (n_generate, max_depth 등)
□ 필요시 하이브리드 접근 고려
```

---

## 📝 사용 예시 코드

```python
# ToT 명령 실행 시 자동 선택
problem = "React 컴포넌트에서 메모리 누수가 발생합니다."

# 자동 알고리즘 선택
selection = auto_select_algorithm(problem)

print(f"선택된 알고리즘: {selection['algorithm']}")
print(f"신뢰도: {selection['confidence']}%")
print(f"근거:")
for reason in selection['reasoning']:
    print(f"  - {reason}")
print(f"점수: BFS {selection['scores']['bfs']} vs DFS {selection['scores']['dfs']}")

# 출력:
# 선택된 알고리즘: BFS
# 신뢰도: 85%
# 근거:
#   - 디버깅 문제: BFS 유리
#   - 다양한 원인 탐색 필요
#   - 최적해(근본 원인) 필요
# 점수: BFS 10 vs DFS 1

# 선택된 알고리즘으로 ToT 실행
if selection['algorithm'] == 'BFS':
    result = bfs_search(task, problem, args)
else:
    result = dfs_search(task, problem, args)
```

---

## 🎓 학습 포인트

### Claude Code가 이 가이드를 읽을 때 주목해야 할 점

1. **키워드 패턴**: 문제 설명에서 특정 키워드 → 즉시 알고리즘 힌트
2. **점수 체계**: 각 기준마다 가중치가 다름 (최적해 필요성 = +3, 기타 = +1~+2)
3. **임계값**: 2점 이상 차이가 나야 명확한 선택, 그렇지 않으면 기본값(BFS)
4. **신뢰도**: 점수 차이가 클수록 높은 신뢰도 (60% + 차이×5%)
5. **예외 처리**: 애매한 경우 BFS 기본 (더 안전한 선택)

---

## 🔗 관련 문서

- `bfs-implementation.md`: BFS 상세 구현
- `dfs-implementation.md`: DFS 상세 구현
- `tot-framework.md`: ToT 전체 프레임워크
- `task-system.md`: Task 인터페이스 및 구현

---

*이 가이드를 통해 Claude Code는 문제 특성을 분석하여 최적의 탐색 알고리즘을 자동으로 선택할 수 있습니다.*
