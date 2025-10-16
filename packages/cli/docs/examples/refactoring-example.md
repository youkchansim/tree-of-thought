# ToT 실제 사례: 레거시 결제 시스템 리팩토링

## 🔄 리팩토링 대상
```markdown
대상 모듈: PaymentService (레거시 결제 시스템)
현재 LOC: 3,500 라인 (단일 파일)
Cyclomatic Complexity: 42 (매우 높음)
기술 부채: 약 3개월 작업량
리팩토링 동기: 유지보수 불가능, 새 결제 방식 추가 어려움
```

## 📊 현재 문제점
```markdown
- ✅ God Class (3500줄 단일 클래스)
- ✅ 높은 결합도 (15개 모듈 직접 의존)
- ✅ 테스트 불가능 (0% 커버리지)
- ✅ 중복 코드 (30% 이상)
- ✅ 하드코딩된 비즈니스 로직
```

---

## 🌳 Level 1: 리팩토링 전략

### 선택된 전략: 점진적 Strangler Fig 패턴
```markdown
평가 결과:
- 점진적 개선: 7.8점 ✅ (선택)
- 완전 재작성: 5.8점
- 패턴 기반: 7.1점
- 하이브리드: 7.4점

선택 이유:
1. 운영 중단 없이 진행 가능
2. 단계별 검증 가능
3. 롤백 용이
```

---

## 🌿 Level 2: 구체적 실행 계획

### Phase 1: 인터페이스 추출 (Week 1)

#### Before:
```swift
// 😱 3500줄의 거대한 클래스
class PaymentService {
    // 모든 결제 로직이 한 곳에...
    func processPayment(order: Order) {
        // 500줄의 스파게티 코드
        if order.paymentMethod == "card" {
            // 카드 결제 로직 200줄
            validateCard()
            chargeCard()
            // ...
        } else if order.paymentMethod == "paypal" {
            // 페이팔 로직 150줄
            // ...
        } else if order.paymentMethod == "apple" {
            // 애플페이 로직 180줄
            // ...
        }
        // 더 많은 if-else...
    }

    func validateCard() { /* 100줄 */ }
    func chargeCard() { /* 150줄 */ }
    func refund() { /* 200줄 */ }
    // ... 50개 이상의 메서드
}
```

#### After - Step 1: 인터페이스 정의
```swift
// ✨ 깔끔한 프로토콜 정의
protocol PaymentProcessor {
    func validate(payment: PaymentRequest) throws
    func process(payment: PaymentRequest) async throws -> PaymentResult
    func refund(payment: PaymentResult) async throws -> RefundResult
}

protocol PaymentValidator {
    func validate(payment: PaymentRequest) throws
}

protocol PaymentLogger {
    func logTransaction(_ transaction: Transaction)
    func logError(_ error: PaymentError)
}
```

### Phase 2: 전략 패턴 적용 (Week 2)

#### 결제 방식별 분리
```swift
// 카드 결제 처리기
class CardPaymentProcessor: PaymentProcessor {
    private let validator: CardValidator
    private let gateway: PaymentGateway

    func validate(payment: PaymentRequest) throws {
        guard let cardDetails = payment.cardDetails else {
            throw PaymentError.invalidPaymentMethod
        }

        try validator.validateCard(cardDetails)
        try validator.validateCVV(cardDetails.cvv)
        try validator.validateExpiry(cardDetails.expiry)
    }

    func process(payment: PaymentRequest) async throws -> PaymentResult {
        try validate(payment)

        let token = try await tokenizeCard(payment.cardDetails!)
        let charge = try await gateway.charge(
            amount: payment.amount,
            token: token,
            currency: payment.currency
        )

        return PaymentResult(
            transactionId: charge.id,
            status: .success,
            amount: payment.amount
        )
    }
}

// 페이팔 결제 처리기
class PayPalPaymentProcessor: PaymentProcessor {
    private let paypalClient: PayPalSDK

    func process(payment: PaymentRequest) async throws -> PaymentResult {
        let session = try await paypalClient.createSession(
            amount: payment.amount,
            returnURL: payment.returnURL
        )

        let authorization = try await paypalClient.authorize(session)

        return PaymentResult(
            transactionId: authorization.id,
            status: .success,
            amount: payment.amount
        )
    }
}

// 애플페이 결제 처리기
class ApplePayProcessor: PaymentProcessor {
    func process(payment: PaymentRequest) async throws -> PaymentResult {
        let request = PKPaymentRequest()
        request.merchantIdentifier = Config.merchantId
        request.supportedNetworks = [.visa, .masterCard, .amex]

        // 애플페이 특화 로직
        let controller = PKPaymentAuthorizationController(paymentRequest: request)
        let result = try await controller.authorize()

        return PaymentResult(
            transactionId: result.token,
            status: .success,
            amount: payment.amount
        )
    }
}
```

