# Deployment Guide for Mova's Notes

## 🚀 Quick Start (Hybrid Automation v3.0)

### ✨ New in v3.0: Fully Automated Deployment
- **Complete automation** - Export → Auto-commit → Auto-push → GitHub Actions
- **File watcher** - Monitors docs/ folder automatically
- **GitHub Actions** - Deploys to Pages on every push
- **Zero manual steps** - Just export in Obsidian, everything else is automatic

### 🎯 How It Works

```
Edit note in Obsidian
    ↓
Ctrl+P → "Publish current note"
    ↓
Plugin exports to docs/
    ↓
Watcher detects change (3s delay)
    ↓
Auto-commit with timestamp
    ↓
Auto-push to GitHub
    ↓
GitHub Actions deploys to Pages
    ↓
Live at https://notes.alafghani.info (~30 seconds)
```

### Setup (One-Time)

**Step 1: Configure Obsidian Plugin**

1. **Get a GitHub Personal Access Token:**
   - Go to https://github.com/settings/tokens/new
   - Give it a name: "Obsidian Publisher"
   - Expiration: 1 year (or custom)
   - Permissions needed:
     - `repo` (Full control of private repositories) ✓
   - Click "Generate token"
   - **Copy the token** (you'll only see it once!)

2. **Configure the Plugin:**
   - Open Obsidian → Settings → GitHub Pages Publisher
   - Enter your GitHub details:
     - Owner: `movanet`
     - Repository: `mova-notes`
     - Branch: `master`
     - Token: (paste your token)
   - Click away to save

**Step 2: Start Auto-Deploy Watcher**

1. **Install dependencies:**
   ```bash
   cd .autodeploy
   npm install
   ```

2. **Start the watcher:**
   - Double-click `.autodeploy/start.bat`
   - Or run: `cd .autodeploy && npm start`
   - A console window will open showing watcher status

3. **Keep it running:**
   - Leave the watcher console window open while working
   - Watcher automatically commits and pushes changes to GitHub
   - GitHub Actions then deploys to Pages

**Step 3: Configure GitHub Pages (If Not Already Done)**

1. Go to: https://github.com/movanet/mova-notes/settings/pages
2. Set source: **GitHub Actions** (not branch)
3. Save changes

### Daily Usage (Fully Automated)

**To publish any note:**

1. Open a note in Obsidian
2. Press `Ctrl/Cmd + P`
3. Type: **"Publish current note to GitHub Pages"**
4. Press Enter
5. Done! ✅

**What happens automatically:**
- Plugin exports HTML to `docs/` folder
- Watcher detects change (waits 3 seconds)
- Auto-commits with timestamp: "Auto-deploy: 2025-10-28 14:30:45"
- Auto-pushes to GitHub master branch
- GitHub Actions deploys to Pages (~30 seconds)
- Site live at https://notes.alafghani.info

**No manual git commands needed!**

### Full Vault Publishing

**Publish all notes at once:**

1. Press `Ctrl/Cmd + P`
2. Type: **"Publish all exported notes to GitHub Pages"**
3. Press Enter
4. Waits for all files to upload
5. Done! ✅

### Export + Publish (Complete Workflow)

**For major updates:**

1. Press `Ctrl/Cmd + P`
2. Type: **"Export vault and publish to GitHub Pages"**
3. Press Enter
4. Waits ~10 seconds for export
5. Publishes all files to GitHub
6. Done! ✅

---

## ✨ Features

### 📱 Media Support
- ✅ **Images**: JPG, PNG, WebP, GIF, SVG
- ✅ **Audio**: MP3, WAV, OGG, M4A
- ✅ **Video**: MP4, WebM
- ✅ **Documents**: PDF
- ✅ **Embeds**: YouTube, Instagram, Twitter (via iframe)

All media files are automatically uploaded when you publish a note!

### 🎯 Smart Publishing
- **Single file** → One API call, instant update
- **Multiple files** → Batch upload with progress
- **Media included** → Automatically detects and uploads

### 🔄 Architecture (v3.0 Hybrid System)

**Three-Layer Automation:**

1. **Obsidian Plugin** (`.obsidian/plugins/auto-deploy/`)
   - Exports markdown → HTML with full features
   - Saves to `docs/` folder
   - Based on obsidian-webpage-export

2. **File Watcher** (`.autodeploy/watcher.js`)
   - Monitors `docs/` folder using chokidar
   - Auto-commits changes with timestamps
   - Auto-pushes to GitHub master branch
   - Runs as local Node.js process

3. **GitHub Actions** (`.github/workflows/deploy-pages.yml`)
   - Triggers on push to `docs/` folder
   - Updates sitemap timestamps automatically
   - Deploys to GitHub Pages
   - Provides deployment logs

**Result:** ✅ Fully automated from Obsidian to live site!

---

## 📋 Available Commands

| Command | Description | Use When |
|---------|-------------|----------|
| **Publish current note to GitHub Pages** | Single-note export + publish | Quick updates to one note |
| **Publish all exported notes to GitHub Pages** | Publish existing docs/ files | After manual export |
| **Export vault and publish to GitHub Pages** | Full export + publish | Major content updates |

---

## 🔧 Technical Details

### How Single-Note Publishing Works

```
1. User: Ctrl+P → "Publish current note"
2. Plugin: Modifies export settings → exports to docs-temp/
3. Plugin: Calls GitHub API to upload HTML file
4. GitHub: Updates docs/filename.html via PUT API
5. GitHub Pages: Auto-rebuilds and deploys (~30 seconds)
6. Plugin: Copies HTML to local docs/ for consistency
```

### GitHub API Calls Used

```javascript
// Upload/Update file
PUT /repos/{owner}/{repo}/contents/{path}
{
  content: "base64-encoded-html",
  message: "Update: filename.html",
  sha: "previous-file-sha",  // Only if updating
  branch: "master"
}
```

### File Structure

```
D:\Obsidian\obsidianpublish\
├── docs/                      # Published HTML files (GitHub Pages source)
├── docs-temp/                 # Temporary export folder (single-note)
├── .obsidian/
│   └── plugins/
│       └── auto-deploy/       # Obsidian plugin
│           ├── main.js        # Main plugin (1.8 MB)
│           ├── manifest.json  # Plugin metadata
│           └── data.json      # Settings (inc. GitHub token)
├── .autodeploy/               # Auto-deploy watcher system
│   ├── watcher.js             # File watcher script
│   ├── package.json           # Dependencies (chokidar)
│   ├── start.bat              # Start watcher
│   ├── stop.bat               # Stop watcher
│   └── deploy.log             # Deployment logs
└── .github/
    └── workflows/
        └── deploy-pages.yml   # GitHub Actions workflow
```

---

## Site Configuration

- **Site Name:** Mova's Notes
- **Site URL:** https://notes.alafghani.info
- **Author:** Mohamad Mova AlAfghani
- **Theme:** Dark (Aqua-inspired)
- **Export Plugin:** Webpage HTML Export
- **Hosting:** GitHub Pages (docs/ folder, master branch)

---

## Features Enabled

✓ **Full-text search** - Search across all notes
✓ **Graph view** - Local and global graph visualization
✓ **Backlinks** - See what links to each note
✓ **File tree navigation** - Browse notes by folder structure
✓ **Outline/TOC** - Table of contents for each note
✓ **Dark theme** - Custom Aqua-inspired dark theme
✓ **Theme toggle** - Switch between light and dark modes
✓ **Wikilinks** - All `[[wikilinks]]` work correctly
✓ **Image embeds** - `![[image.png]]` syntax supported
✓ **Tags** - Tags displayed and functional
✓ **Properties/Frontmatter** - YAML frontmatter preserved
✓ **RSS feed** - Auto-generated RSS feed
✓ **Link previews** - Hover over links to preview content

---

## 🐛 Troubleshooting

### Watcher Not Starting?
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `cd .autodeploy && npm install`
3. Check error logs: `.autodeploy/deploy-errors.log`
4. Verify git is configured: `git config --list`

### Changes Not Auto-Deploying?
1. **Check watcher status**: Look at watcher console window
2. **Check logs**: View `.autodeploy/deploy.log`
3. **Verify git push works**: Try `git push` manually
4. **Check GitHub Actions**: https://github.com/movanet/mova-notes/actions

### Watcher Committing Too Often?
- The watcher has a 3-second debounce
- Multiple rapid changes are batched into one commit
- Check `deploy.log` for commit frequency

### GitHub Actions Failing?
1. Go to: https://github.com/movanet/mova-notes/actions
2. Click on failed workflow
3. View logs for error details
4. Verify `docs/` folder exists and has HTML files

### Plugin Not Loading?
1. Settings → Community plugins → Reload
2. Or toggle "GitHub Pages Publisher" off/on

### "Please configure GitHub token" Error?
1. Get token from https://github.com/settings/tokens
2. Settings → GitHub Pages Publisher
3. Paste token → Save

### Single-Note Export Failed?
1. Check Obsidian console: `Ctrl/Cmd + Shift + I`
2. Look for error messages
3. Verify Webpage HTML Export plugin is installed

### Files Not Showing on Site?
1. Check GitHub repository: https://github.com/movanet/mova-notes
2. Verify file exists in `docs/` folder
3. GitHub Pages may take ~30 seconds to deploy
4. Check GitHub Pages settings (Settings → Pages)

### Token Expired?
1. Generate new token: https://github.com/settings/tokens
2. Update in plugin settings
3. Try publishing again

---

## 🔐 Security Notes

- **Token Storage**: GitHub token is stored in `.obsidian/plugins/auto-deploy/data.json`
- **Git Ignore**: Token file is already in `.gitignore`
- **Never commit**: Do not commit token to public repositories
- **Token Permissions**: Only needs `repo` access, nothing more

---

## 🆚 Comparison: Old vs New

| Feature | v1.0 (File Watcher) | v2.0 (GitHub API) |
|---------|---------------------|-------------------|
| Publishing Method | Git CLI + Watcher | GitHub REST API |
| Background Process | Yes (Node.js) | No |
| Single-Note Safe | No (deleted files) | Yes (API updates only) |
| Dependencies | chokidar, git CLI | Octokit only |
| Complexity | High (350+ lines) | Low (400 lines, cleaner) |
| Reliability | Medium (file system issues) | High (direct API) |
| Speed | ~10-15 seconds | ~5-7 seconds |

---

## 📚 Credits

**Architecture inspired by:**
- [obsidian-digital-garden](https://github.com/oleeskild/obsidian-digital-garden) - GitHub API publishing approach
- [Webpage HTML Export](https://github.com/KosmosisDire/obsidian-webpage-export) - Static HTML generation

---

## Need Help?

- Plugin documentation: https://docs.obsidianweb.net
- GitHub Issues: https://github.com/movanet/mova-notes/issues
- Obsidian Forum: https://forum.obsidian.md
