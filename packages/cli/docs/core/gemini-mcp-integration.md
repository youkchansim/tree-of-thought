# Gemini MCP Integration Guide

How to integrate Gemini MCP into the ToT system within the Claude Code CLI environment

## 🎯 Core Concepts

```yaml
Execution Environment:
  - Runs inside Claude Code CLI
  - No API calls
  - Gemini MCP invocation via direct mcp__gemini-cli__ask-gemini call (OPTIMIZED)

Thought Generation Method:
  - Claude thoughts: Self-generated (immediate, ~5s for 2 thoughts)
  - Gemini thoughts: Direct mcp__gemini-cli__ask-gemini call (parallel, ~10s for 2 thoughts)
  - Codex thoughts: Direct mcp__codex__codex call (parallel, ~15s for 2 thoughts)
  - TOTAL TIME: ~15s (all parallel) vs ~30s (sequential)

🚀 CRITICAL OPTIMIZATION:
  - PARALLEL execution: Claude + Gemini + Codex run simultaneously
  - NO Task tool overhead (direct MCP calls)
  - NO pre-check health test (immediate execution)
  - Expected total time: 15-20 seconds for full Level 1 (6 thoughts + evaluation)

🌐 LANGUAGE SUPPORT:
  - Auto-detect input language (Korean/English)
  - Adapt all outputs to match input language
  - Pass language context to Gemini MCP
  - Korean input → 한국어 outputs
  - English input → English outputs
```

---

## 📋 Gemini MCP Call Interface

### 1. Direct MCP Call Structure (OPTIMIZED)

```python
# ✅ CORRECT: Direct mcp__gemini-cli__ask-gemini call
import json

gemini_response = mcp__gemini-cli__ask-gemini(
    prompt=f"""You are a system architecture and design expert. Analyze this problem and generate 2 distinct architectural solution approaches.

# Problem
{x}

# Your Task - SYSTEM DESIGN FOCUS
Generate 2 different architectural approaches focusing on:
- System design and structure
- Design patterns and architectural patterns
- Creative and innovative solutions
- Scalability and maintainability perspectives

# Output Requirements
Return ONLY a JSON object in this exact format:
{{
  "thoughts": [
    {{
      "id": "gemini_1",
      "text": "First architectural approach explanation",
      "reasoning": "System design rationale for this approach"
    }},
    {{
      "id": "gemini_2",
      "text": "Second architectural approach explanation",
      "reasoning": "System design rationale for this approach"
    }}
  ]
}}

**CRITICAL**: Return ONLY valid JSON. No additional text before or after.
**Language**: Write all text and reasoning in {{DETECTED_LANGUAGE}}:
  - If problem is in Korean → Korean (한국어)
  - If problem is in English → English
"""
)

# Parse response (Gemini returns wrapped JSON)
# Extract JSON from markdown code block if present
if "```json" in gemini_response:
    json_text = gemini_response.split("```json")[1].split("```")[0].strip()
else:
    json_text = gemini_response

data = json.loads(json_text)
gemini_thoughts = data["thoughts"]
```

### 2. Installation

Gemini MCP is installed via:

```bash
# Claude Code에서 한 줄로 설치
claude mcp add gemini-cli -s user -- npx -y gemini-mcp-tool
```

This installs:
- `mcp__gemini-cli__ask-gemini` - Main analysis tool
- `mcp__gemini-cli__brainstorm` - Idea generation (optional)
- Model selection: gemini-2.5-pro (default), gemini-2.5-flash

---

## 🔄 Integration Workflow

### Gemini MCP Integration in Multi-AI Mode

```python
def generate_thoughts_multi_ai(task, x, current_thoughts, args):
    """
    Multi-AI thought generation: Claude self + Gemini MCP + Codex MCP

    Args:
        task: Task object (DebugTask/RefactorTask/DesignTask)
        x: Initial problem description
        current_thoughts: List of thoughts at current level
        args: ToT parameters (n_generate_sample, ratio, etc.)

    Returns:
        List[Thought]: Integrated list of Claude + Gemini + Codex thoughts
    """

    # 1. Calculate ratio
    claude_ratio, gemini_ratio, codex_ratio = parse_ratio(args.ratio)  # e.g., "2:2:2"
    n_total = args.n_generate_sample
    n_claude = int(n_total * claude_ratio / sum([claude_ratio, gemini_ratio, codex_ratio]))
    n_gemini = int(n_total * gemini_ratio / sum([claude_ratio, gemini_ratio, codex_ratio]))
    n_codex = int(n_total * codex_ratio / sum([claude_ratio, gemini_ratio, codex_ratio]))

    all_thoughts = []

    # 2. Generate Claude thoughts (self - immediate)
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

    # 3. Generate Gemini thoughts (MCP call - parallel with Codex)
    if n_gemini > 0:
        gemini_thoughts = call_gemini_mcp(
            task=task,
            x=x,
            current_thought=current_thoughts[-1] if current_thoughts else "",
            n_thoughts=n_gemini,
            depth=len(current_thoughts)
        )
        all_thoughts.extend(gemini_thoughts)

    # 4. Generate Codex thoughts (MCP call - parallel with Gemini)
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


