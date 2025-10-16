/**
 * BFS Algorithm Tests
 */

import { describe, it, expect } from 'vitest';
import { executeBFS } from './bfs.js';
import { MockThoughtGenerator } from '../generators/mock.js';
import { DebugTask } from '../tasks/debug.js';

describe('executeBFS', () => {
  it('should complete search successfully', async () => {
    const task = new DebugTask();
    const generator = new MockThoughtGenerator();
    const problem = 'Test problem';

    const result = await executeBFS(problem, task.config, generator);

    expect(result.bestThought).toBeDefined();
    expect(result.path.length).toBeGreaterThan(0);
    expect(result.allThoughts.length).toBeGreaterThan(0);
  });

  it('should perform level-by-level exploration', async () => {
    const task = new DebugTask();
    const generator = new MockThoughtGenerator();
    const problem = 'Test problem';

    const result = await executeBFS(problem, task.config, generator);

    // Check depth progression
    const depths = result.allThoughts.map(t => t.depth);
    const uniqueDepths = [...new Set(depths)].sort();

    // Should have sequential depths (0, 1, 2, ...)
    expect(uniqueDepths).toEqual([0, 1, 2]);
  });

  it('should stop early when confidence threshold is met', async () => {
    const task = new DebugTask();
    // Lower threshold for testing
    task.config.defaultArgs.confidenceThreshold = 5.0;
    const generator = new MockThoughtGenerator();
    const problem = 'Test problem';

    const result = await executeBFS(problem, task.config, generator);

    expect(result.metadata.stoppedEarly).toBe(true);
  });

  it('should select top-k thoughts at each level', async () => {
    const task = new DebugTask();
    const generator = new MockThoughtGenerator();
    const problem = 'Test problem';

    const result = await executeBFS(problem, task.config, generator);

    // At each depth (except final), selected thoughts should be <= nSelect
    const thoughtsByDepth = result.allThoughts.reduce((acc, t) => {
      acc[t.depth] = (acc[t.depth] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // First level should have exactly nGenerate thoughts
    expect(thoughtsByDepth[0]).toBe(task.config.defaultArgs.nGenerate);
  });

  it('should extract correct path to best thought', async () => {
    const task = new DebugTask();
    const generator = new MockThoughtGenerator();
    const problem = 'Test problem';

    const result = await executeBFS(problem, task.config, generator);

    // Path should end with bestThought
    const lastInPath = result.path[result.path.length - 1];
    expect(lastInPath.id).toBe(result.bestThought.id);

    // Path should be connected (each thought's parent is previous)
    for (let i = 1; i < result.path.length; i++) {
      const parent = result.path[i - 1];
      const child = result.path[i];
      expect(child.parentId).toBe(parent.id);
    }
  });
});
