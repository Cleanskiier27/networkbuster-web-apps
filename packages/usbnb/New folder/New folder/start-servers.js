#!/usr/bin/env node

/**
 * NetworkBuster Multi-Server Launcher
 * Starts Web, API, and Audio servers
 * Works on Windows, macOS, and Linux
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔════════════════════════════════════════════════════════════╗
║  NetworkBuster Local Development                           ║
║  Starting 3 Servers WITHOUT Docker                         ║
╚════════════════════════════════════════════════════════════╝
`);

const servers = [
  {
    name: 'Web Server',
    file: 'server-universal.js',
    port: 3000
  },
  {
    name: 'API Server',
    file: 'api/server-universal.js',
    port: 3001
  },
  {
    name: 'Audio Server',
    file: 'server-audio.js',
    port: 3002
  }
];

const processes = [];

// Start each server
servers.forEach((server, index) => {
  setTimeout(() => {
    console.log(`\n[${index + 1}/3] Starting ${server.name} on port ${server.port}...`);
    
    const proc = spawn('node', [server.file], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    processes.push(proc);

    proc.on('error', (err) => {
      console.error(`ERROR starting ${server.name}:`, err.message);
    });

    proc.on('exit', (code) => {
      console.log(`\n[${server.name}] Process exited with code ${code}`);
    });
  }, index * 2000);
});

// Display info after all servers start
setTimeout(() => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  All Servers Started!                                      ║
╚════════════════════════════════════════════════════════════╝

Services Available:
  [WEB]   http://localhost:3000
  [API]   http://localhost:3001
  [AUDIO] http://localhost:3002/audio-lab

Test URLs:
  http://localhost:3000              - Main dashboard with music player
  http://localhost:3000/control-panel - Control panel & equalizer
  http://localhost:3001/api/health    - API health check
  http://localhost:3001/api/specs     - System specifications
  http://localhost:3002/audio-lab     - Audio synthesis and analysis lab

Quick Commands:
  curl http://localhost:3000/api/health
  curl http://localhost:3001/api/specs
  curl -X POST http://localhost:3002/api/audio/stream/create

Press Ctrl+C to stop all servers.
`);
}, 8000);

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down all servers...');
  processes.forEach(proc => {
    if (!proc.killed) {
      proc.kill('SIGTERM');
    }
  });

  setTimeout(() => {
    console.log('All servers stopped.');
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down...');
  processes.forEach(proc => {
    if (!proc.killed) {
      proc.kill('SIGTERM');
    }
  });
  process.exit(0);
});
