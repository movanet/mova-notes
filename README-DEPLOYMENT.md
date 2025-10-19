# Deployment Guide for Mova's Notes

This guide explains how to export and deploy your Obsidian vault using the Webpage HTML Export plugin to Netlify.

## Export Process

### 1. Export from Obsidian

1. Open Obsidian and load the `obsidianpublish` vault
2. Open Command Palette: `Ctrl/Cmd + P`
3. Search for: **"Webpage HTML Export: Export Vault"**
4. Choose export location (recommended: `D:\Obsidian\obsidianpublish-export`)
5. Wait for export to complete

### 2. Deploy to Netlify

#### Option A: Netlify Drop (Easiest for testing)

1. Go to https://app.netlify.com/drop
2. Drag and drop the exported folder
3. Netlify will provide a temporary URL
4. To make it permanent, link to your GitHub account

#### Option B: GitHub + Netlify (Recommended for production)

1. **Prepare Git Repository:**
   ```bash
   cd D:\Obsidian\obsidianpublish-export
   git init
   git add .
   git commit -m "Initial export from Webpage HTML Export"
   git branch -M main
   git remote add origin https://github.com/movanet/Published.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select `movanet/Published`
   - **Build settings:**
     - Build command: (leave empty)
     - Publish directory: `/` (or `.` - the exported HTML is ready to serve)
   - Click "Deploy site"

3. **Configure Custom Domain:**
   - In Netlify site settings, go to "Domain management"
   - Add custom domain: `notes.alafghani.info`
   - Update DNS records as instructed by Netlify
   - Wait for SSL certificate to be provisioned

#### Option C: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd D:\Obsidian\obsidianpublish-export
netlify deploy --prod
```

## Ongoing Workflow

### When You Update Content:

1. **Edit notes** in `D:\Obsidian\obsidianpublish` vault
2. **Export vault** using Command Palette → "Webpage HTML Export: Export Vault"
3. **Deploy updated files:**

   ```bash
   cd D:\Obsidian\obsidianpublish-export
   git add .
   git commit -m "Update: [describe changes]"
   git push
   ```

4. **Netlify will auto-deploy** (if connected to GitHub)

## Features Enabled

✓ **Full-text search** - Search across all notes with header surfacing
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

## Site Configuration

- **Site Name:** Mova's Notes
- **Site URL:** https://notes.alafghani.info
- **Author:** Mohamad Mova AlAfghani
- **Theme:** Dark (Aqua-inspired)
- **Base theme:** Obsidian dark

## Troubleshooting

### Export not working?
- Check Obsidian console (Ctrl/Cmd + Shift + I)
- Verify plugin is enabled in Settings → Community plugins

### Links broken after export?
- Ensure "Fix Links" is enabled in plugin settings
- Check "Slugify Paths" setting

### Dark theme not applying?
- The custom CSS is in `site-lib/html/custom-head.html`
- Make sure "Custom Head" feature is enabled in plugin settings

### Images not showing?
- Verify images exist in the vault
- Check image paths in markdown files
- Ensure images were included in export

## Need Help?

- Plugin documentation: https://docs.obsidianweb.net
- GitHub issues: https://github.com/KosmosisDire/obsidian-webpage-export/issues
