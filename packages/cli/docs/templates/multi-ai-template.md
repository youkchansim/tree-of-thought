# Multi-AI Template (Claude + Gemini + Codex)

Template for Multi-AI mode - leveraging 3 different AI perspectives for maximum solution diversity

## Overview

**Multi-AI Mode** combines:
- **Claude**: Practical, user-focused solutions
- **Gemini**: Innovative architecture and system design
- **Codex**: Technical optimization and performance

**Default Ratio**: 2:2:2 (balanced)
**Total Thoughts**: 6 per level
**Execution**: Parallel (all 3 AIs run simultaneously)

---

## Thought Generation Template

### Phase 1: Claude Thoughts (Practical Focus)

**Prompt Focus:**
- Proven patterns and best practices
- Quick wins and pragmatic solutions
- User experience and maintainability
- Battle-tested approaches

**Example Claude Thought:**

```markdown
Thought 1 [Claude]: Quick Cache Cleanup Implementation

이벤트 리스너와 타이머 정리를 통한 메모리 누수 해결

핵심 접근:
• 로그아웃 시 명시적 cleanup 함수 호출
• addEventListener 대신 once 옵션 사용
• useEffect cleanup 패턴 적용

구현 단계:
1. 모든 이벤트 리스너를 WeakMap으로 추적
2. logout 이벤트에서 removeEventListener 일괄 호출
3. setTimeout/setInterval을 clearTimeout/clearInterval로 정리

검증 방법:
- Chrome DevTools Memory 프로파일링
- 로그아웃 전후 힙 스냅샷 비교
- 메모리 사용량 10분간 모니터링

예상 효과: 95% 메모리 누수 해결, 1시간 작업
```

---

### Phase 2: Gemini Thoughts (Architecture Focus)

**Prompt Focus:**
- System design patterns
- Scalable architecture
- Component relationships
- Creative structural solutions

**Example Gemini Thought:**

```markdown
Thought 3 [Gemini]: Resource Lifecycle Manager Pattern

중앙화된 리소스 관리 아키텍처로 메모리 누수 원천 차단

설계 개념:
• ResourceManager 싱글톤 패턴 도입
• 세션별 리소스 자동 추적 및 해제
• Dependency Injection으로 라이프사이클 관리

아키텍처 구조:
┌─────────────────────────────────────┐
│ SessionManager                       │
│  ├─ ResourceLifecycleTracker        │
│  ├─ AutoCleanupService              │
│  └─ DisposableRegistry              │
└─────────────────────────────────────┘

컴포넌트 상호작용:
1. 리소스 생성 시 ResourceManager에 자동 등록
2. IDisposable 인터페이스 구현 강제
3. 세션 종료 시 등록된 모든 리소스 dispose() 호출
4. WeakRef 활용으로 순환 참조 방지

확장성:
- 새로운 리소스 타입 추가 용이
- 테스트 가능한 구조
- 마이크로서비스 환경에도 적용 가능

예상 효과: 100% 메모리 누수 방지, 장기적 유지보수성 향상
```

---

### Phase 3: Codex Thoughts (Optimization Focus)

**Prompt Focus:**
- Algorithm complexity
- Performance profiling
- Low-level optimization
- Measurement and metrics

**Example Codex Thought:**

```markdown
Thought 5 [Codex]: Heap Profiling & GC Optimization

메모리 할당 패턴 분석을 통한 정밀 누수 탐지 및 GC 최적화

기술적 접근:
• V8/SpiderMonkey 힙 프로파일러 활용
• Allocation timeline 분석
• Retained size vs Shallow size 비교
• GC 로그 분석으로 Major/Minor GC 패턴 파악

프로파일링 전략:
1. Baseline heap snapshot (로그인 전)
2. Post-activity snapshot (활동 후)
3. Post-logout snapshot (로그아웃 후 + GC 강제 실행)
4. Diff analysis로 누수 객체 식별

알고리즘 최적화:
```javascript
// Before: O(n) memory leak
const cache = new Map()
function addUser(user) {
  cache.set(user.id, user)  // Never cleaned
}

