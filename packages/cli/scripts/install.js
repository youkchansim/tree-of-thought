#!/usr/bin/env node

/**
 * @tot/cli Installation Script
 *
 * Installs /tot command to ~/.claude/commands directory
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

function main() {
  try {
    log('\n🌳 Installing Tree of Thought commands...', 'cyan');

    // Define paths
    const homeDir = os.homedir();
    const targetDir = path.join(homeDir, '.claude', 'commands');
    const sourceDir = path.join(__dirname, '..', 'commands');

    // Verify source directory exists
    if (!fs.existsSync(sourceDir)) {
      log('❌ Source commands directory not found', 'red');
      log(`   Expected: ${sourceDir}`, 'red');
      process.exit(1);
    }

    // Create target directory if it doesn't exist
    log(`📁 Target directory: ${targetDir}`, 'cyan');
    fs.mkdirSync(targetDir, { recursive: true });

    // Get all command files
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
      log('⚠️  No command files found', 'yellow');
      process.exit(0);
    }

    // Copy each command file
    let installedCount = 0;
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      try {
        fs.copyFileSync(sourcePath, targetPath);
        const commandName = path.basename(file, '.md');
        log(`   ✓ Installed: /${commandName}`, 'green');
        installedCount++;
      } catch (error) {
        log(`   ✗ Failed to install ${file}: ${error.message}`, 'red');
      }
    });

    // Summary
    log(`\n✅ Installation complete!`, 'green');
    log(`   ${installedCount} command(s) installed`, 'green');
    log(`\nUsage:`, 'cyan');
    log(`   Open Claude Code and type: /tot "your problem"`, 'cyan');
    log(`\nDocumentation:`, 'cyan');
    log(`   https://github.com/youkchansim/tree-of-thought\n`, 'cyan');

  } catch (error) {
    log('\n❌ Installation failed:', 'red');
    log(`   ${error.message}`, 'red');
    log('\nPlease report this issue at:', 'yellow');
    log('   https://github.com/youkchansim/tree-of-thought/issues\n', 'yellow');
    process.exit(1);
  }
}

// Run installation
main();
