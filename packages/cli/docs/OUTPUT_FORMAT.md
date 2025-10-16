# Tree of Thought Output Format

This document defines the standard output format for ToT command execution, showing the complete thought process from generation to final solution.

## Overview

The ToT output displays all intermediate thoughts, evaluations, and selections to provide full transparency in the problem-solving process.

## Format Structure

```
┌──────────────────────────────────────────────────────────────┐
│ 🌳 Tree of Thought: [Problem Description]                     │
└──────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Level 0: [Phase Name] (n_generate=[N])
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Thoughts with full content]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Level 1: Evaluation (n_evaluate=[N])
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Evaluation details]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Level 2: Selection (n_select=[N])
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Selected thoughts]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Final Conclusion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Solution path and conclusion]
```

## Level 0: Thought Generation

Each generated thought should display:

```
Thought [N] [Model]: [Short Title]
┌────────────────────────────────────────────────────────────┐
│ [Detailed thought content explaining the approach]         │
│                                                            │
│ [Specific actions or checks to perform]                   │
│ • Point 1                                                  │
│ • Point 2                                                  │
│ • Point 3                                                  │
│                                                            │
│ Verification method: [Command or approach]                 │
└────────────────────────────────────────────────────────────┘
```

### Example

```
Thought 1 [Claude]: Directory structure completeness
┌────────────────────────────────────────────────────────────┐
│ Verify all required directories exist:                     │
│ • core/      → Documentation repository                    │
│ • packages/  → Source code + build artifacts              │
│ • examples/  → Usage examples                             │
│ • templates/ → Problem-type templates                     │
│                                                            │
│ Verification method: ls -la ~/.claude/tot/                │
└────────────────────────────────────────────────────────────┘
```

## Level 1: Evaluation

Show each thought's evaluation process:

```
Evaluating Thought [N] [Model]...
  Eval 1: [Score]/10 → [Reason]
  Eval 2: [Score]/10 → [Reason]
  Eval 3: [Score]/10 → [Reason]
  ────────────────
  Average: [Score]/10 ⭐ (Confidence: [%])
```

### Example

```
Evaluating Thought 1 [Claude]...
  Eval 1: 10.0/10 → All required directories present
  Eval 2: 10.0/10 → Structure is logical and clear
  Eval 3: 10.0/10 → Follows npm package standards
  ────────────────
  Average: 10.0/10 ⭐ (Confidence: 100%)
```

### Confidence Calculation

```typescript
function calculateConfidence(scores: number[]): number {
  if (scores.length < 2) return 0.8;

  const mean = average(scores);
  const variance = average(scores.map(s => (s - mean) ** 2));

  // Lower variance → Higher confidence
  const confidence = Math.max(0.5, 1.0 - variance / 8);
  return Math.round(confidence * 100) / 100;
}
```

## Level 2: Selection

Display selected thoughts with reasoning:

```
Selected Top [N] Thoughts:
  ✓ Thought [N] [Model] - [Score]/10: [Title]
  ✓ Thought [N] [Model] - [Score]/10: [Title]
  ✓ Thought [N] [Model] - [Score]/10: [Title]

(Note: [Additional context about selection])
```

### Example

```
Selected Top 3 Thoughts:
  ✓ Thought 1 [Claude] - 10.0/10: Directory structure
  ✓ Thought 3 [Claude] - 10.0/10: Source code
  ✓ Thought 4 [Codex] - 10.0/10: Build files

(Note: Thought 5 also scored 10.0/10 but limited by n_select=3)
```

## Level 3: Expansion (Optional)

When expanding selected thoughts, show execution results:

```
Expanding Thought [N] → [Title]:
┌────────────────────────────────────────────────────────────┐
│ $ [Command executed]                                       │
│                                                            │
│ [Command output or results]                               │
│                                                            │
│ ✅ [Validation result]                                     │
└────────────────────────────────────────────────────────────┘
```

### Example

