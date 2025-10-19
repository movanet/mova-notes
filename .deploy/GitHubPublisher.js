const { Octokit } = require('@octokit/core');
const { Base64 } = require('js-base64');
const fs = require('fs');
const path = require('path');

/**
 * GitHub API Publisher
 * Based on obsidian-digital-garden's approach
 * Uses GitHub REST API to publish files directly (no git CLI needed)
 */
class GitHubPublisher {
  constructor(options) {
    this.owner = options.owner;
    this.repo = options.repo;
    this.branch = options.branch || 'master';
    this.token = options.token;
    this.docsFolder = options.docsFolder || 'docs';

    this.octokit = new Octokit({ auth: this.token });
  }

  /**
   * Get file SHA from GitHub (needed for updates)
   */
  async getFileSha(filePath) {
    try {
      const response = await this.octokit.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          ref: this.branch
        }
      );

      if (response.status === 200 && response.data.type === 'file') {
        return response.data.sha;
      }
    } catch (error) {
      // File doesn't exist yet (404) - that's okay
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Upload single file to GitHub
   * @param {string} localPath - Local file path (e.g., docs/test.html)
   * @param {string} remotePath - Remote path in repo (e.g., docs/test.html)
   * @param {string} commitMessage - Custom commit message
   */
  async uploadFile(localPath, remotePath, commitMessage) {
    // Read file content
    const fileContent = fs.readFileSync(localPath, 'utf8');

    // Base64 encode
    const encodedContent = Base64.encode(fileContent);

    // Get existing file SHA (if it exists)
    const sha = await this.getFileSha(remotePath);

    // Prepare commit message
    const message = commitMessage || (sha ? `Update: ${path.basename(remotePath)}` : `Add: ${path.basename(remotePath)}`);

    // Upload to GitHub
    const response = await this.octokit.request(
      'PUT /repos/{owner}/{repo}/contents/{path}',
      {
        owner: this.owner,
        repo: this.repo,
        path: remotePath,
        message: message,
        content: encodedContent,
        sha: sha, // Only needed for updates
        branch: this.branch
      }
    );

    return response.status === 200 || response.status === 201;
  }

  /**
   * Upload multiple files in batch (creates individual commits)
   * @param {Array} files - Array of {localPath, remotePath, commitMessage}
   */
  async uploadFiles(files) {
    const results = [];

    for (const file of files) {
      try {
        const success = await this.uploadFile(
          file.localPath,
          file.remotePath,
          file.commitMessage
        );
        results.push({ file: file.remotePath, success });
      } catch (error) {
        console.error(`Failed to upload ${file.remotePath}:`, error);
        results.push({ file: file.remotePath, success: false, error });
      }
    }

    return results;
  }

  /**
   * Delete file from GitHub
   * @param {string} remotePath - Remote path in repo
   */
  async deleteFile(remotePath) {
    const sha = await this.getFileSha(remotePath);

    if (!sha) {
      console.log(`File ${remotePath} does not exist, skipping delete`);
      return false;
    }

    const response = await this.octokit.request(
      'DELETE /repos/{owner}/{repo}/contents/{path}',
      {
        owner: this.owner,
        repo: this.repo,
        path: remotePath,
        message: `Delete: ${path.basename(remotePath)}`,
        sha: sha,
        branch: this.branch
      }
    );

    return response.status === 200;
  }

  /**
   * Get all files in docs/ folder from GitHub
   * Returns array of {path, sha, size}
   */
  async getDocsFiles() {
    try {
      const response = await this.octokit.request(
        'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
        {
          owner: this.owner,
          repo: this.repo,
          tree_sha: this.branch,
          recursive: 'true'
        }
      );

      if (response.status === 200) {
        // Filter only files in docs/ folder
        return response.data.tree.filter(item =>
          item.path.startsWith(this.docsFolder + '/') && item.type === 'blob'
        );
      }
    } catch (error) {
      console.error('Failed to get docs files:', error);
      return [];
    }
  }
}

module.exports = GitHubPublisher;
