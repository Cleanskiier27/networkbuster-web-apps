#!/usr/bin/env node

/**
 * NetworkBuster Power Management System
 * Option 2: Power Event Listener + Boot Command Injection
 * Option 4: Server Power Management + Config Backup
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

const PROJECT_PATH = 'C:\\Users\\daypi\\OneDrive\\Desktop\\networkbuster.net';
const FLASH_DRIVE_PATH = 'D:\\';
const BACKUP_PATH = 'D:\\networkbuster-cloud\\backups';
const COMMAND_LOG = path.join(PROJECT_PATH, '.power-commands.log');

class PowerManager {
  constructor(option = 2) {
    this.option = option;
    this.commands = [];
    this.servers = [
      { port: 3000, name: 'Web Server' },
      { port: 3001, name: 'API Server' },
      { port: 3002, name: 'Audio Server' },
      { port: 3003, name: 'Auth UI' }
    ];
  }

  log(msg, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${msg}`;
    console.log(logEntry);

    // Save to log file
    fs.appendFileSync(COMMAND_LOG, logEntry + '\n', { flag: 'a' });
  }

  // Option 2: Power Event Listener + Boot Command Injection
  initializePowerListener() {
    this.log('Initializing Power Event Listener (Option 2)', 'info');

    if (process.platform === 'win32') {
      this.setupWindowsPowerListener();
    } else if (process.platform === 'linux') {
      this.setupLinuxPowerListener();
    }
  }

  setupWindowsPowerListener() {
    this.log('Setting up Windows power event monitoring', 'info');

    // Monitor power state via WMI
    const powerScript = `
$query = "SELECT * FROM Win32_PowerManagementEvent"
$watcher = New-Object System.Management.ManagementEventWatcher $query

$watcher.EventArrived += {
  param($sender, $eventArgs)
  $event = $eventArgs.NewEvent
  
  if ($event.EventType -eq 4) {
    Write-Host "POWER_ON_EVENT"
  }
  elseif ($event.EventType -eq 18) {
    Write-Host "SUSPEND_EVENT"
  }
}

$watcher.Start()
Write-Host "Power event listener started"
[System.Console]::ReadLine()
$watcher.Stop()
`;

    fs.writeFileSync(path.join(PROJECT_PATH, 'power-listener.ps1'), powerScript);
    this.log('Power listener script created', 'success');

    // Start listener in background
    try {
      spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', 'power-listener.ps1'], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      this.log('Power listener started in background', 'success');
    } catch (err) {
      this.log(`Failed to start power listener: ${err.message}`, 'error');
    }
  }

  setupLinuxPowerListener() {
    this.log('Setting up Linux power event monitoring', 'info');

    const linuxScript = `#!/bin/bash
# Monitor power events on Linux
/usr/bin/monitor-power-state.sh &
echo "Power listener started"
`;

    fs.writeFileSync(path.join(PROJECT_PATH, 'power-listener.sh'), linuxScript, { mode: 0o755 });
    this.log('Power listener script created', 'success');
  }

  // Inject boot commands to USB flashdrive
  injectBootCommands() {
    this.log('Injecting boot commands to USB flashdrive', 'info');

    const bootCommands = [
      'BOOT_PRIORITY=NETWORK',
      'NETWORK_BOOT_ENABLED=1',
      'AUTO_STARTUP_SERVERS=1',
      'CONFIG_LOAD_SOURCE=CLOUD',
      'TIMESTAMP=' + new Date().toISOString()
    ];

    const bootFile = path.join(FLASH_DRIVE_PATH, 'networkbuster-boot.cmd');

    try {
      fs.writeFileSync(bootFile, bootCommands.join('\n'));
      this.log(`Boot commands written to USB: ${bootFile}`, 'success');
      this.commands.push({
        type: 'boot_injection',
        timestamp: new Date().toISOString(),
        target: bootFile,
        commands: bootCommands
      });
    } catch (err) {
      this.log(`Failed to write boot commands: ${err.message}`, 'error');
    }
  }

  // Option 4: Server Power Management + Config Backup
  managePower(action = 'status') {
    this.log(`Server Power Management - Action: ${action}`, 'info');

    switch (action) {
      case 'status':
        this.checkServerStatus();
        break;
      case 'start':
        this.startServers();
        break;
      case 'stop':
        this.stopServers();
        break;
      case 'restart':
        this.restartServers();
        break;
      case 'backup-config':
        this.backupConfigs();
        break;
      default:
        this.log(`Unknown action: ${action}`, 'warn');
    }
  }

  checkServerStatus() {
    this.log('Checking server status...', 'info');

    this.servers.forEach(server => {
      try {
        const response = execSync(`curl -s http://localhost:${server.port}/api/health`, {
          timeout: 2000,
          encoding: 'utf8'
        });

        const health = JSON.parse(response);
        if (health.status === 'ok' || health.status === 'healthy') {
          this.log(`${server.name} (${server.port}): UP`, 'success');
        } else {
          this.log(`${server.name} (${server.port}): DOWN`, 'warn');
        }
      } catch (err) {
        this.log(`${server.name} (${server.port}): UNREACHABLE`, 'error');
      }
    });
  }

  startServers() {
    this.log('Starting all servers...', 'info');

    try {
      spawn('node', ['start-servers.js'], {
        cwd: PROJECT_PATH,
        stdio: 'inherit'
      });

      this.log('All servers started', 'success');
      this.commands.push({
        type: 'server_start',
        timestamp: new Date().toISOString(),
        servers: this.servers.map(s => s.name)
      });
    } catch (err) {
      this.log(`Failed to start servers: ${err.message}`, 'error');
    }
  }

  stopServers() {
    this.log('Stopping all servers...', 'info');

    try {
      if (process.platform === 'win32') {
        execSync('Get-Process node | Stop-Process -Force', { shell: 'powershell' });
      } else {
        execSync('pkill -f "node start-servers.js"');
      }

      this.log('All servers stopped', 'success');
      this.commands.push({
        type: 'server_stop',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      this.log(`Failed to stop servers: ${err.message}`, 'warn');
    }
  }

  restartServers() {
    this.log('Restarting all servers...', 'info');
    this.stopServers();
    setTimeout(() => this.startServers(), 2000);
  }

  backupConfigs() {
    this.log('Backing up server configurations...', 'info');

    const configFiles = [
      'package.json',
      'docker-compose.yml',
      '.env',
      'auth-ui/v750/server.js',
      'api/server-universal.js'
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    const backupDir = path.join(BACKUP_PATH, `config-backup-${timestamp}`);

    try {
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      configFiles.forEach(file => {
        const src = path.join(PROJECT_PATH, file);
        const dest = path.join(backupDir, path.basename(file));

        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          this.log(`Backed up: ${file}`, 'success');
        }
      });

      // Create manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        backup_type: 'config',
        files: configFiles,
        location: backupDir
      };

      fs.writeFileSync(
        path.join(backupDir, 'MANIFEST.json'),
        JSON.stringify(manifest, null, 2)
      );

      this.log(`Configuration backup complete: ${backupDir}`, 'success');
      this.commands.push({
        type: 'config_backup',
        timestamp: new Date().toISOString(),
        location: backupDir,
        files: configFiles
      });
    } catch (err) {
      this.log(`Backup failed: ${err.message}`, 'error');
    }
  }

  // Create USB flashdrive with boot utilities
  setupUSBFlashdrive() {
    this.log('Setting up USB flashdrive...', 'info');

    const usbDirs = [
      path.join(FLASH_DRIVE_PATH, 'networkbuster'),
      path.join(FLASH_DRIVE_PATH, 'networkbuster/boot'),
      path.join(FLASH_DRIVE_PATH, 'networkbuster/config'),
      path.join(FLASH_DRIVE_PATH, 'networkbuster/scripts')
    ];

    usbDirs.forEach(dir => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log(`Created: ${dir}`, 'success');
        }
      } catch (err) {
        this.log(`Failed to create ${dir}: ${err.message}`, 'warn');
      }
    });

    // Copy boot utilities
    this.copyBootUtils();
  }

  copyBootUtils() {
    this.log('Copying boot utilities to USB...', 'info');

    const bootUtils = {
      'BOOT_STARTUP.bat': 'cd /d D:\\networkbuster && node start-servers.js',
      'SHUTDOWN_SERVERS.bat': 'taskkill /IM node.exe /F',
      'CHECK_STATUS.bat': 'curl http://localhost:3000/api/health'
    };

    Object.entries(bootUtils).forEach(([filename, content]) => {
      const filePath = path.join(FLASH_DRIVE_PATH, 'networkbuster/scripts', filename);
      try {
        fs.writeFileSync(filePath, content);
        this.log(`Created boot utility: ${filename}`, 'success');
      } catch (err) {
        this.log(`Failed to create ${filename}: ${err.message}`, 'warn');
      }
    });
  }

  // Save command log and archive
  archiveCommands() {
    this.log('Archiving power commands...', 'info');

    const archive = {
      timestamp: new Date().toISOString(),
      total_commands: this.commands.length,
      commands: this.commands,
      option: this.option
    };

    const archivePath = path.join(BACKUP_PATH, `power-commands-${Date.now()}.json`);

    try {
      fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
      this.log(`Commands archived: ${archivePath}`, 'success');
    } catch (err) {
      this.log(`Failed to archive commands: ${err.message}`, 'error');
    }
  }

  // Main execution
  execute() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  NetworkBuster Power Management System                     ║
║  Option ${this.option}: ${this.option === 2 ? 'Boot Commands' : 'Server Power Mgmt'}                    ║
╚════════════════════════════════════════════════════════════╝
`);

    if (this.option === 2) {
      this.initializePowerListener();
      this.injectBootCommands();
      this.setupUSBFlashdrive();
    } else if (this.option === 4) {
      this.managePower('status');
      this.backupConfigs();
      this.checkServerStatus();
    }

    this.archiveCommands();

    this.log('Power management system ready', 'success');
  }
}

// Execute based on command line argument
const option = parseInt(process.argv[2]) || 2;
const action = process.argv[3] || null;

const manager = new PowerManager(option);

if (action) {
  manager.managePower(action);
} else {
  manager.execute();
}