def call_gemini_mcp(task, x, current_thought, n_thoughts, depth):
    """
    Thought generation via Gemini MCP - ARCHITECTURE FOCUS

    Direct mcp__gemini-cli__ask-gemini call (no Task tool)
    """

    gemini_prompt = f"""You are a system architecture and design expert. Analyze this problem and generate {n_thoughts} distinct architectural solution approaches.

# Problem Context
{x}

## Current Progress
{current_thought if current_thought else "Starting fresh"}

## Task Type
{task.__class__.__name__}

## Current Depth
Level {depth + 1}

# Your Task - SYSTEM DESIGN FOCUS
Generate {n_thoughts} different architectural approaches focusing on:
- System design and structure
- Design patterns and architectural patterns
- Creative and innovative solutions
- Scalability and maintainability perspectives
- Component relationships and data flow

For each approach, provide:
1. Approach name (architectural perspective)
2. Core design concept
3. System structure details
4. Component interactions
5. Scalability and maintenance considerations

# Output Requirements
Return ONLY a JSON object in this exact format:
{{
  "thoughts": [
    {{
      "id": "gemini_1",
      "text": "첫 번째 아키텍처 방안 설명 (상세히 5-6문장)",
      "reasoning": "이 설계의 장점과 기대 효과"
    }},
    {{
      "id": "gemini_2",
      "text": "두 번째 아키텍처 방안 설명 (상세히 5-6문장)",
      "reasoning": "이 설계의 장점과 기대 효과"
    }}
  ]
}}

**Requirements**:
- 한국어로 작성 (또는 문제 언어에 맞춤)
- 시스템 설계와 아키텍처 관점 우선
- 확장성과 유지보수성 고려
- 각 사고는 명확히 구분되어야 함
- SYSTEM DESIGN에 집중, 저수준 최적화 아님
"""

    # Direct MCP call
    gemini_response = mcp__gemini-cli__ask-gemini(prompt=gemini_prompt)

    # Parse response (handle markdown wrapper)
    return parse_gemini_response(gemini_response, depth)


def parse_gemini_response(response, depth):
    """
    Convert Gemini MCP response to Thought object list

    Gemini returns JSON wrapped in markdown code blocks:
    "Gemini response:\n```json\n{...}\n```"
    """
    import json

    # Extract JSON from markdown wrapper
    response_text = response

    # Handle "Gemini response:" prefix
    if "Gemini response:" in response_text:
        response_text = response_text.split("Gemini response:")[1].strip()

    # Extract from markdown code block
    if "```json" in response_text:
        json_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        json_text = response_text.split("```")[1].split("```")[0].strip()
    else:
        json_text = response_text

    # Parse JSON
    data = json.loads(json_text)

    thoughts = []
    for item in data.get("thoughts", []):
        thought = Thought(
            id=item["id"],
            text=item["text"],
            model="gemini",
            depth=depth,
            metadata={
                "reasoning": item.get("reasoning", ""),
                "focus": "architecture"
            }
        )
        thoughts.append(thought)

    return thoughts
