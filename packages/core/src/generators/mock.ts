/**
 * Mock Thought Generator for Testing
 */

import type { ThoughtGenerator } from './base.js';
import type { Thought, ToTArgs } from '../types/index.js';
import { createThought, getClaudeCount, getCodexCount } from '../types/index.js';

export class MockThoughtGenerator implements ThoughtGenerator {
  private thoughtCounter = 0;

  async generate(
    _problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]> {
    const claudeCount = getClaudeCount(args);
    const codexCount = getCodexCount(args);

    const thoughts: Thought[] = [];

    const parentId = currentThoughts.length > 0 ? currentThoughts[0].id : null;

    // Generate Claude thoughts
    for (let i = 0; i < claudeCount; i++) {
      thoughts.push(
        createThought({
          id: `mock-thought-${this.thoughtCounter++}`,
          text: `Mock Claude thought ${i + 1} at depth ${depth}`,
          model: 'claude',
          depth,
          parentId,
        })
      );
    }

    // Generate Codex thoughts
    for (let i = 0; i < codexCount; i++) {
      thoughts.push(
        createThought({
          id: `mock-thought-${this.thoughtCounter++}`,
          text: `Mock Codex thought ${i + 1} at depth ${depth}`,
          model: 'codex',
          depth,
          parentId,
        })
      );
    }

    return thoughts;
  }
}
