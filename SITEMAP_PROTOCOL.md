# Sitemap Update Protocol

## Purpose
This protocol ensures that `docs/sitemap.xml` is always current and includes all published HTML files on notes.alafghani.info.

## When to Update Sitemap

Update the sitemap whenever:
1. New HTML files are added to the `docs/` directory
2. New subdirectories with HTML content are created (e.g., `docs/01-lingkungan/`)
3. Files are removed from the `docs/` directory
4. File URLs change due to restructuring

## Manual Update Process

### Step 1: Identify New/Changed Files
```bash
cd docs/
find . -name "*.html" -type f | sort
```

### Step 2: Edit sitemap.xml
For each new HTML file, add an entry before `</urlset>`:

```xml
<url>
  <loc>https://notes.alafghani.info/path/to/file.html</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

**Priority Guidelines:**
- `1.0` - Homepage (index.html)
- `0.9` - Important pages (CV, about)
- `0.8` - Regular content pages
- `0.3` - Test files, drafts, low-priority pages

**Change Frequency Guidelines:**
- `weekly` - Homepage, frequently updated pages
- `monthly` - Regular articles, blog posts
- `yearly` - Archived content, test files

### Step 3: Commit and Push
```bash
git add docs/sitemap.xml
git commit -m "Update sitemap with [description of changes]"
git push origin master
```

### Step 4: Verify Deployment
```bash
curl -I https://notes.alafghani.info/sitemap.xml
```

Check that Last-Modified header reflects recent update.

## Automation Options

### Option 1: Script-Based Generation
Create a script to auto-generate sitemap from all HTML files in docs/:

```bash
#!/bin/bash
# generate-sitemap.sh

DOMAIN="https://notes.alafghani.info"
DATE=$(date +%Y-%m-%d)
SITEMAP="docs/sitemap.xml"

echo '<?xml version="1.0" encoding="UTF-8"?>' > $SITEMAP
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> $SITEMAP

find docs/ -name "*.html" -type f | while read file; do
  url_path=$(echo $file | sed 's|^docs/||')
  echo "  <url>" >> $SITEMAP
  echo "    <loc>$DOMAIN/$url_path</loc>" >> $SITEMAP
  echo "    <lastmod>$DATE</lastmod>" >> $SITEMAP
  echo "    <changefreq>monthly</changefreq>" >> $SITEMAP
  echo "    <priority>0.8</priority>" >> $SITEMAP
  echo "  </url>" >> $SITEMAP
done

echo '</urlset>' >> $SITEMAP
```

### Option 2: GitHub Actions
Create `.github/workflows/update-sitemap.yml`:

```yaml
name: Update Sitemap

on:
  push:
    branches: [ master ]
    paths:
      - 'docs/**/*.html'

jobs:
  update-sitemap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate Sitemap
        run: |
          # Run sitemap generation script
          bash generate-sitemap.sh
      - name: Commit Sitemap
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add docs/sitemap.xml
          git commit -m "Auto-update sitemap" || exit 0
          git push
```

### Option 3: Pre-commit Hook
Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Check if any HTML files in docs/ are being committed
if git diff --cached --name-only | grep -q '^docs/.*\.html$'; then
    echo "HTML files changed, regenerating sitemap..."
    bash generate-sitemap.sh
    git add docs/sitemap.xml
fi
```

## Best Practices

1. **Always update lastmod date** - Use current date (YYYY-MM-DD format) when adding/updating entries
2. **Maintain alphabetical order** - Keep URLs sorted for easier maintenance
3. **Test after updates** - Always verify sitemap is valid XML and accessible
4. **Submit to search engines** - After major updates, resubmit to Google Search Console
5. **Check file size** - Sitemaps should not exceed 50MB or 50,000 URLs
6. **Use consistent formatting** - Maintain indentation and spacing

## Verification Checklist

After updating sitemap:
- [ ] Valid XML syntax (check with xmllint or online validator)
- [ ] All URLs use HTTPS protocol
- [ ] All URLs use correct domain (notes.alafghani.info)
- [ ] File paths match actual file locations in docs/
- [ ] lastmod dates are in YYYY-MM-DD format
- [ ] Sitemap committed to git
- [ ] Changes pushed to GitHub
- [ ] GitHub Pages deployed successfully
- [ ] Sitemap accessible at https://notes.alafghani.info/sitemap.xml

## Integration with Auto-Deploy Plugin

The current auto-deploy Obsidian plugin should be configured to:
1. Generate/update sitemap whenever HTML files are published
2. Automatically commit and push sitemap changes
3. Update lastmod dates to current date

If auto-deploy doesn't update sitemap automatically, follow the manual process above.

## Troubleshooting

**Sitemap not updating on live site:**
- Clear browser cache
- Check GitHub Pages deployment status
- Verify file was pushed to master branch
- Wait 1-5 minutes for GitHub Pages to rebuild

**Invalid XML errors:**
- Check for unescaped special characters (&, <, >, ", ')
- Ensure all tags are properly closed
- Validate with: `xmllint --noout docs/sitemap.xml`

**Missing pages in sitemap:**
- Check if HTML files exist in docs/
- Verify URL paths match actual file structure
- Run find command to list all HTML files

## References

- [Sitemaps.org Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Central - Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---
Last Updated: 2025-10-20