```
Expanding Thought 1 → Directory structure:
┌────────────────────────────────────────────────────────────┐
│ $ ls -la ~/.claude/tot/                                    │
│                                                            │
│ drwxr-xr-x  core/                                         │
│ drwxr-xr-x  packages/                                     │
│ drwxr-xr-x  examples/                                     │
│ drwxr-xr-x  templates/                                    │
│                                                            │
│ ✅ All required directories present!                       │
└────────────────────────────────────────────────────────────┘
```

## Final Conclusion

Summary of the complete solution path:

```
Solution Path ([N] steps):
  1. [[Score]] [Title] ✅
  2. [[Score]] [Title] ✅
  3. [[Score]] [Title] ✅

Overall Score: [Score]/10 ⭐⭐⭐⭐⭐

[Final verdict and recommendation]

Key Findings:
- [Finding 1]
- [Finding 2]
- [Finding 3]

🚀 [Call to action or next steps]
```

### Example

```
Solution Path (3 steps):
  1. [10.0] Directory structure completeness ✅
  2. [10.0] Source code completeness ✅
  3. [10.0] Build files verification ✅

Overall Score: 10.0/10 ⭐⭐⭐⭐⭐

~/.claude/tot structure is perfect!

Key Findings:
- Documentation: 36 files, 7,971 lines
- Source code: 15 files, 2,272 lines
- Build artifacts: 3 files, 35KB

🚀 Ready for npm publish!
```

## Visual Elements

### Section Separators

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Box Borders

```
┌────────────────────────────────────────────────────────────┐
│ Content                                                    │
└────────────────────────────────────────────────────────────┘
```

### Status Indicators

- ✅ Success / Completed
- ⭐ High score / Quality
- 📍 Location / Marker
- 📊 Data / Metrics
- 🎯 Selection / Goal
- 🔍 Inspection / Detail
- 🌳 Tree structure
- 🚀 Action / Next steps

### Model Attribution

- `[Claude]` - Claude model thoughts
- `[Codex]` - Codex model thoughts
- `[Hybrid]` - Cross-evaluated thoughts

## Color Guidelines (Terminal)

While the format is primarily ASCII, when color is available:

- **Green** (✅): Success indicators
- **Blue** (📊, 📍): Information headers
- **Yellow** (⭐): Highlights and scores
- **White**: Primary content
- **Gray**: Secondary content, notes

## Implementation Notes

### For `/tot` Command (Claude Code CLI)

The command should:
1. Display each level sequentially
2. Show real-time progress for long operations
3. Include all thought content for transparency
4. Provide clear success/failure indicators
5. End with actionable conclusion

### For `@tot/core` Library

The library should return structured data that can be formatted:

```typescript
interface ToTResult {
  problem: string;
  levels: Level[];
  bestThought: Thought;
  solutionPath: Thought[];
  metadata: {
    algorithm: 'BFS' | 'DFS';
    totalThoughts: number;
    executionTime: number;
    stoppedEarly: boolean;
  };
}

interface Level {
  depth: number;
  phase: 'generation' | 'evaluation' | 'selection' | 'expansion';
  thoughts: Thought[];
  evaluations: Evaluation[];
  selected: number[];  // indices of selected thoughts
}
```

## Localization

All thought content should be in **Korean** (한국어) as specified in the configuration, while framework messages (Level names, status indicators) remain in English for consistency.

### Example

```
Thought 1 [Claude]: 디렉토리 구조 완전성 검증
┌────────────────────────────────────────────────────────────┐
│ 필수 디렉토리 존재 여부 확인:                                │
│ • core/      → 문서 저장소                                  │
│ • packages/  → 라이브러리 소스 + 빌드                        │
│ • examples/  → 사용 예제                                    │
│ • templates/ → 문제 유형별 템플릿                            │
│                                                            │
│ 검증 방법: ls -la ~/.claude/tot/                           │
└────────────────────────────────────────────────────────────┘
```

## Multi-Language Support (v0.1.4+)

