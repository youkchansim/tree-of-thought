# ToT Refactoring Template

## 🔄 리팩토링 대상 분석
```markdown
대상 코드/모듈: [파일명, 클래스, 함수 등]
현재 LOC: [라인 수]
복잡도: [Cyclomatic Complexity]
기술 부채: [추정 시간]
리팩토링 동기: [성능/가독성/확장성/테스트 용이성]
```

## 📊 현재 상태 평가
```markdown
문제점:
- [ ] 높은 결합도
- [ ] 낮은 응집도
- [ ] 중복 코드
- [ ] 복잡한 조건문
- [ ] 긴 메서드
- [ ] 많은 매개변수
- [ ] 부적절한 네이밍
- [ ] 테스트 불가능
```

---

## 🌳 Level 1: 리팩토링 전략 (4개 접근법)

### 1.1 📐 점진적 개선 (Incremental Improvement)
```markdown
접근 방식:
- 작은 단위로 나누어 개선
- 기존 코드와 공존
- 단계별 마이그레이션

장점:
✅ 리스크 최소화
✅ 즉시 배포 가능
✅ 롤백 용이
✅ 업무 중단 없음

단점:
❌ 완료까지 시간 소요
❌ 일시적 코드 중복
❌ 일관성 부족 가능

평가:
- 실현가능성: 9/10
- 효과: 7/10
- 리스크: 2/10
- 복잡도: 4/10
종합 점수: 7.8
```

### 1.2 🔨 완전 재작성 (Complete Rewrite)
```markdown
접근 방식:
- 처음부터 다시 설계
- 최신 패턴 적용
- 클린 아키텍처

장점:
✅ 깔끔한 구조
✅ 최신 기술 적용
✅ 기술 부채 제거
✅ 성능 최적화

단점:
❌ 높은 리스크
❌ 긴 개발 시간
❌ 새로운 버그 가능성
❌ 기능 누락 위험

평가:
- 실현가능성: 5/10
- 효과: 9/10
- 리스크: 8/10
- 복잡도: 9/10
종합 점수: 5.8
```

### 1.3 🎯 패턴 기반 리팩토링 (Pattern-Based)
```markdown
접근 방식:
- 디자인 패턴 적용
- 검증된 리팩토링 카탈로그 사용
- 체계적 변환

적용 가능 패턴:
- Extract Method
- Replace Conditional with Polymorphism
- Introduce Parameter Object
- Extract Interface
- Move Method

장점:
✅ 검증된 방법론
✅ 예측 가능한 결과
✅ 체계적 접근
✅ 팀 이해도 높음

단점:
❌ 제한적 적용 범위
❌ 과도한 추상화 위험
❌ 학습 곡선

평가:
- 실현가능성: 7/10
- 효과: 8/10
- 리스크: 4/10
- 복잡도: 6/10
종합 점수: 7.1
```

### 1.4 🚀 하이브리드 접근 (Hybrid Approach)
```markdown
접근 방식:
- 핵심 부분은 재작성
- 주변부는 점진적 개선
- 단계별 통합

장점:
✅ 균형잡힌 접근
✅ 유연한 실행
✅ 위험 분산
✅ 빠른 성과

단점:
❌ 복잡한 계획 필요
❌ 경계 관리 어려움
❌ 팀 조율 필요

평가:
- 실현가능성: 8/10
- 효과: 8/10
- 리스크: 5/10
- 복잡도: 7/10
종합 점수: 7.4
```

### 📊 Level 1 평가 결과
```markdown
| 전략 | 실현가능성 | 효과 | 리스크 | 복잡도 | 종합 |
|------|-----------|------|--------|--------|------|
| 점진적 | 9 | 7 | 2 | 4 | 7.8 ⭐ |
| 재작성 | 5 | 9 | 8 | 9 | 5.8 |
| 패턴 | 7 | 8 | 4 | 6 | 7.1 |
| 하이브리드 | 8 | 8 | 5 | 7 | 7.4 ⭐ |

✅ 선택된 전략: [점진적 개선, 하이브리드]
```

---

## 🌿 Level 2: 구현 방법 상세화 (상위 2개)

### 2.1 점진적 개선 - 구체적 계획

#### Phase 1: 준비 단계 (Week 1)
```markdown
작업 목록:
1. 테스트 커버리지 확보
   - 현재: 30% → 목표: 80%
   - 핵심 기능 우선

2. 의존성 분석
   - 의존성 그래프 생성
   - 순환 참조 제거

3. 리팩토링 우선순위
   - God Class 분해
   - Long Method 분할
   - 중복 코드 제거
```

#### Phase 2: 실행 단계 (Week 2-3)
```markdown
주요 리팩토링:
1. Extract Method
   - processOrder() → 5개 메서드로 분할
   - validateInput()
   - calculatePrice()
   - applyDiscount()
   - processPayment()
   - sendConfirmation()

2. Extract Class
   - OrderService → 3개 클래스로 분리
   - OrderValidator
   - PriceCalculator
   - PaymentProcessor

3. Introduce Parameter Object
   - 7개 매개변수 → OrderRequest 객체
```

