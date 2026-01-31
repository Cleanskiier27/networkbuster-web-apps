#!/usr/bin/env node

/**
 * NetworkBuster Cloud Storage Manager
 * Import/Export utilities for D: cloud mount
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_PATH = 'C:\\Users\\daypi\\OneDrive\\Desktop\\networkbuster.net';
const CLOUD_PATH = 'D:\\networkbuster-cloud';
const BACKUP_PATH = path.join(CLOUD_PATH, 'backups');
const IMPORT_PATH = path.join(CLOUD_PATH, 'imports');
const EXPORT_PATH = path.join(CLOUD_PATH, 'exports');

class CloudStorageManager {
  constructor() {
    this.projectPath = PROJECT_PATH;
    this.cloudPath = CLOUD_PATH;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${type.toUpperCase()}]${colors.reset} ${message}`);
  }

  initializeCloud() {
    this.log('Initializing cloud storage structure...');

    const dirs = [this.cloudPath, BACKUP_PATH, IMPORT_PATH, EXPORT_PATH];

    dirs.forEach(dir => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log(`Created: ${dir}`, 'success');
        } else {
          this.log(`Already exists: ${dir}`, 'info');
        }
      } catch (err) {
        this.log(`Failed to create ${dir}: ${err.message}`, 'error');
      }
    });

    this.log('Cloud storage initialized!', 'success');
  }

  importFromCloud() {
    this.log('Importing files from cloud storage...');

    if (!fs.existsSync(IMPORT_PATH)) {
      this.log('Import folder not found', 'error');
      return;
    }

    const files = this.getFilesRecursive(IMPORT_PATH);

    if (files.length === 0) {
      this.log('No files to import', 'warn');
      return;
    }

    this.log(`Found ${files.length} file(s) to import`, 'info');

    files.forEach(file => {
      const relativePath = path.relative(IMPORT_PATH, file);
      const destPath = path.join(this.projectPath, relativePath);
      const destDir = path.dirname(destPath);

      try {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(file, destPath);
        this.log(`Imported: ${path.basename(file)}`, 'success');
      } catch (err) {
        this.log(`Failed to import ${file}: ${err.message}`, 'error');
      }
    });

    this.log('Import complete!', 'success');
  }

  exportToCloud() {
    this.log('Exporting project to cloud storage...');

    const itemsToExport = [
      'package.json',
      'package-lock.json',
      'auth-ui',
      'api',
      'docs',
      'data',
      'infra'
    ];

    itemsToExport.forEach(item => {
      const sourcePath = path.join(this.projectPath, item);
      const destPath = path.join(EXPORT_PATH, item);

      if (fs.existsSync(sourcePath)) {
        try {
          if (fs.statSync(sourcePath).isDirectory()) {
            this.copyDirSync(sourcePath, destPath);
            this.log(`Exported folder: ${item}`, 'success');
          } else {
            fs.copyFileSync(sourcePath, destPath);
            this.log(`Exported file: ${item}`, 'success');
          }
        } catch (err) {
          this.log(`Failed to export ${item}: ${err.message}`, 'error');
        }
      }
    });

    // Create manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      version: '1.0.1',
      projectPath: this.projectPath,
      items: itemsToExport,
      exportCount: itemsToExport.length
    };

    try {
      fs.writeFileSync(
        path.join(EXPORT_PATH, 'MANIFEST.json'),
        JSON.stringify(manifest, null, 2)
      );
      this.log('Manifest created', 'success');
    } catch (err) {
      this.log(`Failed to create manifest: ${err.message}`, 'error');
    }
  }

  backupToCloud() {
    this.log('Creating backup of project...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupName = `networkbuster_backup_${timestamp}.zip`;
    const backupFile = path.join(BACKUP_PATH, backupName);

    try {
      // Use 7-Zip if available, otherwise PowerShell compression
      try {
        execSync(`7z a -r "${backupFile}" "${this.projectPath}" -x!node_modules -x!.git\\objects`, {
          stdio: 'inherit'
        });
      } catch {
        // Fallback: PowerShell compression
        const cmd = `Compress-Archive -Path "${this.projectPath}" -DestinationPath "${backupFile}" -Force`;
        execSync(`powershell -Command "${cmd}"`, { stdio: 'inherit' });
      }

      const size = (fs.statSync(backupFile).size / (1024 * 1024)).toFixed(2);
      this.log(`Backup created: ${backupName} (${size} MB)`, 'success');

      // Cleanup old backups
      this.cleanupOldBackups();
    } catch (err) {
      this.log(`Backup failed: ${err.message}`, 'error');
    }
  }

  cleanupOldBackups() {
    this.log('Cleaning up old backups (keeping 10)...', 'info');

    try {
      const backups = fs
        .readdirSync(BACKUP_PATH)
        .filter(f => f.endsWith('.zip'))
        .sort()
        .reverse();

      if (backups.length > 10) {
        const toDelete = backups.slice(10);
        toDelete.forEach(backup => {
          fs.unlinkSync(path.join(BACKUP_PATH, backup));
          this.log(`Deleted: ${backup}`, 'success');
        });
      }
    } catch (err) {
      this.log(`Cleanup failed: ${err.message}`, 'warn');
    }
  }

  showStatus() {
    this.log('Cloud Storage Status', 'info');

    console.log('\nProject Location (C:):');
    console.log(`  Path: ${this.projectPath}`);

    try {
      const size = this.getDirectorySize(this.projectPath) / (1024 * 1024);
      console.log(`  Size: ${size.toFixed(2)} MB`);
    } catch (err) {
      console.log(`  Size: Unable to calculate`);
    }

    console.log('\nCloud Storage (D:):');
    console.log(`  Path: ${this.cloudPath}`);

    if (fs.existsSync(this.cloudPath)) {
      console.log(`  Status: MOUNTED ✓`);

      try {
        const dirs = fs.readdirSync(this.cloudPath);
        console.log(`  Subfolders:`);
        dirs.forEach(dir => {
          const dirPath = path.join(this.cloudPath, dir);
          if (fs.statSync(dirPath).isDirectory()) {
            const size = (this.getDirectorySize(dirPath) / (1024 * 1024)).toFixed(2);
            console.log(`    - ${dir}: ${size} MB`);
          }
        });
      } catch (err) {
        console.log(`  Error reading contents: ${err.message}`);
      }
    } else {
      console.log(`  Status: NOT ACCESSIBLE ✗`);
    }

    console.log('\nAvailable Backups:');
    try {
      const backups = fs
        .readdirSync(BACKUP_PATH)
        .filter(f => f.endsWith('.zip'))
        .sort()
        .reverse()
        .slice(0, 5);

      if (backups.length === 0) {
        console.log('  No backups found');
      } else {
        backups.forEach(backup => {
          const filePath = path.join(BACKUP_PATH, backup);
          const size = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);
          const date = fs.statSync(filePath).mtime.toLocaleString();
          console.log(`  - ${backup} (${size} MB) - ${date}`);
        });
      }
    } catch (err) {
      console.log(`  Error reading backups: ${err.message}`);
    }
  }

  // Helper methods
  getFilesRecursive(dir) {
    let files = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        files = files.concat(this.getFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    });

    return files;
  }

  copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  getDirectorySize(dir) {
    let size = 0;
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          size += this.getDirectorySize(fullPath);
        } else {
          size += stat.size;
        }
      } catch (err) {
        // Skip inaccessible files
      }
    });

    return size;
  }
}

// CLI
const manager = new CloudStorageManager();
const command = process.argv[2] || 'status';

switch (command) {
  case 'init':
    manager.initializeCloud();
    break;
  case 'import':
    manager.importFromCloud();
    break;
  case 'export':
    manager.exportToCloud();
    break;
  case 'backup':
    manager.backupToCloud();
    break;
  case 'status':
  default:
    manager.showStatus();
    break;
}
