---
name: tot
description: "Tree of Thought - Systematic problem solving through structured exploration"
---

# /tot - Tree of Thought Framework

**CRITICAL: You MUST follow the OUTPUT_FORMAT.md specification exactly. Display ALL thoughts with FULL content at each level.**

Read and strictly follow: `~/.claude/tot/OUTPUT_FORMAT.md`

## 🚀 STEP 0: MODE SELECTION (Execute FIRST)

**Select execution mode based on user request:**

1. **User forced Claude-Only** (`-c` flag)? → Go to **Step 1A**
2. **Otherwise** → Attempt **Hybrid Mode** (Step 1B)
   - Codex MCP call happens automatically in Phase 2
   - Auto-fallback to Claude if Codex fails
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
Use `mcp__codex__codex` tool for direct Codex integration. See `~/.claude/tot/core/codex-mcp-integration.md`

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
