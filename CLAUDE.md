# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is an **Obsidian Digital Garden** that publishes markdown notes as a static HTML website. It's a personal knowledge management system focused on Indonesian law and environmental topics, published at https://notes.alafghani.info.

- **Owner**: Mohamad Mova AlAfghani
- **Published via**: GitHub Pages (docs/ folder, master branch)
- **Repository**: https://github.com/movanet/mova-notes
- **Primary content**: Educational materials on Environmental Law, Intellectual Property, and related topics

## Architecture Overview

### Hybrid Deployment Architecture

The repository uses a fully automated hybrid approach:

1. **Obsidian Plugin (v2.0.0)** - Custom plugin in `.obsidian/plugins/auto-deploy/`
   - Integrates obsidian-webpage-export with GitHub API publishing
   - Exports markdown → HTML with full-text search, graph visualization, backlinks
   - Three publishing modes: single-note, batch, and full vault export
   - Exports to `docs/` folder

2. **Local Auto-Deploy Watcher (v2.0)** - Node.js file watcher in `.autodeploy/`
   - Monitors `docs/` folder for changes (3-second debounce)
   - Auto-commits changes with timestamps
   - Auto-pushes to GitHub master branch
   - Runs as background process

3. **GitHub Actions** - Automated deployment in `.github/workflows/deploy-pages.yml`
   - Triggers on push to master when `docs/` changes
   - Deploys to GitHub Pages using `actions/deploy-pages@v4`
   - Updates sitemap timestamps automatically
   - Provides deployment logs and status

### Directory Structure

```
.obsidian/plugins/auto-deploy/   # Custom publisher plugin (TypeScript)
├── src/                         # 92 TypeScript files (webpage-export integration)
├── main.js                      # Compiled plugin (1.8 MB)
├── esbuild.config.mjs          # Two-stage build config
└── data.json                    # Settings (GitHub token, repo config)

.autodeploy/                     # Local auto-deploy watcher system (v2.0)
├── watcher.js                   # File watcher script
├── package.json                 # Dependencies (chokidar)
├── start.bat                    # Start watcher script
├── stop.bat                     # Stop watcher script
└── README.md                    # Watcher documentation

.github/workflows/               # GitHub Actions workflows
└── deploy-pages.yml             # Automated deployment to GitHub Pages

docs/                            # Published HTML (GitHub Pages source)
├── *.html                      # 189+ generated pages
├── site-lib/                   # Static assets (CSS, JS, fonts)
└── sitemap.xml                 # SEO sitemap

01-Lingkungan/                  # Example content folder (Environmental Law course)
                                # ~32,100 words across 7 chapters

[Root markdown files]            # Individual notes (200+ files)
```

### Plugin Architecture

The auto-deploy plugin combines:
- **HTML Export Engine**: Converts Obsidian markdown → interactive HTML
- **GitHub Publisher**: Direct API integration (no git commands)
- **Features**: Full-text search (MiniSearch), graph view, backlinks, LaTeX math, dark/light themes

**Key Technologies**:
- TypeScript 4.7.4 with esbuild (0.14.47) for bundling
- Octokit for GitHub API
- PostCSS + HTML-minifier-terser for optimization
- MiniSearch 7.1.0 for client-side search

## Common Development Tasks

### Building the Auto-Deploy Plugin

```bash
# Navigate to plugin directory
cd .obsidian/plugins/auto-deploy

# Install dependencies
npm install

# Build plugin (two-stage compilation: frontend + plugin)
npm run build

# The build process:
# 1. Compiles frontend TypeScript (src/) → embedded in main.js
# 2. Compiles plugin code with esbuild
# 3. Output: main.js (1.8 MB compiled bundle)
```

**Build System Notes**:
- Uses custom esbuild path resolution for import fixes
- Two tsconfig files: `tsconfig.json` (plugin) and `tsconfig.frontend.json` (export engine)
- All 92 TypeScript files from webpage-export are bundled into single main.js

### Testing the Plugin

```bash
# After building, reload Obsidian to test changes
# Or use Obsidian's "Reload app without saving" command

# Test single-note publishing in Obsidian:
# 1. Open any markdown note
# 2. Ctrl+P → "Publish current note to GitHub Pages"
# 3. Check docs-temp/ folder for exported HTML
# 4. Verify upload in GitHub repository
```

### Automated Publishing Workflow

**Complete Automation (Recommended)**:

1. **Start the watcher** (one-time setup):
   ```bash
   cd .autodeploy
   npm install  # First time only
   npm start    # Or double-click start.bat
   ```

2. **Edit and export** in Obsidian:
   ```
   Edit note → Ctrl+P → "Publish current note to GitHub Pages"
   ```

3. **Automatic deployment**:
   ```
   Plugin exports to docs/
   → Watcher detects change (3s delay)
   → Auto-commit with timestamp
   → Auto-push to GitHub
   → GitHub Actions deploys to Pages
   → Live at https://notes.alafghani.info (~30 seconds total)
   ```

**Manual Publishing Options**:

- **Single-Note**: `Ctrl+P → "Publish current note"` (exports to docs-temp/)
- **Batch**: `Ctrl+P → "Publish all exported notes"` (uploads all changed files)
- **Full Vault**: `Ctrl+P → "Export vault and publish"` (complete re-export)

