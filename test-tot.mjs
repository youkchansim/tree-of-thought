#!/usr/bin/env node

/**
 * ToT Framework Test Script
 *
 * Tests the core ToT functionality with MockThoughtGenerator
 */

import { executeBFS, MockThoughtGenerator, DebugTask } from './packages/core/dist/index.js';

async function main() {
  console.log('🌳 Testing Tree of Thought Framework\n');

  // Problem: Review @tot/cli package
  const problem = `Review @tot/cli package for npm publish readiness:
- package.json completeness
- install script reliability
- documentation quality
- security considerations
- npm ecosystem best practices`;

  console.log('📋 Problem:');
  console.log(problem);
  console.log('\n' + '='.repeat(60) + '\n');

  // Setup
  const task = new DebugTask();
  const generator = new MockThoughtGenerator();
  const args = task.config.defaultArgs;

  console.log('⚙️  Configuration:');
  console.log(`   - Algorithm: ${args.algorithm}`);
  console.log(`   - Generate: ${args.nGenerate} thoughts per level`);
  console.log(`   - Evaluate: ${args.nEvaluate} times per thought`);
  console.log(`   - Select: ${args.nSelect} best thoughts`);
  console.log(`   - Ratio: ${args.ratio} (Claude:Codex)`);
  console.log(`   - Max Depth: ${args.maxDepth}`);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    console.log('🚀 Starting BFS search...\n');
    const result = await executeBFS(problem, task.config, generator);

    console.log('✅ Search Complete!\n');
    console.log('📊 Results:');
    console.log(`   - Total thoughts generated: ${result.allThoughts.length}`);
    console.log(`   - Search depth reached: ${result.path.length}`);
    const bestEval = result.evaluations[result.bestThought.id];
    console.log(`   - Best thought score: ${bestEval.overallScore.toFixed(2)}`);
    console.log('\n' + '='.repeat(60) + '\n');

    console.log('🎯 Best Solution:');
    console.log(`   ID: ${result.bestThought.id}`);
    console.log(`   Text: ${result.bestThought.text}`);
    console.log(`   Model: ${result.bestThought.model}`);
    console.log(`   Depth: ${result.bestThought.depth}`);
    console.log(`   Score: ${bestEval.overallScore.toFixed(2)}`);
    console.log('\n' + '='.repeat(60) + '\n');

    console.log('📈 Search Path:');
    result.path.forEach((thought, index) => {
      const eval_ = result.evaluations[thought.id];
      const score = eval_ ? eval_.overallScore.toFixed(2) : 'N/A';
      console.log(`   ${index + 1}. [${thought.model}] ${thought.text} (score: ${score})`);
    });

    console.log('\n✅ ToT Framework is working correctly!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
