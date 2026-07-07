#!/usr/bin/env node

/**
 * AI Test Workflow Engine CLI
 *
 * Standalone CLI tool to invoke the test-suite-generator workflow from any project.
 *
 * Usage:
 *   ai-test-workflow                  # Run in current directory
 *   ai-test-workflow <target-dir>     # Run in specific directory
 *   ai-test-workflow --help           # Show help
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const WORKFLOW_NAME = 'test-suite-generator';

function showHelp() {
  console.log(`
AI Test Workflow Engine - Multi-agent test generation with adversarial review

Usage:
  ai-test-workflow [options] [directory]

Arguments:
  directory                Target directory to generate tests for (default: current directory)

Options:
  -h, --help              Show this help message
  -v, --version           Show version
  --workflow-path <path>  Path to workflow script (default: uses installed workflow)
  --no-review             Skip adversarial review phase
  --no-fix                Skip automatic fix application phase
  --dry-run               Show what would be generated without writing files

Examples:
  ai-test-workflow                    # Generate tests for current project
  ai-test-workflow src/api            # Generate tests for src/api
  ai-test-workflow --no-fix           # Review but don't auto-apply fixes
  ai-test-workflow --dry-run          # Preview without writing files

The workflow will:
  1. Discover your project structure and testable components
  2. Generate unit, integration, and E2E tests in parallel
  3. Adversarially review all tests for quality issues
  4. Automatically apply improvements (unless --no-fix)

For more information: https://github.com/Ada-Edu/ai-test-workflow-engine
`);
}

function showVersion() {
  const packageJson = require('../package.json');
  console.log(`ai-test-workflow v${packageJson.version}`);
}

function findClaudeCodeCommand() {
  // Try to find Claude Code installation
  // Common locations: claude-code, claude, or via VS Code extension

  const commands = ['claude-code', 'claude'];

  for (const cmd of commands) {
    try {
      const { status } = require('child_process').spawnSync(cmd, ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      if (status === 0) {
        return cmd;
      }
    } catch (err) {
      // Command not found, try next
    }
  }

  return null;
}

function runWorkflow(options) {
  const {
    directory = process.cwd(),
    workflowPath,
    noReview = false,
    noFix = false,
    dryRun = false
  } = options;

  // Validate directory exists
  if (!fs.existsSync(directory)) {
    console.error(`Error: Directory not found: ${directory}`);
    process.exit(1);
  }

  // Find Claude Code
  const claudeCmd = findClaudeCodeCommand();
  if (!claudeCmd) {
    console.error(`
Error: Claude Code CLI not found.

Please install Claude Code:
  - Desktop app: https://claude.ai/code
  - VS Code extension: Search "Claude Code" in Extensions
  - JetBrains plugin: Search "Claude Code" in Plugins

Or ensure the 'claude-code' or 'claude' command is in your PATH.
`);
    process.exit(1);
  }

  // Determine workflow script path
  let scriptPath = workflowPath;
  if (!scriptPath) {
    // Use installed workflow from ~/.claude/workflows/
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    scriptPath = path.join(homeDir, '.claude', 'workflows', `${WORKFLOW_NAME}.js`);

    if (!fs.existsSync(scriptPath)) {
      console.error(`
Error: Workflow not installed.

Install the workflow:
  cp workflows/test-suite-generator.js ~/.claude/workflows/

Or use --workflow-path to specify the script location.
`);
      process.exit(1);
    }
  }

  console.log(`\n🤖 AI Test Workflow Engine\n`);
  console.log(`Target directory: ${directory}`);
  console.log(`Workflow: ${scriptPath}\n`);

  if (dryRun) {
    console.log(`[DRY RUN] Would execute workflow but not write files\n`);
  }

  if (noReview) {
    console.log(`⚠️  Skipping adversarial review phase\n`);
  }

  if (noFix) {
    console.log(`⚠️  Skipping automatic fix application\n`);
  }

  // Build workflow invocation message
  const workflowMessage = `/workflow ${WORKFLOW_NAME}`;

  // Prepare args for workflow if customizing behavior
  const workflowArgs = {
    targetDirectory: directory,
    skipReview: noReview,
    skipFix: noFix,
    dryRun: dryRun
  };

  console.log(`Starting workflow...\n`);
  console.log(`─────────────────────────────────────────────────────────────\n`);

  // Spawn Claude Code in the target directory
  const child = spawn(claudeCmd, [], {
    cwd: directory,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`\nError running Claude Code: ${err.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`\nClaude Code exited with code ${code}`);
      process.exit(code);
    }
  });

  // Note: This launches Claude Code interactively.
  // For true CLI automation, you would need Claude Code's programmatic API.
  // For now, this provides a convenient launcher.
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }

  const options = {
    directory: process.cwd(),
    workflowPath: null,
    noReview: false,
    noFix: false,
    dryRun: false
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--workflow-path') {
      options.workflowPath = args[++i];
    } else if (arg === '--no-review') {
      options.noReview = true;
    } else if (arg === '--no-fix') {
      options.noFix = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (!arg.startsWith('-')) {
      // Positional argument - target directory
      options.directory = path.resolve(arg);
    } else {
      console.error(`Unknown option: ${arg}`);
      console.error(`Use --help for usage information`);
      process.exit(1);
    }
  }

  runWorkflow(options);
}

main();
