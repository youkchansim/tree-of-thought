#!/usr/bin/env node

/**
 * tree-of-thought-cli Installation Script
 *
 * Installs /tot command and documentation to ~/.claude directory
 * This runs automatically after npm install
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function copyDirectory(source, target) {
  // Create target directory
  fs.mkdirSync(target, { recursive: true });

  // Read source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  let fileCount = 0;
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

      // Recursively copy subdirectories
      fileCount += copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Copy only .md files
      fs.copyFileSync(sourcePath, targetPath);
      fileCount++;
    }
  }

  return fileCount;
}

function main() {
  try {
    log('\n🌳 Installing Tree of Thought framework...', 'cyan');

    const homeDir = os.homedir();
    // When installed via npm, __dirname is: <npm-prefix>/lib/node_modules/tree-of-thought-cli/scripts
    // So packageRoot should be one level up
    const packageRoot = path.join(__dirname, '..');

    // Installation tasks
    const tasks = [
      {
        name: 'Command',
        source: path.join(packageRoot, 'commands'),
        target: path.join(homeDir, '.claude', 'commands'),
      },
      {
        name: 'Core Documentation',
        source: path.join(packageRoot, 'docs', 'guide', 'core'),
        target: path.join(homeDir, '.claude', 'tot', 'core'),
      },
      {
        name: 'Templates',
        source: path.join(packageRoot, 'docs', 'guide', 'templates'),
        target: path.join(homeDir, '.claude', 'tot', 'templates'),
      },
      {
        name: 'Examples',
        source: path.join(packageRoot, 'docs', 'examples'),
        target: path.join(homeDir, '.claude', 'tot', 'examples'),
      }
    ];

    let totalInstalled = 0;

    // Execute each task
    for (const task of tasks) {
      log(`\n📁 Installing ${task.name}...`, 'cyan');

      if (!fs.existsSync(task.source)) {
        log(`   ⚠️  Source not found: ${task.source}`, 'yellow');
        continue;
      }

      // Copy files
      const fileCount = copyDirectory(task.source, task.target);

      if (fileCount > 0) {
        log(`   ✓ Installed ${fileCount} file(s)`, 'green');
        totalInstalled += fileCount;
      } else {
        log(`   ⚠️  No files found`, 'yellow');
      }
    }

    // Copy root documentation
    log(`\n📁 Installing root documentation...`, 'cyan');
    const totRoot = path.join(homeDir, '.claude', 'tot');
    fs.mkdirSync(totRoot, { recursive: true });

    const rootDocs = [
      { file: 'OUTPUT_FORMAT.md', source: path.join(packageRoot, 'docs', 'OUTPUT_FORMAT.md') },
      { file: 'README.md', source: path.join(packageRoot, 'README.md') }
    ];

    for (const doc of rootDocs) {
      if (fs.existsSync(doc.source)) {
        fs.copyFileSync(doc.source, path.join(totRoot, doc.file));
        log(`   ✓ Installed ${doc.file}`, 'green');
        totalInstalled++;
      }
    }

    // Summary
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`✅ Installation complete!`, 'green');
    log(`   ${totalInstalled} file(s) installed`, 'green');
    log(`\nInstalled locations:`, 'cyan');
    log(`   ~/.claude/commands/tot.md`, 'cyan');
    log(`   ~/.claude/tot/core/ (algorithm guides)`, 'cyan');
    log(`   ~/.claude/tot/templates/ (problem templates)`, 'cyan');
    log(`   ~/.claude/tot/examples/ (usage examples)`, 'cyan');
    log(`\nUsage:`, 'cyan');
    log(`   Open Claude Code and type: /tot "your problem"`, 'cyan');
    log(`\nDocumentation:`, 'cyan');
    log(`   https://github.com/youkchansim/tree-of-thought`, 'cyan');
    log(`${'='.repeat(60)}\n`, 'cyan');

  } catch (error) {
    log('\n❌ Installation failed:', 'red');
    log(`   ${error.message}`, 'red');
    log(`   ${error.stack}`, 'red');
    log('\nPlease report this issue at:', 'yellow');
    log('   https://github.com/youkchansim/tree-of-thought/issues\n', 'yellow');
    process.exit(1);
  }
}

// Run installation
main();
