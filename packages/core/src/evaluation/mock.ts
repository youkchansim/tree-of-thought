/**
 * Mock Evaluator for Testing
 *
 * Provides deterministic evaluation without requiring actual AI model integration
 */

/**
 * Mock evaluation function for testing
 *
 * Generates semi-random but deterministic scores based on thought characteristics
 */
export async function mockEvaluateSingleThought(
  problem: string,
  thoughtText: string,
  thoughtModel: 'claude' | 'codex',
  thoughtDepth: number,
  _evaluatorModel: 'claude' | 'openai'
): Promise<number> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Generate deterministic score based on thought characteristics
  let baseScore = 5.0;

  // Depth penalty (deeper thoughts slightly lower score to simulate difficulty)
  baseScore -= thoughtDepth * 0.3;

  // Model bonus (simulate different model strengths)
  if (thoughtModel === 'claude') {
    baseScore += 0.5; // Claude slightly better for practical problems
  }

  // Problem complexity factor
  const problemLength = problem.length;
  if (problemLength > 100) {
    baseScore += 0.5; // Reward comprehensive problem understanding
  }

  // Text length factor (longer thoughts might be more thorough)
  const textLength = thoughtText.length;
  if (textLength > 30) {
    baseScore += 0.3;
  }

  // Add some pseudo-random variation based on text hash
  const hash = hashString(thoughtText);
  const variation = (hash % 20) / 10 - 1.0; // -1.0 to +1.0
  baseScore += variation;

  // Clamp to 0-10 range
  return Math.max(0, Math.min(10, baseScore));
}

/**
 * Simple string hash function for deterministic variation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Mock vote rankings for testing
 *
 * Returns rankings based on simple heuristics
 */
export async function mockGetVoteRankings(
  _problem: string,
  thoughts: Array<{ text: string; model: string; depth: number }>,
  _evaluatorModel: 'claude' | 'openai'
): Promise<number[]> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Score each thought
  const scores = thoughts.map((thought, index) => {
    const hash = hashString(thought.text);
    const score = (hash % 100) / 10; // 0-10
    return { index, score };
  });

  // Sort by score (descending) and return indices
  scores.sort((a, b) => b.score - a.score);
  return scores.map((s) => s.index);
}
