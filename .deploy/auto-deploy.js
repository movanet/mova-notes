const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths (relative to script location for portability)
const VAULT_ROOT = path.join(__dirname, '..');
const DIST_FOLDER = path.join(VAULT_ROOT, 'docs');
const LOG_FOLDER = path.join(__dirname, 'logs');
const DEPLOY_LOG = path.join(LOG_FOLDER, 'deploy.log');
const ERROR_LOG = path.join(LOG_FOLDER, 'deploy-errors.log');
const STATUS_FILE = path.join(VAULT_ROOT, '.obsidian', 'plugins', 'auto-deploy', 'status.json');
const PID_FILE = path.join(__dirname, 'watcher.pid');

// Ensure log folder exists
if (!fs.existsSync(LOG_FOLDER)) {
  fs.mkdirSync(LOG_FOLDER, { recursive: true });
}

// Ensure status folder exists
const statusDir = path.dirname(STATUS_FILE);
if (!fs.existsSync(statusDir)) {
  fs.mkdirSync(statusDir, { recursive: true });
}

// Write PID file for duplicate detection
fs.writeFileSync(PID_FILE, process.pid.toString());

// Helper: Format timestamp
function timestamp() {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

// Helper: Log to file
function log(message, isError = false) {
  const logFile = isError ? ERROR_LOG : DEPLOY_LOG;
  const logMessage = `[${timestamp()}] ${message}\n`;

  console.log(logMessage.trim());

  try {
    fs.appendFileSync(logFile, logMessage);

    // Keep logs under 100 entries
    if (!isError) {
      const lines = fs.readFileSync(logFile, 'utf8').split('\n');
      if (lines.length > 100) {
        fs.writeFileSync(logFile, lines.slice(-100).join('\n'));
      }
    }
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

// Helper: Write status for Obsidian plugin
function writeStatus(status, message, error = null) {
  const statusData = {
    status,
    message,
    timestamp: timestamp(),
    error: error ? error.toString() : null
  };

  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(statusData, null, 2));
  } catch (err) {
    log(`Failed to write status file: ${err}`, true);
  }
}

// Helper: Execute shell command
function runCommand(command, cwd = VAULT_ROOT) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// Check if docs/ has changes compared to last commit
async function hasChanges() {
  try {
    await runCommand('git diff --quiet HEAD -- docs/');
    return false; // No changes
  } catch (err) {
    return true; // Has changes
  }
}

// Deploy function
async function deploy() {
  log('🔍 Checking for changes in docs/...');

  try {
    // Check if there are actual changes
    const changed = await hasChanges();

    if (!changed) {
      log('⏭️  No changes detected, skipping deploy');
      writeStatus('skipped', 'No changes to deploy');
      return;
    }

    log('📦 Changes detected, preparing deployment...');
    writeStatus('deploying', 'Deploying changes...');

    // Stage changes
    await runCommand('git add docs/');
    log('✓ Staged docs/ folder');

    // Commit
    const commitMessage = `Auto-deploy: ${timestamp()}`;
    await runCommand(`git commit -m "${commitMessage}"`);
    log(`✓ Created commit: ${commitMessage}`);

    // Push to GitHub
    log('🚀 Pushing to GitHub...');
    await runCommand('git push origin master');
    log('✓ Pushed to GitHub');

    // Success!
    const successMsg = `✅ Successfully deployed to notes.alafghani.info`;
    log(successMsg);
    writeStatus('success', successMsg);

  } catch (err) {
    const errorMsg = `Deploy failed: ${err.error || err.stderr || err}`;
    log(errorMsg, true);
    log(`Error details: ${JSON.stringify(err, null, 2)}`, true);
    writeStatus('error', errorMsg, err);
  }
}

// Debounce timer
let deployTimer = null;
const DEBOUNCE_MS = 3000;

function scheduleDeploy() {
  if (deployTimer) {
    clearTimeout(deployTimer);
  }

  deployTimer = setTimeout(() => {
    deploy();
  }, DEBOUNCE_MS);
}

// Start watching
log('👀 Auto-deploy watcher started');
log(`📁 Watching: ${DIST_FOLDER}`);
writeStatus('running', 'Watcher is running');

const watcher = chokidar.watch(DIST_FOLDER, {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  persistent: true,
  ignoreInitial: true, // Don't trigger on startup
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100
  }
});

watcher
  .on('add', (filePath) => {
    log(`📄 File added: ${path.basename(filePath)}`);
    scheduleDeploy();
  })
  .on('change', (filePath) => {
    log(`📝 File changed: ${path.basename(filePath)}`);
    scheduleDeploy();
  })
  .on('unlink', (filePath) => {
    log(`🗑️  File deleted: ${path.basename(filePath)}`);
    scheduleDeploy();
  })
  .on('error', (error) => {
    log(`Watcher error: ${error}`, true);
    writeStatus('error', 'Watcher encountered an error', error);
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Shutting down watcher...');
  watcher.close();
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Shutting down watcher...');
  watcher.close();
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
  process.exit(0);
});