```

---

## 🎯 Task Type-Specific Gemini Prompts

### DebugTask - Gemini Call (Architecture Perspective)

```python
def get_gemini_debug_prompt(x, current_thought):
    return f"""
# Bug Debugging - System Architecture Analysis

## Problem
{x}

## Current Analysis
{current_thought}

**Generate 2 architectural root cause hypotheses:**

Focus on:
- System design flaws
- Component interaction issues
- Resource lifecycle management
- Architectural patterns violation
- Inter-service communication problems

Output JSON:
{{
  "thoughts": [
    {{
      "id": "gemini_1",
      "text": "시스템 구조적 원인 분석 1",
      "reasoning": "아키텍처 관점 근거"
    }},
    {{
      "id": "gemini_2",
      "text": "시스템 구조적 원인 분석 2",
      "reasoning": "아키텍처 관점 근거"
    }}
  ]
}}
"""
```

### RefactorTask - Gemini Call (Architecture Perspective)

```python
def get_gemini_refactor_prompt(x, current_thought):
    return f"""
# Code Refactoring - Architectural Redesign

## Code/System
{x}

## Current Strategy
{current_thought}

**Generate 2 architectural restructuring strategies:**

Focus on:
- Design pattern applications
- Component separation and cohesion
- Dependency management
- Modular architecture
- Scalability-focused design

Output JSON:
{{
  "thoughts": [
    {{
      "id": "gemini_1",
      "text": "아키텍처 재설계 전략 1",
      "reasoning": "구조적 개선 근거"
    }},
    {{
      "id": "gemini_2",
      "text": "아키텍처 재설계 전략 2",
      "reasoning": "구조적 개선 근거"
    }}
  ]
}}
"""
```

### DesignTask - Gemini Call (Primary Expertise)

```python
def get_gemini_design_prompt(x, current_thought):
    return f"""
# System Design - Innovative Architecture

## Requirements
{x}

## Current Design Direction
{current_thought}

**Generate 2 innovative architectural patterns:**

Focus on:
- Scalable system architecture
- Microservices vs Monolith trade-offs
- Event-driven design patterns
- Data flow and state management
- High availability and fault tolerance

Output JSON:
{{
  "thoughts": [
    {{
      "id": "gemini_1",
      "text": "혁신적 아키텍처 패턴 1",
      "reasoning": "설계 장점과 확장성"
    }},
    {{
      "id": "gemini_2",
      "text": "혁신적 아키텍처 패턴 2",
      "reasoning": "설계 장점과 확장성"
    }}
  ]
}}
"""
```

---

## 🚀 Parallel Execution with Codex

### Triple Parallel Processing

**🚀 KEY INSIGHT: All 3 AI calls can run in parallel!**

When Claude outputs thoughts AND calls both MCPs in the same response:
- Claude thoughts: Generated instantly (self-response, ~5s)
- Gemini MCP call: Starts immediately in parallel (~10s)
- Codex MCP call: Starts immediately in parallel (~15s)
- Total time = max(5s, 10s, 15s) = ~15s

**Implementation in /tot command:**

```markdown
PHASE 1: Triple Parallel Thought Generation

1. IMMEDIATELY generate 2 Claude thoughts
   - Output them instantly
   - Don't wait for MCPs

2. AT THE SAME TIME, call mcp__gemini-cli__ask-gemini
   - Runs in parallel with Codex
   - No blocking

3. AT THE SAME TIME, call mcp__codex__codex
   - Runs in parallel with Gemini
   - No blocking

