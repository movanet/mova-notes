# Deployment Guide for Mova's Notes

## 🚀 Quick Start (GitHub Pages Publisher v2.0)

### ✨ New in v2.0: GitHub API Publishing
- **No more file watchers** - Direct GitHub API integration
- **Safer single-note publishing** - Never deletes other files
- **Simpler architecture** - No background processes needed
- **Instant deployment** - Publishes directly to GitHub

### Setup (One-Time)

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

### Single-Note Publishing ⚡ (Fastest!)

**Publish just the note you're editing:**

1. Open a note in Obsidian
2. Press `Ctrl/Cmd + P`
3. Type: **"Publish current note to GitHub Pages"**
4. Press Enter
5. Wait ~7 seconds
6. Done! ✅

**What happens:**
- Exports note to `docs-temp/` (temporary)
- Uploads HTML file directly to GitHub via API
- Copies to local `docs/` folder for consistency
- All other pages remain untouched
- GitHub Pages deploys automatically

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

### 🔄 Architecture
- ✅ Uses GitHub REST API (Octokit)
- ✅ No file watchers or background processes
- ✅ No git CLI commands needed
- ✅ Direct API communication with GitHub
- ✅ Based on obsidian-digital-garden approach
- ✅ Publishes to **https://notes.alafghani.info** (GitHub Pages)

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
├── docs/                      # Published HTML files (local copy)
├── docs-temp/                 # Temporary export folder
├── .obsidian/
│   └── plugins/
│       └── auto-deploy/       # Plugin code
│           ├── main.js        # Main plugin
│           ├── manifest.json  # Plugin metadata
│           └── data.json      # Settings (inc. GitHub token)
└── .deploy/
    ├── GitHubPublisher.js     # GitHub API wrapper
    └── package.json           # Dependencies (Octokit)
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