#### Phase 3: 마무리 단계 (Week 4)
```markdown
1. 코드 리뷰 및 최적화
2. 성능 테스트
3. 문서 업데이트
4. 팀 교육
```

### 2.2 하이브리드 접근 - 구체적 계획

#### 재작성 대상 (Core)
```markdown
핵심 비즈니스 로직:
- OrderProcessor (완전 재작성)
- PricingEngine (완전 재작성)
- InventoryManager (완전 재작성)

새로운 설계:
- Clean Architecture 적용
- Domain-Driven Design
- Event Sourcing 패턴
```

#### 점진적 개선 대상 (Peripheral)
```markdown
주변 컴포넌트:
- UI Components (단계적 개선)
- Reporting Module (리팩토링)
- Admin Panel (유지)
```

---

## 🍃 Level 3: 실행 단계 상세

### 3.1 Week 1: 기초 작업
```markdown
월요일-화요일:
□ 현재 코드 분석 완료
□ 테스트 작성 (coverage 50%)
□ CI/CD 파이프라인 설정

수요일-목요일:
□ 첫 번째 Extract Method 적용
□ 코드 리뷰
□ 통합 테스트

금요일:
□ 배포 및 모니터링
□ 회고 및 조정
```

### 3.2 Week 2-3: 본격 리팩토링
```markdown
주요 마일스톤:
- [ ] God Class 제거 완료
- [ ] 순환 의존성 제거
- [ ] 인터페이스 추출
- [ ] 테스트 커버리지 80%
```

### 3.3 Week 4: 최적화 및 마무리
```markdown
체크리스트:
- [ ] 성능 벤치마크
- [ ] 보안 감사
- [ ] 문서화
- [ ] 지식 전파
```

---

## 📊 영향도 분석

### 영향받는 시스템
```markdown
직접 영향:
- OrderService (100%)
- PaymentService (80%)
- InventoryService (60%)

간접 영향:
- ReportingService (30%)
- NotificationService (20%)
- AdminDashboard (10%)
```

### 리스크 매트릭스
```markdown
| 리스크 | 확률 | 영향 | 대응 방안 |
|--------|------|------|-----------|
| 기능 누락 | 낮음 | 높음 | 체크리스트 검증 |
| 성능 저하 | 중간 | 중간 | 벤치마크 테스트 |
| 버그 발생 | 중간 | 높음 | 단계별 배포 |
| 일정 지연 | 낮음 | 중간 | 버퍼 시간 확보 |
```

### 롤백 계획
```markdown
Level 1: Feature Flag
- 즉시 이전 코드로 전환 가능

Level 2: Blue-Green Deployment
- 이전 버전 즉시 활성화

Level 3: Git Revert
- 커밋 단위 롤백
```

---

## ✅ 최종 실행 계획

### 선택된 경로
```markdown
🎯 점진적 개선 전략 선택

이유:
1. 가장 안전한 접근
2. 업무 연속성 보장
3. 팀 부담 최소화
4. 즉각적 피드백 가능
```

### 성공 지표 (KPI)
```markdown
기술적 지표:
- 코드 복잡도: 15 → 8
- 테스트 커버리지: 30% → 80%
- 빌드 시간: 10분 → 5분
- 중복 코드: 25% → 5%

비즈니스 지표:
- 버그 발생률: -50%
- 개발 속도: +30%
- 유지보수 시간: -40%
```

### 타임라인
```markdown
Week 1: 준비 및 기초 작업
Week 2-3: 본격 리팩토링
Week 4: 최적화 및 마무리
Week 5: 모니터링 및 조정
```

---

## 📝 체크리스트

### 사전 준비
```markdown
- [ ] 현재 코드 백업
- [ ] 테스트 환경 준비
- [ ] 팀 동의 확보
- [ ] 리소스 할당
```

### 실행 중
```markdown
- [ ] 일일 진행 상황 체크
- [ ] 코드 리뷰 실시
- [ ] 테스트 통과 확인
- [ ] 성능 모니터링
```

### 완료 후
```markdown
- [ ] 문서 업데이트
- [ ] 팀 교육 실시
- [ ] 회고 미팅
- [ ] 베스트 프랙티스 정리
```

---

## 🎓 예상 학습 사항

```markdown
팀이 얻을 지식:
1. 클린 코드 원칙
2. 리팩토링 패턴
3. 테스트 작성법
4. 점진적 개선 방법론
```

---

## 📚 참고 자료

```markdown
- Martin Fowler's Refactoring Catalog
- Clean Code by Robert C. Martin
- Working Effectively with Legacy Code
- 팀 내부 코딩 가이드라인
```

---
*이 템플릿을 프로젝트 상황에 맞게 조정하여 사용하세요. 리팩토링은 지속적인 과정입니다.*