RESULT:
- Claude: 5s
- Gemini: 10s (parallel with Codex)
- Codex: 15s (parallel with Gemini)
- Total: ~15s (parallel) vs ~30s (sequential)
- 2x speedup! 🚀
```

---

## 🛡️ Error Handling & Fallback System

### Resilient Gemini MCP Call with Retry

```python
def call_gemini_mcp_with_retry(task, x, current_thought, n_thoughts, depth):
    """
    Call Gemini MCP with automatic retry and fallback

    Returns:
        (thoughts, source):
            - thoughts: List[Thought]
            - source: "gemini" | "claude_fallback"
    """
    max_retries = 1  # OPTIMIZED: 1 retry only
    retry_delay = 3  # OPTIMIZED: 3 seconds

    for attempt in range(max_retries):
        try:
            print(f"  🔄 Gemini MCP 호출 중... (시도 {attempt + 1}/{max_retries})")

            # Construct Gemini prompt
            gemini_prompt = construct_gemini_prompt(
                task=task,
                x=x,
                current_thought=current_thought,
                n_thoughts=n_thoughts
            )

            # Call Gemini MCP
            gemini_response = mcp__gemini-cli__ask-gemini(prompt=gemini_prompt)

            # Parse JSON response
            thoughts = parse_gemini_response(gemini_response, depth)

            if len(thoughts) == 0:
                raise ValueError("Gemini returned empty thoughts")

            print(f"  ✅ Gemini 사고 {len(thoughts)}개 생성 완료")
            return thoughts, "gemini"

        except json.JSONDecodeError as e:
            print(f"  ⚠️  JSON 파싱 실패: {e}")
            if attempt < max_retries - 1:
                print(f"  🔄 {retry_delay}초 후 재시도...")
                time.sleep(retry_delay)
                continue

        except Exception as e:
            print(f"  ❌ Gemini MCP 오류: {e}")
            if attempt < max_retries - 1:
                print(f"  🔄 {retry_delay}초 후 재시도...")
                time.sleep(retry_delay)
                continue

    # All retries failed → Fallback to Claude
    print(f"  ⚠️  모든 재시도 실패 → Claude로 대체 생성 ({n_thoughts}개)")

    claude_thoughts = generate_claude_thoughts(
        task=task,
        x=x,
        current_thought=current_thought,
        n_thoughts=n_thoughts,
        depth=depth
    )

    # Mark as fallback
    for thought in claude_thoughts:
        thought.metadata["fallback"] = True
        thought.metadata["intended_source"] = "gemini"

    return claude_thoughts, "claude_fallback"
```

---

## 📊 Performance Comparison

### Execution Time Analysis

```yaml
Sequential Execution (Old):
  Claude: 5s
  Gemini: 10s
  Codex: 15s
  Total: 30s

Parallel Execution (New):
  Claude: 5s   ┐
  Gemini: 10s  ├─ Run simultaneously
  Codex: 15s   ┘
  Total: 15s

Performance Gain: 2x faster! 🚀
```

### Quality Comparison

```yaml
Multi-AI Benefits:
  Diversity: 3 completely different perspectives
  Coverage:
    - Practical solutions (Claude)
    - Innovative architecture (Gemini)
    - Optimized performance (Codex)

  Success Rate: Higher (more solution paths explored)
  User Satisfaction: Better (balanced recommendations)
```

---

## 🎯 Practical Usage Examples

### Example 1: System Design (Gemini Strength)

```bash
/tot "Design notification system for 100k concurrent users"

# Output:
# - Claude: Queue-based approach, WebSocket connections
# - Gemini: Event-driven microservices, pub/sub patterns
# - Codex: Connection pooling optimization, batch processing
```

### Example 2: Memory Leak (Multi-AI)

```bash
/tot "메모리 누수 - 로그아웃 후 50MB/hour 증가"

# Output:
# - Claude: 이벤트 리스너 미제거, 타이머 정리 누락
# - Gemini: 리소스 라이프사이클 관리 아키텍처 개선
# - Codex: 힙 프로파일링, 메모리 할당 패턴 분석
```

### Example 3: Hybrid (Gemini + Codex)

```bash
/tot --hybrid gx "Design video streaming for 1M users"

# Output:
# - Gemini (3): CDN architecture, microservices, scalability
# - Codex (3): Adaptive bitrate, caching, load balancing
```

---

## 📝 Summary

**Core of Gemini MCP Integration:**

1. **Direct MCP call**: Use `mcp__gemini-cli__ask-gemini` directly ⚡
2. **Markdown parsing**: Handle ```json wrapper correctly
3. **Parallel execution**: Run with Codex simultaneously (2x faster)
4. **Architecture focus**: Gemini excels at system design
5. **Auto-fallback**: Seamless Claude fallback when unavailable

**Performance Advantages:**
- **Parallel execution**: All 3 AIs run simultaneously
- **Direct MCP call**: No Task tool overhead
- **Expected time**: 15-20s per level (Multi-AI mode)
- **2x speedup**: vs sequential execution

**Role Differentiation:**
- **Claude**: Practical, proven solutions
- **Gemini**: Innovative architecture, creative design
- **Codex**: Performance optimization, algorithms

**Installation:**
```bash
claude mcp add gemini-cli -s user -- npx -y gemini-mcp-tool
```

---

*Multi-AI ToT system: Claude Code CLI + Gemini MCP + Codex MCP*
