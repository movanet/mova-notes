# Auto-Deploy System v2.0

Hybrid automation system that combines local file watching with GitHub Actions for automatic deployment to GitHub Pages.

## How It Works

1. **Local Watcher** (this folder): Monitors `docs/` folder for changes
2. **Auto-Commit**: Commits changes with timestamp automatically
3. **Auto-Push**: Pushes to GitHub master branch
4. **GitHub Actions**: Deploys to GitHub Pages automatically

## Complete Workflow

```
Edit note in Obsidian
    ↓
Export with plugin (Ctrl+P → "Publish current note")
    ↓
Watcher detects change in docs/
    ↓
Auto-commit + Auto-push to GitHub
    ↓
GitHub Actions deploys to Pages
    ↓
Live at https://notes.alafghani.info in ~30 seconds
```

## Files

- `watcher.js` - Main watcher script (monitors docs/)
- `package.json` - Dependencies (chokidar)
- `start.bat` - Start the watcher
- `stop.bat` - Stop the watcher
- `deploy.log` - Deployment history
- `deploy-errors.log` - Error logs

## Usage

### Start Watcher

Double-click `start.bat` or run:

```bash
cd .autodeploy
npm install  # First time only
npm start
```

A new console window will open showing the watcher status.

### Stop Watcher

Double-click `stop.bat` or close the watcher console window.

### View Logs

```bash
# Successful deployments
cat deploy.log

# Errors
cat deploy-errors.log
```

## Configuration

The watcher monitors:
- **Directory**: `docs/` (where Obsidian plugin exports HTML)
- **Debounce**: 3 seconds (waits 3s after last change)
- **Auto-push**: Enabled (pushes to `master` branch)

## Requirements

- Node.js installed
- Git configured with authentication
- GitHub repository access

## Troubleshooting

### Watcher not starting
- Check if Node.js is installed: `node --version`
- Run `npm install` in `.autodeploy/` folder
- Check logs in `deploy-errors.log`

### Changes not pushing
- Verify git credentials are configured
- Check GitHub repository permissions
- Review `deploy-errors.log` for errors

### Multiple deployments
The watcher automatically debounces changes (3-second delay) to prevent duplicate commits.

## Integration with GitHub Actions

This watcher works together with GitHub Actions workflow (`.github/workflows/deploy-pages.yml`):

1. **Watcher** handles local automation (commit + push)
2. **GitHub Actions** handles deployment (build + deploy to Pages)

This hybrid approach provides:
- ✅ Fully automatic workflow
- ✅ Works even when PC is off (Actions)
- ✅ Clean commit history
- ✅ Deployment logs on GitHub
- ✅ Easy troubleshooting
