/**
 * Base Task Interface for Tree of Thoughts
 */

import type { TaskConfig, ToTArgs, Thought } from '../types/index.js';
import { createTaskConfig, createToTArgs } from '../types/index.js';

/**
 * Abstract base task
 */
export abstract class BaseTask {
  constructor(public config: TaskConfig) {}

  /**
   * Generate prompt for thought generation
   */
  abstract generateProposalPrompt(
    problem: string,
    currentState: string
  ): string;

  /**
   * Generate prompt for value evaluation
   */
  abstract generateValuePrompt(problem: string, thought: string): string;

  /**
   * Generate prompt for vote evaluation
   */
  abstract generateVotePrompt(problem: string, thoughts: string[]): string;

  /**
   * Parse value evaluation response to score
   */
  abstract parseValueOutput(response: string): number;

  /**
   * Parse vote response to rankings
   */
  abstract parseVoteOutput(response: string): number[];
}
