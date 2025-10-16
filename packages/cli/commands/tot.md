---
name: tot
description: "Tree of Thought - Systematic problem solving through structured exploration"
---

# /tot - Tree of Thought Framework

**CRITICAL: You MUST follow the OUTPUT_FORMAT.md specification exactly. Display ALL thoughts with FULL content at each level.**

Read and strictly follow: `~/.claude/tot/OUTPUT_FORMAT.md`

## 🚀 STEP 0: INITIALIZATION (Execute FIRST)

**CRITICAL: Before generating thoughts, you MUST determine execution mode.**

### Mode Detection Protocol

1. **Check user flags**:
   - If `-c` or `--claude` flag present → Skip to Claude-Only Mode (go to Step 1A)
   - Otherwise → Attempt Hybrid Mode

2. **Test Codex MCP availability** (only if no `-c` flag):

   **You MUST execute this Task tool call:**

   ```
   Task(
       subagent_type="general-purpose",
       description="Codex MCP availability check",
       prompt='Return exactly: {"status": "OK", "model": "codex"}'
   )
   ```

   - **If successful** (response contains "OK"):
     - ✅ Use Hybrid Mode (go to Step 1B)
     - Display: `✅ Hybrid 모드 - Codex MCP 연결됨\n   Claude 3 + Codex 2 (ratio 3:2)`

   - **If failed** (timeout, error, or no response):
     - ⚠️ Auto-fallback to Claude-Only Mode (go to Step 1A)
     - Display: `⚠️ Codex MCP 미설정 - Claude 전용 모드로 전환\n   (5개 생각 모두 Claude로 생성)`

3. **Proceed with determined mode** → Go to Step 1A or 1B below

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

### STEP 1B: Hybrid Mode Execution (Two-Phase Protocol)

When in Hybrid mode (Codex MCP available):

**PHASE 1: Claude Thought Generation (Immediate)**

1. **Generate 3 Claude thoughts** using self-response
2. **Output them immediately** with full content

**PHASE 2: Codex Thought Generation (MANDATORY TASK TOOL CALL)**

⚠️ **YOU MUST NOW CALL TASK TOOL - DO NOT SKIP THIS STEP**

3. **Call Task tool for Codex thoughts**:

   Template (adapt the prompt for current problem):
   ```
   Task(
       subagent_type="general-purpose",
       description="ToT Codex thought generation - Level 1",
       prompt="""
# Problem
[Insert user's problem description here]

# Task
Generate 2 distinct technical solution approaches focusing on:
- Deep technical analysis
- Algorithm optimization
- System design perspectives

# Output Format (JSON)
{
  "thoughts": [
    {
      "id": "codex_1",
      "text": "첫 번째 기술적 접근법 설명",
      "reasoning": "이 방법을 선택한 기술적 근거"
    },
    {
      "id": "codex_2",
      "text": "두 번째 기술적 접근법 설명",
      "reasoning": "이 방법을 선택한 기술적 근거"
    }
  ]
}

# Language
- 한국어로 작성
- 기술적 깊이 우선
       """
   )
   ```

4. **Parse Codex response** and extract 2 thoughts
5. **Output Codex thoughts** (mark as [Codex])

**PHASE 3: Evaluation**

6. **Evaluate all 5 thoughts** (3 Claude + 2 Codex)
7. **Select top 3** for further exploration
8. **Present final solution path** with all steps

**Self-Validation Checkpoint:**
- Before outputting evaluation, verify:
  - [ ] Did I generate 3 Claude thoughts?
  - [ ] Did I call Task tool for Codex?
  - [ ] Did I receive 2 Codex thoughts?
  - [ ] Total thought count = 5?
- If any checkbox is unchecked → ERROR, go back and fix

---

## STEP 2: Required Output Structure (Both Modes)

### Required Output Structure

```
┌──────────────────────────────────────────────────────────────┐
│ 🌳 Tree of Thought: [Problem Description]                     │
└──────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Level 0: Initial Thoughts (n_generate=5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thought 1 [Claude]: [Title]
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

[... Repeat for ALL 5 thoughts with FULL content]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Level 1: Evaluation (n_evaluate=3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Evaluating Thought 1 [Claude]...
  Eval 1: 8.5/10 → [Specific reason]
  Eval 2: 9.0/10 → [Specific reason]
  Eval 3: 8.7/10 → [Specific reason]
  ────────────────
  Average: 8.7/10 ⭐ (Confidence: 95%)

[... Repeat for ALL 5 thoughts]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Level 2: Selection (n_select=3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Selected Top 3 Thoughts:
  ✓ Thought 2 [Codex] - 9.1/10: [Title]
  ✓ Thought 1 [Claude] - 8.7/10: [Title]
  ✓ Thought 4 [Codex] - 8.3/10: [Title]

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
n_generate: 5        # Generate 5 thoughts per level
n_evaluate: 3        # Evaluate each thought 3 times
n_select: 3          # Keep top 3 for next level
algorithm: BFS       # Breadth-first search
ratio: "3:2"         # Claude:Codex ratio (3 Claude, 2 Codex)
max_depth: 3         # Maximum search depth
confidence: 9.0      # Early stopping threshold
```

### Hybrid Mode (Claude + Codex)

**Generation:**
- Claude thoughts (3): Practical, user-focused, quick solutions
- Codex thoughts (2): Technical depth, algorithm optimization, system design

**Evaluation:**
- Cross-evaluation: Claude evaluates Codex, Codex evaluates Claude
- Each thought gets 3 independent evaluations
- Confidence calculated from evaluation consistency

**When Codex MCP is available:**
Use Task tool for Codex integration. See `~/.claude/tot/core/codex-mcp-integration.md`

### Codex MCP Connection Status

**IMPORTANT: Automatic Fallback System**

When ToT initializes in Hybrid mode, it automatically checks Codex MCP availability:

**✅ Connection Successful:**
```
✅ Hybrid 모드 - Codex MCP 연결됨
   Claude 3 + Codex 2 (ratio 3:2)
```
- Full Hybrid mode with both Claude and Codex thoughts
- Cross-evaluation for optimal solution quality
- Expected execution time: 1.5-2 minutes

**⚠️ Connection Failed:**
```
⚠️  Hybrid 모드 요청 → Codex MCP 응답 없음
   → Claude 전용 모드로 자동 전환
   (5개 생각 모두 Claude로 생성)
```
- Automatic fallback to Claude-only mode
- All 5 thoughts generated by Claude
- Faster execution time: ~30 seconds
- No loss of functionality, only reduced technical depth

**Error Recovery:**
- Codex MCP calls have 2 automatic retries with 5-second delays
- If all retries fail, that specific step falls back to Claude
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

### Debug a Memory Leak
```
/tot "Production app memory grows 50MB/hour after user logout"
```

### Design System Architecture
```
/tot "Design real-time notification system for 100k concurrent users"
```

### Optimize Database Query
```
/tot "Query takes 5 seconds - SELECT with JOIN on 1M+ rows, no indexes"
```

### Refactor Legacy Code
```
/tot "Refactor 2000-line UserService.js with 15 dependencies and no tests"
```

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
