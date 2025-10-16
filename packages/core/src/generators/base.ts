/**
 * Thought Generator Interface
 */

import type { Thought, ToTArgs } from '../types/index.js';

export interface ThoughtGenerator {
  generate(
    problem: string,
    currentThoughts: Thought[],
    depth: number,
    args: ToTArgs
  ): Promise<Thought[]>;
}
