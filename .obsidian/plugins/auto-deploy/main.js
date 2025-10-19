const { Plugin, Notice, PluginSettingTab, Setting } = require('obsidian');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const GitHubPublisher = require('../../../.deploy/GitHubPublisher');

const DEFAULT_SETTINGS = {
  githubOwner: 'movanet',
  githubRepo: 'mova-notes',
  githubBranch: 'master',
  githubToken: ''
};

module.exports = class GitHubPagesPublisher extends Plugin {
  async onload() {
    console.log('Loading GitHub Pages Publisher plugin');

    // Load settings
    await this.loadSettings();

    // Paths
    this.vaultPath = this.app.vault.adapter.basePath;
    this.docsPath = path.join(this.vaultPath, 'docs');
    this.docsTempPath = path.join(this.vaultPath, 'docs-temp');

    // Add settings tab
    this.addSettingTab(new GitHubPagesSettingTab(this.app, this));

    // Add command: Publish single note
    this.addCommand({
      id: 'publish-single-note',
      name: 'Publish current note to GitHub Pages',
      editorCallback: async (editor, view) => {
        await this.publishSingleNote(view);
      }
    });

    // Add command: Publish all changed notes
    this.addCommand({
      id: 'publish-all-notes',
      name: 'Publish all exported notes to GitHub Pages',
      callback: async () => {
        await this.publishAllNotes();
      }
    });

    // Add command: Full vault export + publish
    this.addCommand({
      id: 'export-and-publish-all',
      name: 'Export vault and publish to GitHub Pages',
      callback: async () => {
        await this.exportAndPublishAll();
      }
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Publish single note using GitHub API
   */
  async publishSingleNote(view) {
    try {
      if (!this.validateSettings()) {
        return;
      }

      const file = view.file;
      if (!file) {
        new Notice('❌ No active file', 3000);
        return;
      }

      const fileName = file.name;
      new Notice(`📝 Exporting: ${fileName}...`, 3000);

      // Export to docs-temp folder
      const exported = await this.exportNoteToTemp(fileName);
      if (!exported) {
        return;
      }

      // Publish to GitHub using API
      const htmlFileName = fileName.replace(/\.md$/, '.html');
      const localPath = path.join(this.docsTempPath, htmlFileName);
      const remotePath = `docs/${htmlFileName}`;

      if (!fs.existsSync(localPath)) {
        new Notice(`❌ Export failed - ${htmlFileName} not found`, 5000);
        return;
      }

      new Notice('🚀 Publishing to GitHub...', 2000);

      const publisher = new GitHubPublisher({
        owner: this.settings.githubOwner,
        repo: this.settings.githubRepo,
        branch: this.settings.githubBranch,
        token: this.settings.githubToken,
        docsFolder: 'docs'
      });

      const success = await publisher.uploadFile(
        localPath,
        remotePath,
        `Update: ${htmlFileName}`
      );

      if (success) {
        // Also copy to local docs/ folder for consistency
        const destPath = path.join(this.docsPath, htmlFileName);
        fs.copyFileSync(localPath, destPath);

        // Upload associated media files
        await this.uploadMediaFiles(publisher);

        new Notice(`✅ Published: ${htmlFileName}`, 4000);
        new Notice('🌐 Live at: https://notes.alafghani.info', 5000);
      } else {
        new Notice('❌ Failed to publish to GitHub', 5000);
      }

    } catch (error) {
      console.error('Publish failed:', error);
      new Notice(`❌ Publish failed: ${error.message}`, 5000);
    }
  }

  /**
   * Publish all notes in docs/ folder
   */
  async publishAllNotes() {
    try {
      if (!this.validateSettings()) {
        return;
      }

      new Notice('📦 Publishing all notes to GitHub...', 3000);

      const publisher = new GitHubPublisher({
        owner: this.settings.githubOwner,
        repo: this.settings.githubRepo,
        branch: this.settings.githubBranch,
        token: this.settings.githubToken,
        docsFolder: 'docs'
      });

      // Get all HTML files in docs/
      const files = fs.readdirSync(this.docsPath)
        .filter(f => f.endsWith('.html'))
        .map(f => ({
          localPath: path.join(this.docsPath, f),
          remotePath: `docs/${f}`,
          commitMessage: `Update: ${f}`
        }));

      if (files.length === 0) {
        new Notice('❌ No HTML files found in docs/ folder', 5000);
        return;
      }

      new Notice(`🚀 Uploading ${files.length} files...`, 3000);

      const results = await publisher.uploadFiles(files);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        new Notice(`✅ Published ${successCount} files successfully!`, 5000);
        new Notice('🌐 Live at: https://notes.alafghani.info', 5000);
      } else {
        new Notice(`⚠️ Published ${successCount}, failed ${failCount}`, 5000);
      }

    } catch (error) {
      console.error('Publish all failed:', error);
      new Notice(`❌ Publish failed: ${error.message}`, 5000);
    }
  }

  /**
   * Export full vault then publish all
   */
  async exportAndPublishAll() {
    try {
      new Notice('📝 Exporting full vault...', 3000);

      // Trigger full vault export
      const commands = this.app.commands.commands;
      const exportCommand = Object.entries(commands).find(([id]) =>
        id.includes('webpage-html-export') && id.includes('export')
      );

      if (!exportCommand) {
        new Notice('❌ Export plugin not found', 5000);
        return;
      }

      // Execute export
      this.app.commands.executeCommandById(exportCommand[0]);
      new Notice('⏳ Waiting for export to complete...', 3000);

      // Wait for export to finish
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Now publish all
      await this.publishAllNotes();

    } catch (error) {
      console.error('Export and publish failed:', error);
      new Notice(`❌ Failed: ${error.message}`, 5000);
    }
  }

  /**
   * Export single note to docs-temp folder
   */
  async exportNoteToTemp(fileName) {
    const settingsPath = path.join(
      this.vaultPath,
      '.obsidian',
      'plugins',
      'webpage-html-export',
      'data.json'
    );

    try {
      // Ensure docs-temp exists
      if (!fs.existsSync(this.docsTempPath)) {
        fs.mkdirSync(this.docsTempPath, { recursive: true });
      }

      // Read export settings
      const exportSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const originalPath = exportSettings.exportOptions.exportPath;

      // Configure export to docs-temp/
      exportSettings.exportOptions.exportPath = this.docsTempPath;
      exportSettings.exportOptions.filesToExport = [fileName];
      fs.writeFileSync(settingsPath, JSON.stringify(exportSettings, null, 2));

      // Trigger export
      const commands = this.app.commands.commands;
      const exportCommand = Object.entries(commands).find(([id]) =>
        id.includes('webpage-html-export') && id.includes('export')
      );

      if (!exportCommand) {
        new Notice('❌ Export plugin not found', 5000);
        return false;
      }

      this.app.commands.executeCommandById(exportCommand[0]);
      new Notice('⏳ Exporting... Please wait', 2000);

      // Wait for export
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Restore original settings
      exportSettings.exportOptions.exportPath = originalPath;
      exportSettings.exportOptions.filesToExport = [];
      fs.writeFileSync(settingsPath, JSON.stringify(exportSettings, null, 2));

      return true;

    } catch (error) {
      console.error('Export to temp failed:', error);
      new Notice(`❌ Export failed: ${error.message}`, 5000);
      return false;
    }
  }

  /**
   * Upload media files from docs-temp to GitHub
   */
  async uploadMediaFiles(publisher) {
    try {
      const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
        '.mp3', '.mp4', '.webm', '.ogg', '.wav', '.m4a', '.pdf'];

      const tempFiles = fs.readdirSync(this.docsTempPath);
      const mediaFiles = tempFiles.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return mediaExtensions.includes(ext);
      });

      if (mediaFiles.length === 0) {
        return;
      }

      console.log(`Uploading ${mediaFiles.length} media files...`);

      for (const file of mediaFiles) {
        const localPath = path.join(this.docsTempPath, file);
        const remotePath = `docs/${file}`;

        // Copy to local docs/ as well
        const destPath = path.join(this.docsPath, file);
        if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
          fs.copyFileSync(localPath, destPath);

          // Upload to GitHub
          await publisher.uploadFile(localPath, remotePath);
        }
      }

    } catch (error) {
      console.error('Media upload failed:', error);
    }
  }

  validateSettings() {
    if (!this.settings.githubToken) {
      new Notice('❌ Please configure GitHub token in settings', 5000);
      return false;
    }
    return true;
  }

  async onunload() {
    console.log('Unloading GitHub Pages Publisher plugin');
  }
};

class GitHubPagesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'GitHub Pages Publisher Settings' });

    new Setting(containerEl)
      .setName('GitHub Owner')
      .setDesc('Your GitHub username or organization')
      .addText(text => text
        .setPlaceholder('movanet')
        .setValue(this.plugin.settings.githubOwner)
        .onChange(async (value) => {
          this.plugin.settings.githubOwner = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('GitHub Repository')
      .setDesc('Repository name (e.g., mova-notes)')
        .addText(text => text
        .setPlaceholder('mova-notes')
        .setValue(this.plugin.settings.githubRepo)
        .onChange(async (value) => {
          this.plugin.settings.githubRepo = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('GitHub Branch')
      .setDesc('Branch to publish to')
      .addText(text => text
        .setPlaceholder('master')
        .setValue(this.plugin.settings.githubBranch)
        .onChange(async (value) => {
          this.plugin.settings.githubBranch = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('GitHub Token')
      .setDesc('Personal access token with repo permissions')
      .addText(text => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('ghp_xxxxxxxxxxxx')
          .setValue(this.plugin.settings.githubToken)
          .onChange(async (value) => {
            this.plugin.settings.githubToken = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl('p', {
      text: 'Get a token from: ',
      cls: 'setting-item-description'
    });
    containerEl.createEl('a', {
      text: 'https://github.com/settings/tokens',
      href: 'https://github.com/settings/tokens'
    });
  }
}
