#!/usr/bin/env node

/**
 * Auto-Deploy Watcher v2.0
 * Watches docs/ folder and auto-commits/pushes changes to GitHub
 * Part of the hybrid automation system with GitHub Actions
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const WATCH_DIR = path.join(__dirname, '..', 'docs');
const DEBOUNCE_MS = 3000; // 3 seconds
const LOG_FILE = path.join(__dirname, 'deploy.log');

// State
let changeTimeout = null;
let isProcessing = false;

// Logging function
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;

  console.log(logMessage);

  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');

  if (isError) {
    fs.appendFileSync(
      path.join(__dirname, 'deploy-errors.log'),
      logMessage + '\n'
    );
  }
}

// Execute git command
function gitCommand(command) {
  try {
    const output = execSync(command, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output.trim();
  } catch (error) {
    throw new Error(`Git command failed: ${error.message}\n${error.stderr || ''}`);
  }
}

// Check if there are changes to commit
function hasChanges() {
  try {
    const status = gitCommand('git status --porcelain docs/');
    return status.length > 0;
  } catch (error) {
    log(`Error checking git status: ${error.message}`, true);
    return false;
  }
}

// Deploy changes
async function deploy() {
  if (isProcessing) {
    log('Already processing, skipping...');
    return;
  }

  isProcessing = true;

  try {
    log('Starting deployment process...');

    // Check if there are actual changes
    if (!hasChanges()) {
      log('No changes detected, skipping deployment');
      isProcessing = false;
      return;
    }

    // Get list of changed files
    const changedFiles = gitCommand('git status --porcelain docs/')
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 5); // Show first 5 files

    log(`Changes detected in ${changedFiles.length} file(s):`);
    changedFiles.forEach(file => log(`  ${file}`));

    // Add all changes in docs/
    log('Adding changes to git...');
    gitCommand('git add docs/');

    // Create commit with timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2');

    const commitMessage = `Auto-deploy: ${timestamp}`;

    log(`Creating commit: "${commitMessage}"`);
    gitCommand(`git commit -m "${commitMessage}"`);

    // Push to GitHub
    log('Pushing to GitHub...');
    gitCommand('git push origin master');

    log('Deployment successful! GitHub Actions will now deploy to Pages.');
    log('---');

  } catch (error) {
    log(`Deployment failed: ${error.message}`, true);
    log('---');
  } finally {
    isProcessing = false;
  }
}

// Handle file changes
function handleChange(eventType, filePath) {
  // Clear existing timeout
  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }

  // Set new timeout for debouncing
  changeTimeout = setTimeout(() => {
    log(`Change detected (${eventType}): ${path.relative(WATCH_DIR, filePath)}`);
    deploy();
  }, DEBOUNCE_MS);
}

// Main
function main() {
  log('='.repeat(60));
  log('Auto-Deploy Watcher v2.0 Started');
  log(`Watching: ${WATCH_DIR}`);
  log(`Debounce: ${DEBOUNCE_MS}ms`);
  log('='.repeat(60));

  // Verify docs/ folder exists
  if (!fs.existsSync(WATCH_DIR)) {
    log(`ERROR: Watch directory does not exist: ${WATCH_DIR}`, true);
    process.exit(1);
  }

  // Verify git repository
  try {
    gitCommand('git status');
  } catch (error) {
    log('ERROR: Not a git repository or git is not configured', true);
    process.exit(1);
  }

  // Initialize watcher
  const watcher = chokidar.watch(WATCH_DIR, {
    ignored: [
      /(^|[\/\\])\../, // ignore dotfiles
      /node_modules/,
      /\.log$/
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    }
  });

  // Watch for changes
  watcher
    .on('add', (filePath) => handleChange('add', filePath))
    .on('change', (filePath) => handleChange('change', filePath))
    .on('unlink', (filePath) => handleChange('unlink', filePath))
    .on('error', (error) => log(`Watcher error: ${error}`, true))
    .on('ready', () => log('Initial scan complete. Ready for changes.'));

  // Handle process termination
  process.on('SIGINT', () => {
    log('Received SIGINT, shutting down gracefully...');
    watcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down gracefully...');
    watcher.close();
    process.exit(0);
  });
}

// Start the watcher
main();
