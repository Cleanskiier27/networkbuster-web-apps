#!/usr/bin/env node

/**
 * NetworkBuster Flash USB Upgrade Service
 * Docker-based terminal flash upgrade system
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// State
const state = {
  usbConnected: false,
  usbDevice: process.env.USB_DEVICE || '/dev/sda1',
  usbMountPath: '/mnt/usb',
  flashMode: process.env.FLASH_MODE || 'upgrade',
  lastUpgrade: null,
  upgrades: []
};

// Detect USB devices
function detectUSB() {
  try {
    const devices = execSync('lsblk -J -o NAME,SIZE,TYPE,MOUNTPOINT 2>/dev/null || echo "{}"', { encoding: 'utf8' });
    const parsed = JSON.parse(devices);
    return parsed.blockdevices || [];
  } catch (err) {
    console.log('USB detection not available (Windows mode)');
    // Windows fallback - check D: drive
    if (fs.existsSync('D:\\')) {
      return [{ name: 'D:', size: 'Unknown', type: 'disk', mountpoint: 'D:\\' }];
    }
    return [];
  }
}

// Mount USB
function mountUSB(device) {
  try {
    execSync(`mount ${device} ${state.usbMountPath} 2>/dev/null || true`);
    state.usbConnected = true;
    return true;
  } catch (err) {
    // Windows - D: is already mounted
    if (fs.existsSync('D:\\')) {
      state.usbMountPath = 'D:\\';
      state.usbConnected = true;
      return true;
    }
    return false;
  }
}

// Create boot commands
function createBootCommands() {
  const bootConfig = {
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    commands: [
      'BOOT_PRIORITY=NETWORK',
      'NETWORK_BOOT_ENABLED=1',
      'AUTO_STARTUP_SERVERS=1',
      'CONFIG_LOAD_SOURCE=CLOUD',
      'FLASH_UPGRADE_MODE=ACTIVE'
    ],
    autoStart: {
      webServer: { port: 3000, enabled: true },
      apiServer: { port: 3001, enabled: true },
      audioServer: { port: 3002, enabled: true },
      authServer: { port: 3003, enabled: true }
    }
  };

  return bootConfig;
}

// Write upgrade files to USB
function writeUpgradeFiles() {
  const usbPath = state.usbMountPath;
  const upgradeDir = path.join(usbPath, 'networkbuster-upgrade');

  try {
    // Create directories
    if (!fs.existsSync(upgradeDir)) {
      fs.mkdirSync(upgradeDir, { recursive: true });
    }

    // Write boot config
    const bootConfig = createBootCommands();
    fs.writeFileSync(
      path.join(upgradeDir, 'boot-config.json'),
      JSON.stringify(bootConfig, null, 2)
    );

    // Write startup script (Windows batch)
    const startupBat = `@echo off
REM NetworkBuster Auto-Start Script
cd /d %~dp0\\..
echo Starting NetworkBuster servers...
node start-servers.js
pause
`;
    fs.writeFileSync(path.join(upgradeDir, 'startup.bat'), startupBat);

    // Write startup script (Linux/Mac)
    const startupSh = `#!/bin/bash
# NetworkBuster Auto-Start Script
cd "$(dirname "$0")/.."
echo "Starting NetworkBuster servers..."
node start-servers.js
`;
    fs.writeFileSync(path.join(upgradeDir, 'startup.sh'), startupSh, { mode: 0o755 });

    // Write autorun.inf for Windows
    const autorun = `[autorun]
open=networkbuster-upgrade\\startup.bat
icon=networkbuster-upgrade\\icon.ico
label=NetworkBuster USB
`;
    fs.writeFileSync(path.join(usbPath, 'autorun.inf'), autorun);

    // Write manifest
    const manifest = {
      name: 'NetworkBuster Flash Upgrade',
      version: '1.0.1',
      created: new Date().toISOString(),
      files: [
        'boot-config.json',
        'startup.bat',
        'startup.sh',
        '../autorun.inf'
      ],
      servers: {
        web: 3000,
        api: 3001,
        audio: 3002,
        auth: 3003
      }
    };
    fs.writeFileSync(
      path.join(upgradeDir, 'MANIFEST.json'),
      JSON.stringify(manifest, null, 2)
    );

    state.lastUpgrade = new Date().toISOString();
    state.upgrades.push({
      timestamp: state.lastUpgrade,
      path: upgradeDir,
      files: manifest.files
    });

    return { success: true, path: upgradeDir, manifest };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Copy project files to USB
function copyProjectToUSB() {
  const usbPath = state.usbMountPath;
  const projectDir = path.join(usbPath, 'networkbuster');

  try {
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    // Key files to copy
    const filesToCopy = [
      'package.json',
      'server-universal.js',
      'server-audio.js',
      'start-servers.js',
      'power-manager.js',
      'build-pipeline.js'
    ];

    let copied = [];
    for (const file of filesToCopy) {
      const src = path.join(__dirname, file);
      const dest = path.join(projectDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        copied.push(file);
      }
    }

    return { success: true, copied, path: projectDir };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'flash-upgrade',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Get USB status
app.get('/api/usb/status', (req, res) => {
  const devices = detectUSB();
  res.json({
    connected: state.usbConnected,
    device: state.usbDevice,
    mountPath: state.usbMountPath,
    devices,
    lastUpgrade: state.lastUpgrade
  });
});

// Detect USB devices
app.get('/api/usb/detect', (req, res) => {
  const devices = detectUSB();
  res.json({ devices, count: devices.length });
});

// Mount USB
app.post('/api/usb/mount', (req, res) => {
  const { device } = req.body;
  const result = mountUSB(device || state.usbDevice);
  res.json({
    success: result,
    mounted: state.usbConnected,
    mountPath: state.usbMountPath
  });
});

// Create flash upgrade
app.post('/api/flash/upgrade', (req, res) => {
  if (!state.usbConnected) {
    mountUSB(state.usbDevice);
  }

  const upgradeResult = writeUpgradeFiles();
  if (upgradeResult.success) {
    const copyResult = copyProjectToUSB();
    res.json({
      success: true,
      upgrade: upgradeResult,
      project: copyResult,
      message: 'Flash upgrade created successfully'
    });
  } else {
    res.status(500).json(upgradeResult);
  }
});

// Get upgrade history
app.get('/api/flash/history', (req, res) => {
  res.json({
    upgrades: state.upgrades,
    count: state.upgrades.length,
    lastUpgrade: state.lastUpgrade
  });
});

// Create boot config only
app.post('/api/flash/boot-config', (req, res) => {
  const bootConfig = createBootCommands();
  res.json(bootConfig);
});

// Eject USB safely
app.post('/api/usb/eject', (req, res) => {
  try {
    execSync(`umount ${state.usbMountPath} 2>/dev/null || true`);
    state.usbConnected = false;
    res.json({ success: true, message: 'USB ejected safely' });
  } catch (err) {
    res.json({ success: true, message: 'Eject command sent (Windows: safe to remove)' });
  }
});

// Dashboard HTML
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Flash USB Upgrade - NetworkBuster</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#0f172a;color:#f8fafc;min-height:100vh;padding:40px}
.container{max-width:800px;margin:0 auto}
h1{font-size:2em;margin-bottom:10px;color:#00f0ff}
.subtitle{color:#94a3b8;margin-bottom:30px}
.card{background:#1e293b;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #334155}
.card h2{color:#00f0ff;margin-bottom:16px;font-size:1.2em}
.status{display:flex;gap:20px;flex-wrap:wrap}
.status-item{background:#0f172a;padding:16px;border-radius:8px;min-width:150px}
.status-label{color:#64748b;font-size:0.85em;margin-bottom:4px}
.status-value{font-size:1.4em;font-weight:bold}
.status-value.online{color:#10b981}
.status-value.offline{color:#ef4444}
.btn{padding:12px 24px;border:none;border-radius:8px;font-size:1em;font-weight:600;cursor:pointer;margin:5px}
.btn-primary{background:linear-gradient(135deg,#00f0ff,#6366f1);color:#000}
.btn-success{background:#10b981;color:#fff}
.btn-warning{background:#f59e0b;color:#000}
.btn-danger{background:#ef4444;color:#fff}
.btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.3)}
.log{background:#0f172a;padding:16px;border-radius:8px;font-family:monospace;font-size:0.9em;max-height:200px;overflow-y:auto;color:#94a3b8}
</style>
</head><body>
<div class="container">
<h1>⚡ Flash USB Upgrade</h1>
<p class="subtitle">NetworkBuster Terminal Flash System</p>

<div class="card">
<h2>🔌 USB Status</h2>
<div class="status">
<div class="status-item"><div class="status-label">Connection</div><div class="status-value" id="usbStatus">Checking...</div></div>
<div class="status-item"><div class="status-label">Mount Path</div><div class="status-value" id="mountPath">-</div></div>
<div class="status-item"><div class="status-label">Last Upgrade</div><div class="status-value" id="lastUpgrade">Never</div></div>
</div>
</div>

<div class="card">
<h2>🚀 Actions</h2>
<button class="btn btn-primary" onclick="detectUSB()">Detect USB</button>
<button class="btn btn-success" onclick="createUpgrade()">Create Flash Upgrade</button>
<button class="btn btn-warning" onclick="createBootConfig()">Boot Config Only</button>
<button class="btn btn-danger" onclick="ejectUSB()">Eject USB</button>
</div>

<div class="card">
<h2>📋 Log</h2>
<div class="log" id="log">Ready...</div>
</div>
</div>

<script>
function log(msg){document.getElementById('log').innerHTML+=new Date().toLocaleTimeString()+' - '+msg+'<br>'}
function updateStatus(){
fetch('/api/usb/status').then(r=>r.json()).then(d=>{
document.getElementById('usbStatus').textContent=d.connected?'Connected':'Disconnected';
document.getElementById('usbStatus').className='status-value '+(d.connected?'online':'offline');
document.getElementById('mountPath').textContent=d.mountPath||'-';
document.getElementById('lastUpgrade').textContent=d.lastUpgrade?new Date(d.lastUpgrade).toLocaleString():'Never';
})}
function detectUSB(){fetch('/api/usb/detect').then(r=>r.json()).then(d=>{log('Found '+d.count+' USB devices');updateStatus()})}
function createUpgrade(){log('Creating flash upgrade...');fetch('/api/flash/upgrade',{method:'POST'}).then(r=>r.json()).then(d=>{log(d.success?'Upgrade created: '+d.upgrade.path:'Error: '+d.error);updateStatus()})}
function createBootConfig(){fetch('/api/flash/boot-config',{method:'POST'}).then(r=>r.json()).then(d=>{log('Boot config: '+d.commands.length+' commands');console.log(d)})}
function ejectUSB(){fetch('/api/usb/eject',{method:'POST'}).then(r=>r.json()).then(d=>{log(d.message);updateStatus()})}
updateStatus();setInterval(updateStatus,5000);
</script>
</body></html>`);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  NetworkBuster Flash USB Upgrade Service                  ║
║  Port: ${PORT}                                              ║
╚═══════════════════════════════════════════════════════════╝

Endpoints:
  GET  /health           - Health check
  GET  /api/usb/status   - USB connection status
  GET  /api/usb/detect   - Detect USB devices
  POST /api/usb/mount    - Mount USB device
  POST /api/flash/upgrade - Create flash upgrade
  POST /api/flash/boot-config - Create boot config
  POST /api/usb/eject    - Safely eject USB

Dashboard: http://localhost:${PORT}
`);

  // Auto-detect USB on startup
  const devices = detectUSB();
  if (devices.length > 0) {
    console.log(`Found ${devices.length} USB device(s)`);
    mountUSB(state.usbDevice);
  }
});
