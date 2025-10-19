const { Plugin, Notice } = require('obsidian');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = class AutoDeployPlugin extends Plugin {
  async onload() {
    console.log('Loading Auto Deploy plugin');

    // Paths
    this.vaultPath = this.app.vault.adapter.basePath;
    this.deployPath = path.join(this.vaultPath, '.deploy');
    this.statusFile = path.join(this.vaultPath, '.obsidian', 'plugins', 'auto-deploy', 'status.json');
    this.pidFile = path.join(this.deployPath, 'watcher.pid');
    this.startScript = path.join(this.deployPath, 'start.bat');

    // Auto-install dependencies if missing (for portability)
    await this.ensureDependencies();

    // Auto-start watcher on vault load
    await this.startWatcher();

    // Watch status file for deploy notifications
    this.watchStatusFile();

    // Add command to manually start/stop watcher
    this.addCommand({
      id: 'start-watcher',
      name: 'Start deployment watcher',
      callback: () => this.startWatcher()
    });

    this.addCommand({
      id: 'stop-watcher',
      name: 'Stop deployment watcher',
      callback: () => this.stopWatcher()
    });

    this.addCommand({
      id: 'restart-watcher',
      name: 'Restart deployment watcher',
      callback: () => this.restartWatcher()
    });

    // Single-note export (safe two-folder approach)
    this.addCommand({
      id: 'export-current-note',
      name: 'Export current note and deploy (single file)',
      editorCallback: async (editor, view) => {
        await this.exportCurrentNote(view);
      }
    });
  }

  // Auto-install dependencies if missing (portability feature)
  async ensureDependencies() {
    const nodeModulesPath = path.join(this.deployPath, 'node_modules');

    // Check if node_modules exists
    if (fs.existsSync(nodeModulesPath)) {
      console.log('Dependencies already installed');
      return;
    }

    console.log('Installing dependencies for first-time setup...');
    new Notice('🔧 Auto-deploy: Installing dependencies... (one-time setup)', 5000);

    return new Promise((resolve) => {
      exec('npm install', { cwd: this.deployPath }, (error, stdout, stderr) => {
        if (error) {
          new Notice('❌ Failed to install dependencies. Run: cd .deploy && npm install', 8000);
          console.error('npm install failed:', error, stderr);
        } else {
          new Notice('✅ Dependencies installed successfully!', 3000);
          console.log('npm install complete:', stdout);
        }
        resolve();
      });
    });
  }

  // Check if watcher is already running
  isWatcherRunning() {
    try {
      if (!fs.existsSync(this.pidFile)) {
        return false;
      }

      const pid = fs.readFileSync(this.pidFile, 'utf8').trim();

      // Check if process with this PID exists
      try {
        process.kill(pid, 0); // Signal 0 just checks if process exists
        return true;
      } catch (e) {
        // Process doesn't exist, clean up stale PID file
        fs.unlinkSync(this.pidFile);
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  // Start the deployment watcher
  async startWatcher() {
    // Check if already running
    if (this.isWatcherRunning()) {
      console.log('Auto-deploy watcher is already running');
      return;
    }

    // Check if start script exists
    if (!fs.existsSync(this.startScript)) {
      new Notice('❌ Auto-deploy: start.bat not found', 5000);
      console.error('Start script not found at:', this.startScript);
      return;
    }

    console.log('Starting auto-deploy watcher...');

    return new Promise((resolve) => {
      exec(`cmd /c "${this.startScript}"`, { cwd: this.deployPath }, (error, stdout, stderr) => {
        if (error) {
          new Notice(`❌ Failed to start watcher: ${error.message}`, 5000);
          console.error('Failed to start watcher:', error, stderr);
        } else {
          new Notice('🚀 Auto-deploy watcher started', 3000);
          console.log('Watcher started:', stdout);
        }
        resolve();
      });
    });
  }

  // Stop the deployment watcher
  async stopWatcher() {
    const stopScript = path.join(this.deployPath, 'stop.bat');

    if (!fs.existsSync(stopScript)) {
      new Notice('❌ Auto-deploy: stop.bat not found', 5000);
      return;
    }

    return new Promise((resolve) => {
      exec(`cmd /c "${stopScript}"`, { cwd: this.deployPath }, (error, stdout, stderr) => {
        if (error) {
          new Notice(`❌ Failed to stop watcher: ${error.message}`, 5000);
          console.error('Failed to stop watcher:', error, stderr);
        } else {
          new Notice('🛑 Auto-deploy watcher stopped', 3000);
          console.log('Watcher stopped:', stdout);
        }
        resolve();
      });
    });
  }

  // Restart the deployment watcher
  async restartWatcher() {
    await this.stopWatcher();
    setTimeout(() => this.startWatcher(), 1000);
  }

  // Watch status file and show notifications
  watchStatusFile() {
    let lastStatus = null;

    // Check status file periodically
    this.statusCheckInterval = setInterval(() => {
      try {
        if (!fs.existsSync(this.statusFile)) {
          return;
        }

        const statusData = JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));

        // Only notify on status changes
        const statusKey = `${statusData.status}-${statusData.timestamp}`;
        if (statusKey === lastStatus) {
          return;
        }

        lastStatus = statusKey;

        // Show notification based on status
        switch (statusData.status) {
          case 'success':
            new Notice(`✅ ${statusData.message}`, 5000);
            break;
          case 'error':
            new Notice(`❌ Deploy failed: ${statusData.message}`, 8000);
            console.error('Deploy error:', statusData.error);
            break;
          case 'deploying':
            new Notice(`📦 ${statusData.message}`, 3000);
            break;
          case 'skipped':
            // Don't notify for skipped deploys (no changes)
            console.log('Deploy skipped:', statusData.message);
            break;
        }
      } catch (err) {
        // Ignore errors reading status file
      }
    }, 1000); // Check every second
  }

  // Export current note using two-folder strategy (SAFE)
  async exportCurrentNote(view) {
    try {
      // Ensure watcher is running
      if (!this.isWatcherRunning()) {
        await this.startWatcher();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Get current file
      const file = view.file;
      if (!file) {
        new Notice('❌ No active file', 3000);
        return;
      }

      const fileName = file.name;
      new Notice(`📝 Exporting: ${fileName}...`, 3000);

      // Paths
      const docsPath = path.join(this.vaultPath, 'docs');
      const tempPath = path.join(this.vaultPath, 'docs-temp');
      const settingsPath = path.join(this.vaultPath, '.obsidian', 'plugins', 'webpage-html-export', 'data.json');

      // Ensure docs-temp exists
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      // Read current export settings
      let originalSettings;
      try {
        originalSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (err) {
        new Notice('❌ Failed to read export settings', 5000);
        console.error('Failed to read settings:', err);
        return;
      }

      // Save original export path
      const originalExportPath = originalSettings.exportOptions.exportPath;

      try {
        // Step 1: Configure export to docs-temp/ with only this file
        originalSettings.exportOptions.exportPath = tempPath;
        originalSettings.exportOptions.filesToExport = [fileName];
        fs.writeFileSync(settingsPath, JSON.stringify(originalSettings, null, 2), 'utf8');

        console.log(`Configured export: ${fileName} -> ${tempPath}`);

        // Step 2: Trigger export (this will clear docs-temp/ and export only this file)
        const commands = this.app.commands.commands;
        let exportCommand = null;

        for (const [id, command] of Object.entries(commands)) {
          if (id.includes('webpage-html-export') && id.includes('export')) {
            exportCommand = command;
            break;
          }
        }

        if (!exportCommand) {
          new Notice('❌ Export command not found', 5000);
          return;
        }

        // Execute export
        this.app.commands.executeCommandById(exportCommand.id);
        new Notice('⏳ Exporting... Please wait', 2000);

        // Wait for export to complete (adjust timing if needed)
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Step 3: Copy the HTML file from docs-temp/ to docs/
        const htmlFileName = fileName.replace(/\.md$/, '.html');
        const sourceFile = path.join(tempPath, htmlFileName);
        const destFile = path.join(docsPath, htmlFileName);

        if (fs.existsSync(sourceFile)) {
          fs.copyFileSync(sourceFile, destFile);
          console.log(`Copied: ${htmlFileName} -> docs/`);

          // Also copy any associated media files (images embedded in this note)
          // This is a simple approach - copies all files that aren't HTML
          const tempFiles = fs.readdirSync(tempPath);
          let mediaCount = 0;

          for (const tempFile of tempFiles) {
            if (!tempFile.endsWith('.html') && !tempFile.startsWith('.')) {
              const sourceMedia = path.join(tempPath, tempFile);
              const destMedia = path.join(docsPath, tempFile);

              // Only copy if it's a file (not directory)
              if (fs.statSync(sourceMedia).isFile()) {
                fs.copyFileSync(sourceMedia, destMedia);
                mediaCount++;
              }
            }
          }

          const mediaMsg = mediaCount > 0 ? ` + ${mediaCount} media file(s)` : '';
          new Notice(`✅ Exported: ${htmlFileName}${mediaMsg}`, 4000);
          new Notice('🚀 Auto-deploy will push changes soon...', 3000);

        } else {
          new Notice(`❌ Export failed - ${htmlFileName} not found`, 5000);
          console.error('Expected file not found:', sourceFile);
        }

      } finally {
        // Step 4: Restore original export settings
        originalSettings.exportOptions.exportPath = originalExportPath;
        originalSettings.exportOptions.filesToExport = [];
        fs.writeFileSync(settingsPath, JSON.stringify(originalSettings, null, 2), 'utf8');

        console.log('Restored original export settings');
      }

    } catch (err) {
      console.error('Export current note failed:', err);
      new Notice(`❌ Export failed: ${err.message}`, 5000);
    }
  }

  async onunload() {
    console.log('Unloading Auto Deploy plugin');

    // Clear status check interval
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }

    // Optionally stop watcher on plugin unload (uncomment if desired)
    // await this.stopWatcher();
  }
};
