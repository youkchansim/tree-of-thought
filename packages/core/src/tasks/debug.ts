/**
 * Debug Task for Tree of Thoughts
 */

import { BaseTask } from './base.js';
import { createTaskConfig, createToTArgs } from '../types/index.js';
import type { TaskConfig } from '../types/index.js';

export class DebugTask extends BaseTask {
  constructor() {
    const config: TaskConfig = createTaskConfig({
      taskType: 'debug',
      steps: 4,
      stepNames: ['원인 분석', '검증 방법', '수정 방안', '테스트 계획'],
      defaultArgs: createToTArgs({
        nGenerate: 5,
        nEvaluate: 3,
        nSelect: 3,
        algorithm: 'BFS',
        ratio: '6:4', // Claude priority for practicality
      }),
      promptTemplates: {
        step_0: '다음 버그의 가능한 원인을 분석하세요:\n{problem}',
        step_1: '다음 원인을 검증할 방법을 제안하세요:\n{cause}',
        step_2: '다음 원인을 수정하는 방안을 제시하세요:\n{cause}',
        step_3: '다음 수정을 테스트할 계획을 작성하세요:\n{fix}',
      },
    });

    super(config);
  }

  generateProposalPrompt(problem: string, currentState: string): string {
    return `문제: ${problem}\n\n현재 상태: ${currentState}\n\n다음 단계의 해결 방안을 제시하세요:`;
  }

  generateValuePrompt(problem: string, thought: string): string {
    return `문제: ${problem}\n\n제안: ${thought}\n\n이 제안의 타당성을 0-10점으로 평가하세요:`;
  }

  generateVotePrompt(problem: string, thoughts: string[]): string {
    const thoughtList = thoughts
      .map((t, i) => `${i + 1}. ${t}`)
      .join('\n');
    return `문제: ${problem}\n\n제안들:\n${thoughtList}\n\n가장 좋은 제안부터 순위를 매기세요:`;
  }

  parseValueOutput(response: string): number {
    const match = response.match(/(\d+(\.\d+)?)\s*\/?\s*10/);
    return match ? parseFloat(match[1]) : 5.0;
  }

  parseVoteOutput(response: string): number[] {
    // Simple parsing - extract numbers
    const numbers = response.match(/\d+/g);
    return numbers ? numbers.map((n) => parseInt(n, 10) - 1) : [];
  }
}