**IMPORTANT**: Starting from v0.1.4, ToT automatically detects input language and adapts all outputs.

### Auto-Detection Rules

- **Korean input** (contains Hangul) → All outputs in Korean
- **English input** (no Hangul) → All outputs in English
- **Mixed input** → Follow majority language (Korean if Hangul present)

### Language-Specific Output Examples

#### Korean Input Example

```bash
/tot "메모리 누수 - 프로덕션 환경에서 1시간당 50MB 증가"
```

Output:
```
┌──────────────────────────────────────────────────────────────┐
│ 🌳 Tree of Thought: 메모리 누수 - 프로덕션 환경에서 1시간당 50MB 증가 │
└──────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Level 0: Initial Thoughts (n_generate=5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thought 1 [Claude]: 이벤트 리스너 미제거 분석
┌────────────────────────────────────────────────────────────┐
│ 이벤트 리스너가 등록 후 제거되지 않아 메모리 누수 발생:      │
│ • addEventListener 호출 후 removeEventListener 미호출     │
│ • 컴포넌트 언마운트 시 cleanup 함수 누락                   │
│ • 전역 이벤트 핸들러 누적                                   │
│                                                            │
│ 검증 방법: Chrome DevTools Memory Profiler 사용            │
└────────────────────────────────────────────────────────────┘

Evaluating Thought 1 [Claude]...
  Eval 1: 8.5/10 → 일반적인 메모리 누수 원인으로 타당함
  Eval 2: 9.0/10 → 검증 방법이 구체적이고 실용적
  Eval 3: 8.7/10 → 해결책 구현이 비교적 간단함
  ────────────────
  Average: 8.7/10 ⭐ (Confidence: 95%)
```

#### English Input Example

```bash
/tot "Memory leak - production grows 50MB per hour"
```

Output:
```
┌──────────────────────────────────────────────────────────────┐
│ 🌳 Tree of Thought: Memory leak - production grows 50MB per hour │
└──────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Level 0: Initial Thoughts (n_generate=5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thought 1 [Claude]: Event listener cleanup analysis
┌────────────────────────────────────────────────────────────┐
│ Event listeners not removed causing memory leak:           │
│ • addEventListener called without removeEventListener      │
│ • Missing cleanup functions on component unmount          │
│ • Global event handlers accumulating                      │
│                                                            │
│ Verification: Use Chrome DevTools Memory Profiler         │
└────────────────────────────────────────────────────────────┘

Evaluating Thought 1 [Claude]...
  Eval 1: 8.5/10 → Common cause of memory leaks, valid
  Eval 2: 9.0/10 → Verification method is concrete and practical
  Eval 3: 8.7/10 → Solution implementation is relatively simple
  ────────────────
  Average: 8.7/10 ⭐ (Confidence: 95%)
```

### Framework Labels (Always English)

Regardless of input language, framework structure labels remain in English for consistency:
- `📍 Level 0:`, `📊 Level 1:`, `🎯 Level 2:`, `✅ Final Conclusion`
- `Thought 1 [Claude]:`, `Thought 4 [Codex]:`
- `Evaluating Thought...`, `Selected Top 3 Thoughts:`

### Language Detection Implementation

The ToT system automatically detects language in STEP 0.5:
1. Analyzes user's problem description
2. Checks for Korean Hangul characters (U+AC00 to U+D7A3)
3. Sets output language for all subsequent generations
4. Passes language context to Codex MCP calls

## Testing Output Format

Validate output format with:

```bash
# Run ToT and check formatting
/tot "test problem" | tee output.txt

# Verify structure
grep -c "━━━" output.txt  # Should find level separators
grep -c "┌─" output.txt   # Should find thought boxes
grep -c "Thought" output.txt  # Should find all thoughts
```

## References

- Princeton ToT Paper: https://arxiv.org/abs/2305.10601
- ANSI Box Drawing: https://en.wikipedia.org/wiki/Box-drawing_character
- Unicode Symbols: https://unicode-table.com/en/sets/arrow-symbols/
