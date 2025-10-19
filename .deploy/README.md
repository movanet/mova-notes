# Auto-Deploy System

This folder contains the automatic deployment system for pushing exported HTML to GitHub and Netlify.

## How It Works

1. **File Watcher** (`auto-deploy.js`): Monitors the `dist/` folder for changes
2. **Smart Deploy**: Only deploys if files actually changed (prevents duplicate commits)
3. **Auto-Start**: The Obsidian plugin automatically starts the watcher when you open the vault
4. **Notifications**: Shows Obsidian notices when deployment succeeds or fails

## Files

- `auto-deploy.js` - Main watcher script
- `package.json` - Node.js dependencies
- `start.bat` - Start the watcher
- `stop.bat` - Stop the watcher
- `restart.bat` - Restart the watcher
- `logs/` - Deployment logs
  - `deploy.log` - Successful deployments
  - `deploy-errors.log` - Error details

## Usage

### Automatic (Recommended)

The watcher starts automatically when you open the vault in Obsidian. No manual intervention needed!

### Manual Control

You can also manually control the watcher using:

1. **Obsidian Commands** (Ctrl/Cmd + P):
   - "Start deployment watcher"
   - "Stop deployment watcher"
   - "Restart deployment watcher"

2. **Batch Scripts**:
   - Double-click `start.bat` to start
   - Double-click `stop.bat` to stop
   - Double-click `restart.bat` to restart

## Workflow

1. Export your vault in Obsidian (webpage HTML export plugin)
2. Watcher detects changes in `dist/` folder (after 3 second debounce)
3. Checks if files actually changed using `git diff`
4. If changed:
   - Commits changes with timestamp
   - Pushes to GitHub
   - Netlify automatically deploys
5. Shows notification in Obsidian

## Logs

- **Success logs**: `.deploy/logs/deploy.log`
- **Error logs**: `.deploy/logs/deploy-errors.log`

## Troubleshooting

### Watcher not starting

1. Check if Node.js is installed: `node --version`
2. Check if dependencies are installed: `cd .deploy && npm install`
3. Check logs in `.deploy/logs/deploy-errors.log`

### Notifications not showing

1. Make sure the "Auto Deploy to Netlify" plugin is enabled in Obsidian
2. Check Settings → Community Plugins

### Duplicate deploys

The system automatically prevents duplicate deploys by checking `git diff`. If you see duplicates, check the logs.

## Portability

This system works across different PCs:

- All paths are relative (no hardcoded paths)
- Auto-starts when vault opens
- Checks if already running (no duplicates)
- Works on any Windows machine with Node.js installed
