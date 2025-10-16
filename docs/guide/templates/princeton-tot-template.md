# Princeton-Style Tree of Thought Template

## 🎯 Problem Definition
```markdown
Problem: [Describe the problem clearly]
Goal: [Define success criteria]
Constraints: [Time, resources, technical limitations]
```

---

## 🌳 Tree of Thought Execution (Princeton Method)

### Configuration
```yaml
algorithm: BFS                    # BFS (default) / DFS
n_generate_sample: 5              # Number of thoughts to generate
n_evaluate_sample: 3              # Number of evaluations per thought
n_select_sample: 3                # Number of thoughts to keep (b parameter)
method_generate: propose          # propose / sample
method_evaluate: value           # value / vote
method_select: greedy            # greedy / sample
```

---

## Level 1: Initial Thought Generation

### 🤖 Thought Generation Phase
**Generating `n_generate_sample=5` thoughts using `method_generate=propose`**

#### Thought 1.1 [Claude]
```markdown
제안: 실용적이고 빠른 구현 접근법
- 기존 시스템과의 호환성 우선
- 단계적 적용 가능
- 리스크 최소화
```

#### Thought 1.2 [Claude]
```markdown
제안: 사용자 중심 해결책
- UX 개선 중점
- 즉각적인 효과
- 비즈니스 가치 극대화
```

#### Thought 1.3 [Claude]
```markdown
제안: 균형잡힌 접근법
- 기술과 비즈니스 균형
- 중기적 관점
- 확장 가능성 고려
```

#### Thought 1.4 [Codex]
```markdown
제안: 알고리즘 최적화 중심
- O(n²) → O(n log n) 개선
- 메모리 효율성 극대화
- 캐싱 전략 구현
```

#### Thought 1.5 [Codex]
```markdown
제안: 아키텍처 재설계
- 마이크로서비스 패턴 적용
- 이벤트 기반 구조
- 확장성 극대화
```

### 📊 Evaluation Phase (`method_evaluate=value`)
**Each thought evaluated `n_evaluate_sample=3` times**

| Thought | Model | Eval 1 | Eval 2 | Eval 3 | Avg Value | Label |
|---------|-------|--------|--------|--------|-----------|-------|
| 1.1 | Claude | 8.0 | 7.5 | 8.2 | 7.9 | likely |
| 1.2 | Claude | 7.0 | 7.3 | 6.9 | 7.1 | likely |
| 1.3 | Claude | 6.5 | 6.8 | 6.6 | 6.6 | possible |
| 1.4 | Codex | 9.0 | 8.8 | 9.2 | 9.0 | sure |
| 1.5 | Codex | 8.5 | 8.3 | 8.6 | 8.5 | likely |

### 🎯 Selection Phase (`method_select=greedy`)
**Selecting top `n_select_sample=3` thoughts**

✅ **Selected for Level 2:**
1. Thought 1.4 [Codex] - Value: 9.0 (sure)
2. Thought 1.5 [Codex] - Value: 8.5 (likely)
3. Thought 1.1 [Claude] - Value: 7.9 (likely)

❌ **Pruned:**
- Thought 1.2 [Claude] - Below threshold
- Thought 1.3 [Claude] - Lowest value

---

## Level 2: Thought Refinement

### Tree Structure
```
        [Problem]
       /    |    \
   [X]1.4 [X]1.5 [C]1.1    (X=Codex, C=Claude)
    /|\    /|\    /|\
   ... ... ... ... ... ...
```

### 🔄 Thought 1.4 Expansion [Codex]
#### Sub-thought 1.4.1
```markdown
구현: 힙 자료구조 도입
- PriorityQueue로 교체
- 시간 복잡도 개선
- 메모리 사용량 25% 감소
```

#### Sub-thought 1.4.2
```markdown
구현: 인덱싱 최적화
- B-Tree 인덱스 적용
- 쿼리 성능 10배 향상
- 저장 공간 trade-off
```

#### Sub-thought 1.4.3
```markdown
구현: 캐싱 레이어
- Redis 기반 캐싱
- 90% 히트율 목표
- 응답 시간 50ms 이하
```