// After: O(1) with LRU eviction
const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 30 })
function addUser(user) {
  cache.set(user.id, user)  // Auto-evicted
}
```

GC 튜닝:
- `--max-old-space-size` 조정
- `--expose-gc` 플래그로 명시적 GC 제어
- Generational hypothesis 활용 (단기 객체는 빠르게 수집)

측정 지표:
- Heap size growth rate: 50MB/h → 0MB/h
- GC pause time: <10ms 유지
- Retained objects: 목표 <1000개

예상 효과: 99.9% 메모리 누수 제거, GC 효율 50% 향상
```

---

## Evaluation Template

### Cross-AI Evaluation

```markdown
📊 Evaluation Results:

Thought 1 [Claude] - 8.7/10 ⭐
  Feasibility: 9/10 (매우 쉬움)
  Impact: 8/10 (대부분 해결)
  Risk: 9/10 (낮음)
  Complexity: 9/10 (단순)

Thought 3 [Gemini] - 9.2/10 ⭐⭐
  Feasibility: 8/10 (구조 변경 필요)
  Impact: 10/10 (완전 해결)
  Risk: 8/10 (중간)
  Complexity: 7/10 (아키텍처 리팩토링)

Thought 5 [Codex] - 9.5/10 ⭐⭐⭐
  Feasibility: 7/10 (프로파일링 기술 필요)
  Impact: 10/10 (정밀 해결)
  Risk: 9/10 (낮음)
  Complexity: 6/10 (복잡한 분석)
```

---

## Selection Template

### Top 3 Selection (Diversity Priority)

```markdown
🎯 Selected Thoughts (Multi-AI Diversity):

1. [9.5/10] Thought 5 [Codex]: Heap Profiling & GC Optimization
   → 정밀한 root cause 분석과 최적화

2. [9.2/10] Thought 3 [Gemini]: Resource Lifecycle Manager Pattern
   → 장기적 아키텍처 개선과 재발 방지

3. [8.7/10] Thought 1 [Claude]: Quick Cache Cleanup Implementation
   → 즉시 적용 가능한 실용적 해결책

**Combined Strategy:**
- Short-term: Claude의 빠른 수정 (1시간)
- Mid-term: Codex의 정밀 분석 (1일)
- Long-term: Gemini의 구조 개선 (1주)
```

---

## Final Solution Template

### Integrated Multi-AI Solution

```markdown
✅ Final Solution (Multi-AI Integrated)

## Phase 1: Immediate Fix (Claude - Day 1)
1. 이벤트 리스너 정리 코드 추가
2. useEffect cleanup 패턴 적용
3. 메모리 사용량 모니터링 시작

## Phase 2: Deep Analysis (Codex - Day 2-3)
1. 힙 프로파일링으로 root cause 확정
2. LRU 캐시 도입 및 GC 튜닝
3. 성능 지표 수집 및 검증

## Phase 3: Architecture Refactor (Gemini - Week 1)
1. ResourceManager 패턴 설계
2. 점진적 마이그레이션
3. 자동화된 리소스 추적 시스템 구축

## Expected Outcomes:
- ✅ 메모리 누수 99.9% 제거
- ✅ 재발 방지 아키텍처 확립
- ✅ 장기 유지보수성 향상
- ✅ 성능 모니터링 체계 구축

Overall Score: 9.5/10 ⭐⭐⭐⭐⭐
```

---

## Prompt Templates by Task Type

### Debug Task - Multi-AI Prompts

**Claude Prompt (Practical):**
```
Generate practical debugging approaches:
- Quick diagnostic checks
- Common bug patterns
- Fast verification methods
Focus: Proven debugging techniques
```