### Phase 3: 팩토리 패턴과 의존성 주입 (Week 3)

```swift
// 팩토리 패턴으로 생성 로직 캡슐화
class PaymentProcessorFactory {
    func createProcessor(for method: PaymentMethod) -> PaymentProcessor {
        switch method {
        case .card:
            return CardPaymentProcessor(
                validator: CardValidator(),
                gateway: StripeGateway()
            )
        case .paypal:
            return PayPalPaymentProcessor(
                paypalClient: PayPalSDK.shared
            )
        case .applePay:
            return ApplePayProcessor()
        case .googlePay:
            return GooglePayProcessor()
        default:
            return DefaultPaymentProcessor()
        }
    }
}

// 새로운 PaymentService (Facade 패턴)
class ModernPaymentService {
    private let factory: PaymentProcessorFactory
    private let logger: PaymentLogger
    private let metrics: PaymentMetrics

    init(
        factory: PaymentProcessorFactory = .init(),
        logger: PaymentLogger = FirebaseLogger(),
        metrics: PaymentMetrics = AmplitudeMetrics()
    ) {
        self.factory = factory
        self.logger = logger
        self.metrics = metrics
    }

    func processPayment(_ request: PaymentRequest) async throws -> PaymentResult {
        let startTime = Date()

        do {
            // 적절한 프로세서 선택
            let processor = factory.createProcessor(for: request.method)

            // 결제 처리
            let result = try await processor.process(payment: request)

            // 로깅 및 메트릭
            logger.logTransaction(result.asTransaction())
            metrics.recordPayment(
                method: request.method,
                amount: request.amount,
                duration: Date().timeIntervalSince(startTime)
            )

            return result
        } catch {
            logger.logError(PaymentError.from(error))
            metrics.recordFailure(method: request.method, error: error)
            throw error
        }
    }
}
```

### Phase 4: 테스트 추가 (Week 3-4)

```swift
// 이제 테스트 가능한 구조!
class PaymentServiceTests: XCTestCase {
    func testCardPaymentSuccess() async throws {
        // Given
        let mockGateway = MockPaymentGateway()
        mockGateway.chargeResult = .success(MockCharge())

        let processor = CardPaymentProcessor(
            validator: MockCardValidator(),
            gateway: mockGateway
        )

        let request = PaymentRequest(
            method: .card,
            amount: 100.00,
            cardDetails: TestData.validCard
        )

        // When
        let result = try await processor.process(payment: request)

        // Then
        XCTAssertEqual(result.status, .success)
        XCTAssertEqual(result.amount, 100.00)
        XCTAssertTrue(mockGateway.chargeCalled)
    }

    func testPaymentTimeout() async {
        // 타임아웃 테스트
        let slowGateway = SlowMockGateway(delay: 35)
        let processor = CardPaymentProcessor(gateway: slowGateway)

        await assertThrowsError {
            try await processor.process(payment: testRequest)
                .timeout(30)
        } errorHandler: { error in
            XCTAssertEqual(error as? PaymentError, .timeout)
        }
    }
}
```

---

## 🍃 Level 3: 마이그레이션 실행

### 단계별 전환 전략