### 🔄 Thought 1.5 Expansion [Codex]
#### Sub-thought 1.5.1
```markdown
구현: API Gateway 패턴
- 중앙 집중식 라우팅
- 인증/인가 통합
- Rate limiting 구현
```

#### Sub-thought 1.5.2
```markdown
구현: Event Sourcing
- 모든 변경사항 기록
- CQRS 패턴 적용
- 완벽한 감사 추적
```

### 🔄 Thought 1.1 Expansion [Claude]
#### Sub-thought 1.1.1
```markdown
구현: 점진적 마이그레이션
- Feature flag 사용
- A/B 테스팅
- 롤백 계획 준비
```

#### Sub-thought 1.1.2
```markdown
구현: 호환성 레이어
- Adapter 패턴 적용
- 레거시 API 유지
- 단계별 전환
```

### 📊 Level 2 Evaluation

| Sub-thought | Parent | Model | Value | Cumulative Score |
|-------------|--------|-------|-------|------------------|
| 1.4.1 | 1.4 | Codex | 9.5 | 18.5 |
| 1.4.2 | 1.4 | Codex | 8.8 | 17.8 |
| 1.4.3 | 1.4 | Codex | 9.2 | 18.2 |
| 1.5.1 | 1.5 | Codex | 8.3 | 16.8 |
| 1.5.2 | 1.5 | Codex | 7.9 | 16.4 |
| 1.1.1 | 1.1 | Claude | 8.6 | 16.5 |
| 1.1.2 | 1.1 | Claude | 8.1 | 16.0 |

---

## 🏆 Final Path Selection

### Optimal Path Found
```
[Problem] → [Codex]1.4 Algorithm Optimization → 1.4.1 Heap Implementation
```

### Path Score Calculation
```markdown
Path Score = Level1_Value × Level2_Value × Confidence
          = 9.0 × 9.5 × 0.95
          = 81.225
```

### Selection Rationale
```markdown
✅ Selected Path Advantages:
- 최고 기술적 가치 (9.5/10)
- 즉시 구현 가능
- 측정 가능한 성능 개선
- 낮은 리스크

❌ Alternative Paths Considered:
- 1.4.3 (Caching): 의존성 추가 필요
- 1.5.1 (API Gateway): 구조 변경 과다
- 1.1.1 (Progressive): 시간 소요 과다
```

---

## 💻 Implementation Plan

### Immediate Actions
```python
# Step 1: Replace current sorting with heap
import heapq

def optimized_process(data):
    # Before: O(n²) sorting
    # After: O(n log n) with heap
    heap = []
    for item in data:
        heapq.heappush(heap, item)

    result = []
    while heap:
        result.append(heapq.heappop(heap))

    return result
```

### Verification
```markdown
□ Unit tests pass
□ Performance benchmark shows improvement
□ Memory usage reduced by 25%
□ No regression in functionality
```

---

## 📈 Progress Tracking

```
🌳 Princeton ToT Progress
├─ Generation: ████████████ 100% (5/5 thoughts)
│   ├─ [Claude]: 3 thoughts (한국어)
│   └─ [Codex]: 2 thoughts (한국어)
├─ Evaluation: ████████████ 100% (3 evals × 5 thoughts)
├─ Selection: ████████████ 100% (3 selected)
├─ Expansion: ████████████ 100% (7 sub-thoughts)
└─ Final Path: ████████████ 100% (Optimal found)

Algorithm: BFS
Nodes explored: 12
Nodes pruned: 5
Model contribution: Codex 70%, Claude 30%
Confidence: 95%
```

---

## 🔄 Backtracking Protocol

If selected solution fails:
```markdown
1. Return to Level 2
2. Select next best: 1.4.3 (Caching)
3. If still fails, return to Level 1
4. Explore 1.1 (Claude) branch fully
5. Re-evaluate with new information
```

---

*Template based on Princeton NLP Tree-of-Thought-LLM implementation*
*Thoughts output in Korean as requested*