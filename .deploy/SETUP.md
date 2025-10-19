# Setup Guide for New PC / Portability

This guide explains how to set up the auto-deploy system on a new PC or fresh installation.

## Prerequisites

1. **Node.js** - Download and install from https://nodejs.org (LTS version recommended)
2. **Git** - Download and install from https://git-scm.com
3. **Obsidian** - Download from https://obsidian.md

## First-Time Setup on New PC

### Step 1: Clone or Copy the Vault

**Option A: Clone from GitHub** (Recommended)
```bash
git clone https://github.com/movanet/mova-notes.git obsidianpublish
cd obsidianpublish
```

**Option B: Copy vault folder**
- Copy the entire `obsidianpublish` folder to your new PC
- The vault is already a git repository

### Step 2: Install Dependencies

```bash
cd obsidianpublish/.deploy
npm install
```

This installs the `chokidar` file watcher (takes ~5 seconds).

### Step 3: Configure Git (If New PC)

```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### Step 4: Authenticate GitHub (If New PC)

```bash
# Install GitHub CLI (if not already installed)
winget install --id GitHub.cli

# Authenticate
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

### Step 5: Open Vault in Obsidian

1. Open Obsidian
2. Click "Open folder as vault"
3. Select the `obsidianpublish` folder
4. Go to **Settings** → **Community Plugins**
5. Enable **"Auto Deploy to Netlify"** plugin
6. You should see: "🚀 Auto-deploy watcher started"

### Step 6: Test the System

1. Press `Ctrl/Cmd + P` to open command palette
2. Type "Export current note and deploy"
3. Press Enter
4. You should see notifications:
   - "📝 Exporting current note..."
   - "✅ Export complete! Deploying..."
   - "✅ Successfully deployed to notes.alafghani.info"

## What Gets Synced?

When you clone/copy the vault, these files come with it:

✅ **Included** (tracked in git):
- `.deploy/` folder (scripts, package.json)
- `.obsidian/plugins/auto-deploy/` (plugin files)
- `dist/` folder (exported HTML)
- `.gitignore`
- `netlify.toml`

❌ **Not Included** (gitignored):
- `.deploy/node_modules/` - Run `npm install` to regenerate
- `.deploy/logs/` - Created automatically
- `.deploy/watcher.pid` - Created when watcher runs
- Source `.md` files - Intentionally excluded
- `.obsidian/` (except auto-deploy plugin)

## Troubleshooting

### "npm: command not found"

Install Node.js from https://nodejs.org

### "git: command not found"

Install Git from https://git-scm.com

### Watcher Won't Start

1. Check Node.js is installed: `node --version`
2. Install dependencies: `cd .deploy && npm install`
3. Manually start: Double-click `.deploy/start.bat`
4. Check logs: `.deploy/logs/deploy-errors.log`

### Git Push Fails (Authentication)

1. Install GitHub CLI: `winget install --id GitHub.cli`
2. Authenticate: `gh auth login`
3. Follow the prompts

## Portable Setup (USB Drive / Cloud Sync)

The system is designed to be portable! You can:

1. **Put vault in cloud storage** (OneDrive, Google Drive, Dropbox)
   - All scripts use relative paths
   - Works across multiple PCs automatically
   - Just run `npm install` once on each PC

2. **Use USB drive**
   - Copy entire vault folder to USB
   - Run `npm install` on each PC you use it on
   - Git authentication travels with you (if using GitHub CLI)

3. **Multiple PCs workflow**
   - PC1: Make changes, export, auto-deploy ✅
   - PC2: Pull latest from GitHub: `git pull`
   - PC2: Make changes, export, auto-deploy ✅
   - Everything stays in sync!

## Quick Reference

### On ANY PC:

1. Have Node.js, Git, Obsidian installed
2. Clone/copy vault
3. Run: `cd .deploy && npm install`
4. Open vault in Obsidian
5. Enable plugin
6. Done!

### Daily Workflow:

1. Open Obsidian (watcher auto-starts)
2. Edit notes
3. Press `Ctrl/Cmd + P` → "Export current note and deploy"
4. Done! Site updates automatically

## Need Help?

Check the logs:
- **Deploy log**: `.deploy/logs/deploy.log`
- **Error log**: `.deploy/logs/deploy-errors.log`
- **Obsidian console**: `Ctrl/Cmd + Shift + I`
