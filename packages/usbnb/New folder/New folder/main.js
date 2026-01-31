import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const branches = {
  main: { cmd: 'node', args: ['server.js'] },
  optimized: { cmd: 'node', args: ['server-optimized.js'] },
  universal: { cmd: 'node', args: ['server-universal.js'] },
  audio: { cmd: 'node', args: ['server-audio.js'] },
  api: { cmd: 'node', args: ['api/server.js'] },
  'api-optimized': { cmd: 'node', args: ['api/server-optimized.js'] },
  'api-universal': { cmd: 'node', args: ['api/server-universal.js'] },
  auth: { cmd: 'node', args: ['auth-ui/v750/server.js'] },
  dashboard: { cmd: 'npm', args: ['run', 'dev'], cwd: 'dashboard' },
  'real-time-overlay': { cmd: 'npm', args: ['run', 'dev'], cwd: 'challengerepo/real-time-overlay' },
  // add more as needed
};

const branch = process.argv[2];
if (!branch) {
  console.log('Usage: node main.js <branch>');
  console.log('Available branches:', Object.keys(branches).join(', '));
  process.exit(1);
}

const config = branches[branch];
if (!config) {
  console.log('Unknown branch:', branch);
  process.exit(1);
}

const options = { stdio: 'inherit' };
if (config.cwd) {
  options.cwd = join(__dirname, config.cwd);
}

console.log(`Starting ${branch} with ${config.cmd} ${config.args.join(' ')}`);

const child = spawn(config.cmd, config.args, options);
child.on('close', (code) => {
  console.log(`${branch} exited with code ${code}`);
});