```swift
// 기존 코드와 새 코드 공존 (Strangler Fig)
class PaymentServiceBridge {
    private let legacyService: PaymentService
    private let modernService: ModernPaymentService
    private let featureFlags: FeatureFlags

    func processPayment(order: Order) async throws {
        // 기능 플래그로 점진적 전환
        if featureFlags.isEnabled(.modernPayment, for: order.userId) {
            // 새로운 시스템 사용
            let request = PaymentRequest.from(order)
            let result = try await modernService.processPayment(request)
            order.paymentResult = result
        } else {
            // 레거시 시스템 사용
            legacyService.processPayment(order: order)
        }

        // 듀얼 라이팅으로 검증
        if featureFlags.isEnabled(.paymentValidation) {
            validateConsistency(order)
        }
    }

    private func validateConsistency(_ order: Order) {
        // 백그라운드에서 두 시스템 결과 비교
        Task.detached {
            let legacyResult = self.legacyService.simulatePayment(order)
            let modernResult = try? await self.modernService.simulate(order)

            if legacyResult != modernResult {
                Logger.warning("Payment inconsistency detected", [
                    "orderId": order.id,
                    "legacy": legacyResult,
                    "modern": modernResult
                ])
            }
        }
    }
}
```

### 롤아웃 계획
```markdown
Week 1: 1% 트래픽 (카나리 배포)
Week 2: 10% 트래픽
Week 3: 50% 트래픽
Week 4: 100% 트래픽
```

---

## 📊 실행 결과

### 코드 품질 개선
```markdown
메트릭 변화:
| 지표 | Before | After | 개선 |
|------|--------|-------|------|
| LOC | 3,500 | 1,200 | -66% |
| Complexity | 42 | 8 | -81% |
| Test Coverage | 0% | 92% | +92% |
| Coupling | 15 | 3 | -80% |
| Duplications | 30% | 2% | -93% |
```

### 개발 생산성 향상
```markdown
- 새 결제 방식 추가: 2주 → 2일 (86% 단축)
- 버그 수정 시간: 평균 3일 → 3시간
- 코드 리뷰 시간: 2시간 → 30분
- 온보딩 시간: 2주 → 3일
```

### 운영 지표 개선
```markdown
- 결제 성공률: 94% → 98.5%
- 평균 응답시간: 1.2초 → 0.3초
- 에러율: 2.3% → 0.4%
- 다운타임: 월 2시간 → 0분
```

---

## 🎓 핵심 교훈

### 1. Strangler Fig 패턴의 효과
```markdown
✅ 운영 중단 없이 리팩토링
✅ 점진적 위험 관리
✅ 언제든 롤백 가능
✅ A/B 테스트로 검증
```

### 2. SOLID 원칙 적용
```markdown
S - 단일 책임: 각 프로세서는 하나의 결제 방식만
O - 개방-폐쇄: 새 결제 방식 추가 시 기존 코드 수정 불필요
L - 리스코프: 모든 프로세서는 PaymentProcessor 교체 가능
I - 인터페이스 분리: 작은 단위의 프로토콜들
D - 의존성 역전: 구체 클래스가 아닌 프로토콜 의존
```

### 3. 테스트의 중요성
```swift
// 리팩토링의 안전망
class PaymentIntegrationTests: XCTestCase {
    func testAllPaymentMethods() async throws {
        let methods: [PaymentMethod] = [.card, .paypal, .applePay]

        for method in methods {
            let request = PaymentRequest(method: method, amount: 100)
            let result = try await service.processPayment(request)

            XCTAssertEqual(result.status, .success)
            XCTAssertEqual(result.amount, 100)
        }
    }
}
```

### 4. 점진적 마이그레이션 전략
```markdown
1단계: 인터페이스 추출
2단계: 새 구현 작성
3단계: 듀얼 라이팅
4단계: 트래픽 전환
5단계: 레거시 제거
```

---

## 🚀 다음 단계

### 추가 개선 계획
```markdown
1. 이벤트 소싱 도입
2. 분산 트랜잭션 처리
3. 실시간 사기 탐지
4. 다중 통화 지원
5. 구독 결제 시스템
```

### 팀 역량 향상
```markdown
- 클린 코드 워크샵 진행
- 페어 프로그래밍 세션
- 코드 리뷰 문화 정착
- 리팩토링 카탈로그 작성
```

---
*이 사례는 실제 결제 시스템 리팩토링 경험을 바탕으로 작성되었습니다.*