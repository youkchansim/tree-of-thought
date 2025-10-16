/**
 * Example: Claude Code CLI Task Tool Integration
 *
 * This is a REFERENCE IMPLEMENTATION for integrating with Claude Code CLI.
 * Copy and modify this file according to your environment.
 *
 * IMPORTANT: This file is NOT imported by default to avoid runtime dependencies.
 */

import type { ThoughtGenerator } from './base.js';
import type { Thought, ToTArgs } from '../types/index.js';
import { createThought, getClaudeCount, getCodexCount } from '../types/index.js';

/**
 * Example implementation using Claude Code CLI Task tool
 *
 * Usage:
 * 1. Copy this file to your project
 * 2. Implement the actual Task tool integration
 * 3. Use it with BFS/DFS algorithms
 */
export class ClaudeCodeThoughtGenerator implements ThoughtGenerator {
  constructor(private taskGenerator: TaskGeneratorFunction) {}

  async generate(
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]> {
    const nGenerate = args.nGenerate;
    const claudeCount = getClaudeCount(args.ratio, nGenerate);
    const codexCount = getCodexCount(args.ratio, nGenerate);

    const thoughts: Thought[] = [];
    const parentId = currentThoughts.length > 0 ? currentThoughts[0].id : null;

    // Generate Claude thoughts
    if (claudeCount > 0) {
      const claudeThoughts = await this.generateWithModel(
        'claude',
        problem,
        currentThoughts,
        depth,
        claudeCount,
        parentId
      );
      thoughts.push(...claudeThoughts);
    }

    // Generate Codex thoughts
    if (codexCount > 0) {
      const codexThoughts = await this.generateWithModel(
        'codex',
        problem,
        currentThoughts,
        depth,
        codexCount,
        parentId
      );
      thoughts.push(...codexThoughts);
    }

    return thoughts;
  }

  private async generateWithModel(
    model: 'claude' | 'codex',
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    count: number,
    parentId: string | null
  ): Promise<Thought[]> {
    const prompt = this.buildPrompt(problem, currentThoughts, depth);

    // Example: Call Task tool via your integration
    // const response = await this.taskGenerator({
    //   model,
    //   prompt,
    //   count,
    // });

    // For now, this is a stub showing the expected structure
    const response = await this.taskGenerator({
      model,
      prompt,
      count,
    });

    return response.thoughts.map((text: string, index: number) =>
      createThought({
        id: `${model}-${depth}-${index}-${Date.now()}`,
        text,
        model,
        depth,
        parentId,
      })
    );
  }

  private buildPrompt(
    problem: string,
    currentThoughts: Thought[],
    depth: number
  ): string {
    if (currentThoughts.length === 0) {
      return `문제: ${problem}\n\n이 문제를 해결하기 위한 첫 번째 단계의 접근 방법을 제시하세요.`;
    }

    const currentState = currentThoughts
      .map((t, i) => `${i + 1}. ${t.text}`)
      .join('\n');

    return `문제: ${problem}\n\n현재까지의 접근:\n${currentState}\n\n다음 단계로 어떻게 진행할지 제안하세요.`;
  }
}

/**
 * Type definition for Task tool integration function
 */
type TaskGeneratorFunction = (params: {
  model: 'claude' | 'codex';
  prompt: string;
  count: number;
}) => Promise<{
  thoughts: string[];
}>;

/**
 * Example factory function
 */
export function createClaudeCodeGenerator(
  taskFn: TaskGeneratorFunction
): ThoughtGenerator {
  return new ClaudeCodeThoughtGenerator(taskFn);
}
