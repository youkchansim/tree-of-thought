---
name: tot
description: "Tree of Thought - Systematic problem solving through structured exploration"
---

# /tot - Tree of Thought Framework

**CRITICAL: You MUST follow the OUTPUT_FORMAT.md specification exactly. Display ALL thoughts with FULL content at each level.**

Read and strictly follow: `~/.claude/tot/OUTPUT_FORMAT.md`

## 🚀 STEP 0: MODE SELECTION (Execute FIRST)

**Select execution mode based on user request:**

### Mode Detection Logic

```yaml
Single-AI Modes:
  -c flag: Claude-Only → Step 1A (6 thoughts)
  -g flag: Gemini-Only → Step 1A (6 thoughts, all via Gemini MCP)
  -x flag: Codex-Only → Step 1A (6 thoughts, all via Codex MCP)

Hybrid Modes (2 AIs):
  --hybrid cg: Claude + Gemini (3:3)
  --hybrid cx: Claude + Codex (3:3)
  --hybrid gx: Gemini + Codex (3:3)

Multi-AI Mode (DEFAULT - 3 AIs):
  No flags or --multi: Claude + Gemini + Codex (2:2:2) → Step 1C
  --ratio X:Y:Z: Custom ratio (e.g., 3:2:1, 1:2:3)
```

### Decision Tree

1. **User forced Single-AI** (`-c`, `-g`, or `-x`)? → Go to **Step 1A**
2. **User requested Hybrid** (`--hybrid cg/cx/gx`)? → Go to **Step 1B**
3. **Otherwise (default)** → Attempt **Multi-AI Mode** (Step 1C)
   - All MCP calls happen in parallel (Phase 2)
   - Auto-fallback to available AIs if any fails
   - No pre-check needed!

---

## 🌐 STEP 0.5: LANGUAGE DETECTION (Execute SECOND)

**Automatically detect input language and adapt all outputs accordingly:**

### Language Detection Rules

Analyze the user's problem description:

```python
def detect_language(problem_text):
    # Check for Korean characters (Hangul)
    has_korean = any('\uac00' <= char <= '\ud7a3' for char in problem_text)

    if has_korean:
        return "Korean"  # 한국어
    else:
        return "English"
```

### Output Language Adaptation

**If language is Korean (한국어):**
- All thought content → Korean
- All evaluations → Korean
- All conclusions → Korean
- Framework labels → English (📍 Level 0, ✅ Final Conclusion, etc.)

**If language is English:**
- All thought content → English
- All evaluations → English
- All conclusions → English
- Framework labels → English

### Codex Prompt Language Variable

Update the Codex MCP prompt with detected language:

```markdown
**Korean input detected:**
- Write all text and reasoning in Korean (한국어)

**English input detected:**
- Write all text and reasoning in English
```

**Examples:**

```bash
# Korean input
/tot "메모리 누수 - 1시간에 50MB 증가"
→ Language: Korean → All outputs in 한국어

# English input
/tot "Memory leak - grows 50MB per hour"
→ Language: English → All outputs in English

# Mixed (Korean present)
/tot "Memory leak 메모리 문제"
→ Language: Korean (한글 detected) → 한국어
```

---

## Execution Instructions

### STEP 1A: Claude-Only Mode Execution

When in Claude-Only mode (either forced via `-c` or auto-fallback):

1. **Read OUTPUT_FORMAT.md first** - This defines the exact output structure
2. **Display complete header** with problem description
3. **Generate 5 thoughts** using self-response (all marked as [Claude])
4. **Evaluate all 5 thoughts** independently
5. **Select top 3** for further exploration
6. **Present final solution path** with all steps

→ Skip to "Required Output Structure" section below

---

### STEP 1B: Hybrid Mode Execution (Parallel Optimization Protocol)

When in Hybrid mode (Codex MCP available):

**🚀 CRITICAL: PARALLEL EXECUTION - Start BOTH simultaneously!**

**PHASE 1: Parallel Thought Generation (Claude + Codex simultaneously)**