**Stopping the watcher**:
```bash
cd .autodeploy
# Double-click stop.bat or close the watcher console window
```

### Sitemap Management

**Automatic Updates**: GitHub Actions workflow automatically updates sitemap timestamps on each deployment.

**Manual Regeneration** (if needed):
```bash
# See SITEMAP_PROTOCOL.md for manual sitemap generation
# The workflow in .github/workflows/deploy-pages.yml handles this automatically
```

### Deployment Verification

**Check GitHub Actions**:
- Go to: https://github.com/movanet/mova-notes/actions
- View deployment status and logs
- Each deployment takes ~30-60 seconds

**Verify Published Site**:
```bash
# Check if site is live
curl https://notes.alafghani.info

# Verify sitemap
curl https://notes.alafghani.info/sitemap.xml

# Check specific published note
curl https://notes.alafghani.info/[note-name].html
```

**Check Watcher Status**:
```bash
# View watcher logs
cd .autodeploy
cat deploy.log        # Successful deployments
cat deploy-errors.log # Error logs
```

## Configuration Files

### Plugin Settings (.obsidian/plugins/auto-deploy/data.json)
```json
{
  "githubOwner": "movanet",
  "githubRepo": "mova-notes",
  "githubBranch": "master",
  "githubToken": "[REDACTED]"  // In .gitignore - never commit
}
```

### Netlify Configuration (.netlify/netlify.toml)
- Publish directory: `D:\Obsidian\obsidianpublish\dist`
- Node version: 18
- Security headers: X-Frame-Options, XSS Protection
- Cache control: HTML (1 hour), assets (1 year)
- Sitemap plugin: netlify-plugin-submit-sitemap

## Important Notes

### Security
- GitHub personal access token stored in `data.json` (in .gitignore)
- Never commit tokens or sensitive credentials
- Token requires `repo` scope for GitHub API publishing

### CRITICAL: File Deletion Safety

**DANGER: The `deleteOldFiles` setting can cause mass file deletion!**

Location: `.obsidian/plugins/auto-deploy/data.json` line 225

```json
"deleteOldFiles": false,  // MUST be false for safety
```

**What it does**:
- When `true`: Exporting a single file DELETES ALL OTHER HTML files not in the current export
- When `false`: Only updates/adds the files being exported (SAFE)

**Real incident (2025-10-28)**:
- Setting was `true` by default
- User exported ONE file via Ctrl+P
- Plugin deleted 304 HTML files automatically
- Watcher auto-committed the deletions
- Required full restoration from backup

**Why it's dangerous**:
1. The HTMLExporter library reads this GLOBAL setting
2. It overrides function parameters (even when code passes `deleteOld = false`)
3. Single-file exports compare against ALL files in docs/
4. Everything not in current export gets deleted
5. Watcher immediately commits deletions to git

**Recovery from mass deletion**:
```bash
# If this happens:
1. IMMEDIATELY stop the watcher (taskkill /IM node.exe /F)
2. Check damage: ls docs/*.html | wc -l
3. Restore from backup: cp docs_backup/* docs/
4. Fix setting: Change deleteOldFiles to false in data.json
5. Commit restoration: git add . && git commit && git push
```

**Prevention**:
- ✅ Keep `deleteOldFiles: false` at ALL times
- ✅ Create backups before testing: `cp -r docs docs_backup`
- ✅ Never change this setting to `true` unless doing a full vault re-export
- ✅ Test single-file exports in a separate branch first
- ⚠️  This setting affects ALL export operations globally

**When to use `deleteOldFiles: true`** (rare):
- Only for complete vault re-export when you want to remove old/renamed files
- ALWAYS backup first
- Immediately change back to `false` after

### Content Structure
- Primary content is in root markdown files and topic folders (e.g., 01-Lingkungan/)
- `docs/` folder is auto-generated - do not manually edit HTML files
- `docs-temp/` is temporary export folder for single-note publishing
- `dist/` contains media cache and build artifacts

### Git Workflow
- **Branch**: master (main branch for GitHub Pages)
- **Tracked**: README-DEPLOYMENT.md, SITEMAP_PROTOCOL.md, docs/
- **Untracked**: node_modules/, plugin source (large files), dist/ media (~90MB+)
- Recent commits show auto-deploy timestamps (e.g., "Auto-deploy: 2025-10-20 12:20:38")

### Plugin Development
- Plugin is **large** (1.8 MB) because it embeds full HTML export engine (92 TypeScript files)
- Two-stage build: frontend compilation → plugin compilation
- Custom path resolution for import fixes in esbuild
- See `.obsidian/plugins/auto-deploy/DEVELOPMENT.md` for technical details

## Key Documentation

- **README-DEPLOYMENT.md** (247 lines): v2.0 deployment guide, troubleshooting, architecture
- **SITEMAP_PROTOCOL.md** (187 lines): Sitemap update procedures and automation
- **.obsidian/plugins/auto-deploy/README.md** (410 lines): Plugin features, installation, usage, FAQ
- **01-Lingkungan/README_Navigation.md** (175 lines): Environmental Law course navigation

## Published Statistics

- 189+ HTML pages published
- ~32,100 words in Environmental Law course
- Multi-language content (Indonesian/English)
- Published at: https://notes.alafghani.info
- Features: Full-text search, graph view, backlinks, responsive design, LaTeX math rendering