**Gemini Prompt (Architecture):**
```
Generate architectural root cause analysis:
- System design flaws
- Component interaction issues
- Lifecycle management problems
Focus: Structural solutions
```

**Codex Prompt (Optimization):**
```
Generate technical profiling approaches:
- Memory/CPU profiling
- Algorithm analysis
- Performance metrics
Focus: Deep technical analysis
```

---

### Design Task - Multi-AI Prompts

**Claude Prompt (Practical):**
```
Generate practical design patterns:
- Battle-tested architectures
- Industry standard practices
- Proven scalability patterns
Focus: Reliable, maintainable designs
```

**Gemini Prompt (Architecture):**
```
Generate innovative system designs:
- Creative architectural patterns
- Modern design paradigms
- Scalable microservices
Focus: Innovation and flexibility
```

**Codex Prompt (Optimization):**
```
Generate performance-optimized designs:
- High-throughput architectures
- Low-latency patterns
- Resource-efficient designs
Focus: Performance and efficiency
```

---

### Refactor Task - Multi-AI Prompts

**Claude Prompt (Practical):**
```
Generate practical refactoring steps:
- Incremental improvements
- Low-risk changes
- Quick wins
Focus: Safe, manageable refactoring
```

**Gemini Prompt (Architecture):**
```
Generate architectural restructuring:
- Design pattern applications
- Component separation
- Modular architecture
Focus: Long-term maintainability
```

**Codex Prompt (Optimization):**
```
Generate performance refactoring:
- Algorithm optimization
- Data structure improvements
- Code efficiency
Focus: Speed and resource usage
```

---

## Usage Tips

### When to Use Multi-AI Mode

✅ **Use Multi-AI when:**
- Problem requires multiple perspectives
- Both architecture AND performance matter
- Exploring maximum solution space
- Want short/mid/long-term strategies

❌ **Don't use Multi-AI when:**
- Need quick answer only
- Single aspect focus (e.g., only performance)
- Time-constrained analysis
- MCP services unavailable

### Optimizing Ratio

```yaml
Practical Focus (3:2:1):
  - Claude: 50% (quick solutions)
  - Gemini: 33% (some architecture)
  - Codex: 17% (minimal optimization)

Balanced (2:2:2):
  - All equal weight
  - Maximum diversity
  - Best for complex problems

Performance Focus (1:2:3):
  - Claude: 17% (basic approach)
  - Gemini: 33% (scalable design)
  - Codex: 50% (deep optimization)
```

---

## Example Outputs

### Memory Leak Problem

```bash
/tot "메모리 누수 - 로그아웃 후 50MB/h 증가"

Output:
  Thought 1 [Claude]: 이벤트 리스너 정리
  Thought 2 [Claude]: 타이머 cleanup
  Thought 3 [Gemini]: ResourceManager 패턴
  Thought 4 [Gemini]: 라이프사이클 아키텍처
  Thought 5 [Codex]: 힙 프로파일링
  Thought 6 [Codex]: GC 최적화

Selected:
  1. [Codex] 힙 프로파일링 - 9.5/10
  2. [Gemini] ResourceManager - 9.2/10
  3. [Claude] 이벤트 정리 - 8.7/10

Strategy: 즉시 수정 + 분석 + 구조 개선
```

---

## Performance Metrics

```yaml
Execution Time:
  Claude generation: ~5s
  Gemini MCP call: ~10s (parallel)
  Codex MCP call: ~15s (parallel)
  Total: ~15-20s

Quality Metrics:
  Diversity score: 9.5/10 (3 different angles)
  Coverage: 100% (practical + design + perf)
  Success rate: 95% (at least 1 works)

User Satisfaction:
  Balanced solutions: ⭐⭐⭐⭐⭐
  Multiple options: ⭐⭐⭐⭐⭐
  Depth of analysis: ⭐⭐⭐⭐⭐
```

---

*Multi-AI Template - Maximum diversity through Claude + Gemini + Codex*