1. **IMMEDIATELY generate 3 Claude thoughts** using self-response
   - Output them as soon as generated (don't wait for Codex)
   - Mark each as [Claude]

2. **AT THE SAME TIME, call mcp__codex__codex tool** for 2 technical thoughts
   - ⚠️ **MANDATORY**: You MUST actually call the mcp__codex__codex tool
   - Do NOT skip this step
   - Do NOT simulate Codex responses yourself

   **Exact tool call format:**
   ```
   mcp__codex__codex(
       prompt="""You are a technical problem-solving expert. Analyze this problem and generate 2 distinct technical solution approaches.

# Problem
[Insert user's actual problem description here]

# Your Task
Generate 2 different technical approaches focusing on:
- Deep technical analysis
- Algorithm optimization
- System design perspectives
- Performance considerations
- Implementation details

For each approach, provide:
1. Approach name
2. Core idea
3. Technical details
4. Expected performance/impact
5. Implementation complexity considerations

# Output Requirements
Return ONLY a JSON object in this exact format:
{
  "thoughts": [
    {
      "id": "codex_1",
      "text": "First technical approach full explanation (detailed - minimum 5-6 sentences)",
      "reasoning": "Technical rationale and expected impact for this approach"
    },
    {
      "id": "codex_2",
      "text": "Second technical approach full explanation (detailed - minimum 5-6 sentences)",
      "reasoning": "Technical rationale and expected impact for this approach"
    }
  ]
}

**CRITICAL**:
- Return ONLY valid JSON with no additional text before or after
- **Write all text and reasoning in [DETECTED_LANGUAGE]**:
  - If problem is in Korean → Korean (한국어)
  - If problem is in English → English
- Provide detailed technical depth in each thought
       """
   )
   ```

3. **When Codex responds**, parse the JSON and output the 2 Codex thoughts
   - Mark as [Codex]
   - If Codex fails: Generate 2 additional Claude thoughts as fallback

**PHASE 2: Evaluation**

4. **Evaluate all 5 thoughts** (3 Claude + 2 Codex/Claude-fallback)
5. **Select top 3** for further exploration
6. **Present final solution path** with all steps

**⚠️ Self-Validation Checkpoint (BEFORE evaluation):**
- [ ] Did I generate 3 Claude thoughts and output them?
- [ ] Did I ACTUALLY CALL mcp__codex__codex tool (not simulate)?
- [ ] Did I receive and parse 2 Codex thoughts (or fallback)?
- [ ] Total thought count = 5?
- [ ] Are thoughts 4 and 5 marked as [Codex] (or [Claude] if fallback)?

**If ANY checkbox is unchecked → STOP and fix before continuing!**

---

### STEP 1C: Multi-AI Mode Execution (Claude + Gemini + Codex) 🚀

**DEFAULT MODE - Maximum diversity with 3 AI perspectives**

**🚀 CRITICAL: TRIPLE PARALLEL EXECUTION - Start ALL simultaneously!**

**PHASE 1: Parallel Thought Generation (Claude + Gemini + Codex simultaneously)**

1. **IMMEDIATELY generate 2 Claude thoughts** using self-response
   - Output them as soon as generated (don't wait for MCPs)
   - Mark each as [Claude]
   - Focus: **Practical, user-focused solutions with proven patterns**

2. **AT THE SAME TIME, call mcp__gemini-cli__ask-gemini tool** for 2 system design thoughts
   - ⚠️ **MANDATORY**: You MUST actually call the mcp__gemini-cli__ask-gemini tool
   - Do NOT skip this step
   - Do NOT simulate Gemini responses yourself
   - Focus: **System architecture and creative structural approaches**

   **Exact tool call format:**
   ```
   mcp__gemini-cli__ask-gemini(
       prompt="""You are a system architecture and design expert. Analyze this problem and generate 2 distinct architectural solution approaches.

# Problem
[Insert user's actual problem description here]

# Your Task - SYSTEM DESIGN FOCUS
Generate 2 different architectural approaches focusing on:
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
{
  "thoughts": [
    {
      "id": "gemini_1",
      "text": "First architectural approach full explanation (detailed - minimum 5-6 sentences)",
      "reasoning": "System design rationale and expected benefits"
    },
    {
      "id": "gemini_2",
      "text": "Second architectural approach full explanation (detailed - minimum 5-6 sentences)",
      "reasoning": "System design rationale and expected benefits"
    }
  ]
}

**CRITICAL**:
- Return ONLY valid JSON with no additional text before or after
- **Write all text and reasoning in [DETECTED_LANGUAGE]**:
  - If problem is in Korean → Korean (한국어)
  - If problem is in English → English
- Provide detailed architectural depth in each thought
- Focus on SYSTEM DESIGN, not low-level optimization
       """
   )
   ```

3. **ALSO AT THE SAME TIME, call mcp__codex__codex tool** for 2 technical optimization thoughts
   - ⚠️ **MANDATORY**: You MUST actually call the mcp__codex__codex tool
   - Do NOT skip this step
   - Focus: **Algorithm optimization and performance analysis**

   **Exact tool call format:**
   ```
   mcp__codex__codex(
       prompt="""You are a performance optimization and algorithm expert. Analyze this problem and generate 2 distinct technical optimization approaches.

# Problem
[Insert user's actual problem description here]

# Your Task - OPTIMIZATION FOCUS
Generate 2 different technical optimization approaches focusing on:
- Algorithm complexity and performance
- Low-level technical optimization
- Profiling and measurement strategies
- Resource utilization improvements
- Implementation efficiency

For each approach, provide:
1. Approach name (optimization perspective)
2. Core optimization technique
3. Algorithm/performance details
4. Expected performance impact
5. Implementation complexity considerations

# Output Requirements
Return ONLY a JSON object in this exact format:
{
  "thoughts": [
    {
      "id": "codex_1",
      "text": "First optimization approach full explanation (detailed - minimum 5-6 sentences)",
      "reasoning": "Technical rationale and expected performance impact"
    },
    {
      "id": "codex_2",
      "text": "Second optimization approach full explanation (detailed - minimum 5-6 sentences)",
      "reasoning": "Technical rationale and expected performance impact"
    }
  ]
}

**CRITICAL**:
- Return ONLY valid JSON with no additional text before or after
- **Write all text and reasoning in [DETECTED_LANGUAGE]**:
  - If problem is in Korean → Korean (한국어)
  - If problem is in English → English
- Provide detailed technical depth in each thought
- Focus on PERFORMANCE and ALGORITHMS, not architecture
       """
   )
   ```

4. **When MCPs respond**, parse the JSON and output all thoughts
   - Mark Gemini thoughts as [Gemini]
   - Mark Codex thoughts as [Codex]
   - If Gemini fails: Generate 2 additional Claude thoughts as fallback (mark as [Claude])
   - If Codex fails: Generate 2 additional Claude thoughts as fallback (mark as [Claude])

**PHASE 2: Evaluation**

5. **Evaluate all 6 thoughts** (2 Claude + 2 Gemini/fallback + 2 Codex/fallback)
6. **Select top 3-4** for further exploration
7. **Present final solution path** with all steps

**⚠️ Self-Validation Checkpoint (BEFORE evaluation):**
- [ ] Did I generate 2 Claude thoughts and output them?
- [ ] Did I ACTUALLY CALL mcp__gemini-cli__ask-gemini tool (not simulate)?
- [ ] Did I ACTUALLY CALL mcp__codex__codex tool (not simulate)?
- [ ] Did I receive and parse 2 Gemini thoughts (or fallback)?
- [ ] Did I receive and parse 2 Codex thoughts (or fallback)?
- [ ] Total thought count = 6?
- [ ] Are thoughts properly marked: [Claude], [Gemini], [Codex]?

**If ANY checkbox is unchecked → STOP and fix before continuing!**

**Performance:**
- Expected time: 15-20 seconds (parallel execution)
- Claude: ~5s, Gemini: ~10s, Codex: ~15s (all run in parallel)
- Total = max(5s, 10s, 15s) = ~15s + parsing = ~20s

**Diversity Benefits:**
- **Claude**: Proven, practical approaches
- **Gemini**: Innovative architectural designs
- **Codex**: Deep technical optimizations
- **Combined**: 3 completely different perspectives for optimal solution

---

## STEP 2: Required Output Structure (All Modes)

### Required Output Structure

```
┌──────────────────────────────────────────────────────────────┐
│ 🌳 Tree of Thought: [Problem Description]                     │
└──────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Level 0: Initial Thoughts (n_generate=5 for Hybrid, 6 for Multi-AI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thought 1 [Claude]: [Title - Practical Approach]
┌────────────────────────────────────────────────────────────┐
│ [FULL detailed content explaining the approach]            │
│                                                            │
│ [Specific actions or checks to perform]                   │
│ • Point 1                                                  │
│ • Point 2                                                  │
│ • Point 3                                                  │
│                                                            │
│ Verification method: [Command or approach]                 │
└────────────────────────────────────────────────────────────┘

Thought 2 [Claude]: [Title - Balanced Approach]
[... FULL content ...]

Thought 3 [Gemini]: [Title - Architectural Approach]
[... FULL content ...]

Thought 4 [Gemini]: [Title - System Design Approach]
[... FULL content ...]

Thought 5 [Codex]: [Title - Optimization Approach]
[... FULL content ...]

Thought 6 [Codex]: [Title - Performance Approach]
[... FULL content ...]

[... Display ALL thoughts with FULL content]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Level 1: Evaluation (n_evaluate=3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Evaluating Thought 1 [Claude]...
  Eval 1: 8.5/10 → [Specific reason]
  Eval 2: 9.0/10 → [Specific reason]
  Eval 3: 8.7/10 → [Specific reason]
  ────────────────
  Average: 8.7/10 ⭐ (Confidence: 95%)

Evaluating Thought 2 [Claude]...
  Average: 8.3/10 ⭐

Evaluating Thought 3 [Gemini]...
  Average: 9.2/10 ⭐⭐

Evaluating Thought 4 [Gemini]...
  Average: 8.8/10 ⭐

Evaluating Thought 5 [Codex]...
  Average: 9.5/10 ⭐⭐⭐

Evaluating Thought 6 [Codex]...
  Average: 8.1/10 ⭐

[... Evaluate ALL thoughts]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Level 2: Selection (n_select=3-4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Selected Top 3-4 Thoughts (Multi-AI diversity):
  ✓ Thought 5 [Codex] - 9.5/10: [Performance Optimization Title]
  ✓ Thought 3 [Gemini] - 9.2/10: [Architectural Design Title]
  ✓ Thought 1 [Claude] - 8.7/10: [Practical Approach Title]
  ✓ Thought 4 [Gemini] - 8.8/10: [System Design Title] (if 4 selected)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Final Conclusion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solution Path (3 steps):
  1. [9.1] [Title] ✅
  2. [9.5] [Refined approach] ✅
  3. [9.7] [Final solution] ✅

Overall Score: 9.4/10 ⭐⭐⭐⭐⭐

[Final verdict and recommendation]

Key Findings:
- [Finding 1]
- [Finding 2]
- [Finding 3]

🚀 [Call to action or next steps]
```

## Princeton ToT Methodology

### Default Parameters

```yaml
# Multi-AI Mode (Default)
n_generate: 6        # Generate 6 thoughts per level
n_evaluate: 3        # Evaluate each thought 3 times
n_select: 3-4        # Keep top 3-4 for next level
algorithm: BFS       # Breadth-first search
ratio: "2:2:2"       # Claude:Gemini:Codex ratio (2 each)
max_depth: 3         # Maximum search depth
confidence: 9.0      # Early stopping threshold

# Hybrid Mode (2 AIs)
ratio: "3:3"         # Equal split between 2 AIs
n_generate: 6        # Total 6 thoughts

# Single-AI Mode
n_generate: 6        # All from one AI
```

### Multi-AI Mode (Claude + Gemini + Codex) - DEFAULT 🚀

**Generation:**
- **Claude thoughts (2)**: Practical, user-focused, proven patterns
- **Gemini thoughts (2)**: System architecture, creative design, innovative solutions
- **Codex thoughts (2)**: Algorithm optimization, performance analysis, technical depth

**Evaluation:**
- Each thought gets 3 independent evaluations
- Cross-AI diversity scoring for better selection
- Confidence calculated from evaluation consistency

**Benefits:**
- **Maximum Diversity**: 3 completely different AI perspectives
- **Balanced Solutions**: Practical + Creative + Optimal
- **Best Coverage**: User experience + Architecture + Performance

**When to use Multi-AI:**
- Complex problems requiring multiple perspectives
- Architecture + Performance optimization needed
- Want to explore maximum solution space

### Hybrid Mode (2 AIs)

**Available Combinations:**
- `--hybrid cg`: Claude + Gemini (Practical + Architecture)
- `--hybrid cx`: Claude + Codex (Practical + Performance) - Classic
- `--hybrid gx`: Gemini + Codex (Architecture + Performance)

**Generation:**
- Each AI generates 3 thoughts (total 6)
- Focused expertise from 2 complementary perspectives

**When to use Hybrid:**
- Focus on 2 specific aspects (e.g., architecture + performance)
- Faster execution than Multi-AI (one less MCP call)
- Clear trade-off between two approaches needed

### Single-AI Mode

**Available Options:**
- `-c`: Claude-Only (6 practical thoughts)
- `-g`: Gemini-Only (6 architectural thoughts)
- `-x`: Codex-Only (6 optimization thoughts)

**When to use Single-AI:**
- Quick analysis needed
- Specific expertise required (e.g., only performance)
- MCP services unavailable

### MCP Integration

**Multi-AI requires:**
- `mcp__gemini-cli__ask-gemini` tool for Gemini integration
- `mcp__codex__codex` tool for Codex integration
- See `~/.claude/tot/core/gemini-mcp-integration.md`
- See `~/.claude/tot/core/codex-mcp-integration.md`

### Codex MCP Connection Status

**IMPORTANT: Automatic Fallback System**

When ToT initializes in Hybrid mode, it automatically checks Codex MCP availability:

**✅ Connection Successful:**
```
✅ Hybrid 모드 - Codex MCP 연결됨
   Claude 3 + Codex 2 (ratio 3:2)
```
- Full Hybrid mode with both Claude and Codex thoughts
- Direct MCP call for faster execution
- Expected execution time: **30-45 seconds** (optimized!)

**⚠️ Connection Failed:**
```
⚠️  Codex MCP 호출 실패 → Claude로 대체 생성
   (3 Claude + 2 Claude-fallback = 5 thoughts)
```
- Automatic fallback to Claude for failed Codex thoughts
- All 5 thoughts generated by Claude
- Execution time: ~25-30 seconds
- No loss of functionality, only reduced technical depth

**Error Recovery:**
- Codex MCP calls have **1 automatic retry with 3-second delay**
- If retry fails, those 2 thoughts fallback to Claude immediately
- User is notified with clear status messages
- Execution continues seamlessly without manual intervention

**Manual Mode Selection:**
- `/tot -c "problem"` → Force Claude-only mode (skip Codex check)
- `/tot -x "problem"` → Force Codex-only mode (fail if unavailable)
- `/tot "problem"` → Auto-detect mode with fallback (recommended)

## Problem Types

The framework automatically detects and handles:

- **Debug**: Bug analysis and root cause identification
- **Refactor**: Code restructuring and improvement strategies
- **Design**: Architecture and system design decisions
- **Optimize**: Performance and efficiency improvements
- **Custom**: Any problem requiring systematic exploration

## Algorithm Selection

### BFS (Breadth-First Search) - Default
- Explores all options at each level before going deeper
- Guarantees finding optimal solution within depth limit
- Best for: Comprehensive exploration, finding multiple solutions

### DFS (Depth-First Search)
- Dives deep into promising paths with backtracking
- Lower memory usage, faster for deep problems
- Best for: Complex problems requiring deep analysis

**Selection criteria:**
- Use BFS for broad exploration (debugging, design choices)
- Use DFS for deep technical analysis (algorithm optimization)

## Evaluation Criteria

Each thought is evaluated on 4 dimensions:

1. **Feasibility** (30%): Implementation difficulty
   - 10: Simple parameter change
   - 5: Complex algorithm implementation
   - 1: Requires human intervention

2. **Impact** (30%): Expected improvement
   - 10: 90-100% improvement
   - 5: 40-50% improvement
   - 1: <10% improvement

3. **Risk** (20%): Potential side effects
   - 10: No side effects
   - 5: Configuration changes needed
   - 1: Breaking changes

4. **Complexity** (20%): Testing/validation difficulty
   - 10: Fully automatable
   - 5: Manual validation required
   - 1: Long-term monitoring needed

**Total Score = (Feasibility × 0.3) + (Impact × 0.3) + (Risk × 0.2) + (Complexity × 0.2)**

## Usage Examples

### Multi-AI Mode (Default - Recommended) 🚀

```bash
# Default: Claude + Gemini + Codex (2:2:2)
/tot "Production app memory grows 50MB/hour after user logout"

# Custom ratio (Claude focused)
/tot --ratio 3:2:1 "Design real-time notification system for 100k users"

# Custom ratio (Performance focused)
/tot --ratio 1:1:4 "Query takes 5s - SELECT with JOIN on 1M+ rows"
```

**Output:** 6 thoughts - 2 practical (Claude), 2 architectural (Gemini), 2 optimized (Codex)

### Hybrid Mode (2 AIs)

```bash
# Claude + Gemini: Practical + Architecture
/tot --hybrid cg "Refactor 2000-line UserService.js"

# Claude + Codex: Practical + Performance (Classic)
/tot --hybrid cx "Optimize image processing pipeline"

# Gemini + Codex: Architecture + Performance
/tot --hybrid gx "Design high-throughput message queue"
```

**Output:** 6 thoughts - 3 from each AI

### Single-AI Mode

```bash
# Claude-only: Quick practical solutions
/tot -c "Fix authentication bug in login flow"

# Gemini-only: System architecture focus
/tot -g "Design microservices architecture"

# Codex-only: Performance optimization focus
/tot -x "Reduce API latency from 500ms to 50ms"
```

**Output:** 6 thoughts - all from selected AI

### Real-World Examples

#### Example 1: Memory Leak (Multi-AI)
```bash
/tot "메모리 누수 - 1시간에 50MB 증가, 로그아웃 후 발생"
```
- Claude: 이벤트 리스너 미제거, 캐시 정리 누락
- Gemini: 메모리 관리 아키텍처 개선, 리소스 라이프사이클 설계
- Codex: 힙 프로파일링, GC 최적화, 메모리 할당 분석

#### Example 2: System Design (Hybrid: Gemini + Codex)
```bash
/tot --hybrid gx "Design video streaming service for 1M concurrent users"
```
- Gemini: CDN architecture, microservices design, scalability patterns
- Codex: Adaptive bitrate algorithms, caching strategies, load distribution

#### Example 3: Quick Fix (Claude-only)
```bash
/tot -c "NullPointerException in PaymentService after DB upgrade"
```
- Fast, practical debugging steps without architectural overhead

## Tips for Best Results

1. **Be Specific**: Provide context and constraints
   - ❌ "app is slow"
   - ✅ "API endpoint /users takes 3s - 10k users, no caching"

2. **Include Metrics**: Error messages, performance data, requirements
   - ❌ "fix this bug"
   - ✅ "NullPointerException in UserService.login() after OAuth update"

3. **State Goals**: What success looks like
   - ❌ "improve performance"
   - ✅ "reduce response time from 3s to <500ms without adding servers"

## Technical References

- **Core Algorithms**: `~/.claude/tot/core/bfs-implementation.md`, `dfs-implementation.md`
- **Evaluation Methods**: `~/.claude/tot/core/evaluation-concepts.md`
- **Task System**: `~/.claude/tot/core/task-system.md`
- **Codex Integration**: `~/.claude/tot/core/codex-mcp-integration.md`
- **Output Format**: `~/.claude/tot/OUTPUT_FORMAT.md` **(MUST READ FIRST)**

## Limitations

- Does not execute code or make changes automatically
- Requires clear problem description for best results
- Complex problems may take 2-3 minutes to fully explore
- Limited to text-based analysis (no visual debugging)

## Support

- **Documentation**: https://github.com/youkchansim/tree-of-thought
- **Issues**: https://github.com/youkchansim/tree-of-thought/issues
- **Examples**: See `~/.claude/tot/examples/` for real-world cases

---

**Princeton NLP Research**
[Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601)
