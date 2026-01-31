import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Optional performance packages with fallbacks
let compression = null;
let helmet = null;
let cors = null;

try {
  compression = (await import('compression')).default;
} catch {
  console.warn('⚠️  compression module not found - continuing without gzip');
}

try {
  helmet = (await import('helmet')).default;
} catch {
  console.warn('⚠️  helmet module not found - continuing without security headers');
}

try {
  cors = (await import('cors')).default;
} catch {
  console.warn('⚠️  cors module not found - continuing without CORS middleware');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Trust Azure/ingress proxy and hide stack info
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Performance: Apply optional middleware safely
if (compression) app.use(compression());
if (helmet) app.use(helmet());

// HSTS (only if not explicitly disabled)
if (process.env.ENABLE_HSTS !== 'false') {
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    next();
  });
}

// Basic CORS allowlist without dependency fallbacks
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://networkbuster.net,http://localhost:3000').split(',').map(o => o.trim());
const applyCors = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};

if (cors) {
  app.use(cors({ origin: allowedOrigins, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
} else {
  app.use(applyCors);
}

// Middleware (always required)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// In-memory rate limiting (simple sliding window)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 300);
const rateLimitStore = new Map();

app.use((req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const entry = rateLimitStore.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateLimitStore.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }
  next();
});

// Application state
const appState = {
  startTime: Date.now(),
  requestCount: 0,
  status: 'running',
  uptime: 0,
  lastAction: null,
  logs: []
};

// Helper function to add logs
function addLog(action, details = '') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${action} ${details}`;
  appState.logs.push(logEntry);
  if (appState.logs.length > 50) {
    appState.logs.shift();
  }
  console.log(logEntry);
}

// Minimal bearer protection for privileged actions
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(403).json({ error: 'Admin token not configured' });
  const auth = req.headers.authorization || '';
  if (auth === `Bearer ${ADMIN_TOKEN}`) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Update uptime
setInterval(() => {
  appState.uptime = Math.floor((Date.now() - appState.startTime) / 1000);
}, 5000);

// Request counter middleware
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  appState.requestCount = requestCount;
  next();
});

// ============================================
// OPERATIONAL API ENDPOINTS
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=5');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: appState.uptime,
    requestCount: appState.requestCount,
    port: PORT
  });
});

// Get system status
app.get('/api/status', (req, res) => {
  res.set('Cache-Control', 'public, max-age=5');
  const memUsage = process.memoryUsage();
  res.json({
    status: appState.status,
    uptime: appState.uptime,
    requestCount: appState.requestCount,
    startTime: new Date(appState.startTime).toISOString(),
    lastAction: appState.lastAction,
    systemInfo: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memoryUsage: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024)
    }
  });
});

// Get application logs
app.get('/api/logs', (req, res) => {
  res.json({
    logs: appState.logs,
    count: appState.logs.length
  });
});

// Clear logs
app.post('/api/logs/clear', requireAdmin, (req, res) => {
  appState.logs = [];
  appState.lastAction = 'Logs cleared';
  addLog('Cleared logs');
  res.json({ message: 'Logs cleared successfully', timestamp: new Date().toISOString() });
});

// Restart application indicator
app.post('/api/restart', requireAdmin, (req, res) => {
  appState.lastAction = 'Restart initiated';
  addLog('Restart requested');
  res.json({
    message: 'Application restart requested',
    timestamp: new Date().toISOString(),
    action: 'restart'
  });
});

// Get component status
app.get('/api/components', (req, res) => {
  res.set('Cache-Control', 'public, max-age=10');
  res.json({
    components: {
      webApp: { status: 'running', path: '/', port: PORT },
      dashboard: { status: 'running', path: '/dashboard', port: PORT },
      overlay: { status: 'running', path: '/overlay', port: PORT },
      blog: { status: 'running', path: '/blog', port: PORT },
      api: { status: 'running', path: '/api', port: PORT }
    },
    timestamp: new Date().toISOString()
  });
});

// Toggle feature endpoint
app.post('/api/toggle/:feature', requireAdmin, (req, res) => {
  const { feature } = req.params;
  const isEnabled = req.body?.enabled !== false;
  appState.lastAction = `Feature ${feature} toggled: ${isEnabled}`;
  addLog(`Toggled ${feature}`, `enabled: ${isEnabled}`);
  res.json({
    feature,
    enabled: isEnabled,
    message: `${feature} is now ${isEnabled ? 'enabled' : 'disabled'}`,
    timestamp: new Date().toISOString()
  });
});

// Control panel route with music player and equalizer
app.get('/control-panel', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NetworkBuster Control Panel</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}.container{max-width:1200px;margin:0 auto}.header{text-align:center;color:#fff;margin-bottom:30px}.header h1{font-size:2.5em;margin-bottom:10px}.status-bar{background:rgba(255,255,255,.95);padding:20px;border-radius:10px;margin-bottom:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}.status-item{padding:15px;background:#f8f9fa;border-radius:8px;border-left:4px solid #667eea}.status-label{font-size:.9em;color:#666;margin-bottom:5px;font-weight:600}.status-value{font-size:1.5em;color:#333;font-weight:bold}.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px}.control-section{background:rgba(255,255,255,.95);padding:25px;border-radius:10px}.section-title{font-size:1.2em;font-weight:700;color:#333;margin-bottom:20px}.button-group{display:flex;flex-direction:column;gap:10px}button{padding:12px 20px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;transition:all .3s;color:#fff}.btn-success{background:#48bb78}.btn-success:hover{background:#38a169;transform:translateY(-2px)}.btn-primary{background:#667eea}.btn-primary:hover{background:#5568d3;transform:translateY(-2px)}.btn-info{background:#4299e1}.btn-info:hover{background:#3182ce;transform:translateY(-2px)}.btn-warning{background:#ed8936}.btn-warning:hover{background:#dd6b20;transform:translateY(-2px)}.btn-danger{background:#f56565}.btn-danger:hover{background:#e53e3e;transform:translateY(-2px)}.alert{padding:12px 16px;border-radius:6px;margin-bottom:15px}.alert-success{background:#c6f6d5;color:#22543d}.alert-error{background:#fed7d7;color:#742a2a}.alert-info{background:#bee3f8;color:#2c5282}.logs-container{background:rgba(255,255,255,.95);padding:25px;border-radius:10px}.logs-list{background:#1a202c;color:#a0aec0;padding:15px;border-radius:6px;max-height:300px;overflow-y:auto;font-family:monospace;font-size:.9em;line-height:1.6}.music-player{background:rgba(255,255,255,.95);padding:25px;border-radius:10px;margin-bottom:30px}.music-title{font-size:1.4em;font-weight:700;color:#333;margin-bottom:15px;display:flex;align-items:center;gap:10px}.music-title::before{content:"🎵";font-size:1.5em}.audio-player{width:100%;border-radius:6px;margin-bottom:15px}.volume-control{margin-bottom:20px;display:flex;align-items:center;gap:10px}.volume-control label{color:#333;font-weight:600;min-width:80px}.volume-control input{flex:1;cursor:pointer}.equalizer-section{background:#f8f9fa;padding:15px;border-radius:6px;margin-top:15px}.equalizer-title{font-size:.95em;font-weight:700;color:#333;margin-bottom:15px}.equalizer-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:15px}.eq-band{display:flex;flex-direction:column;align-items:center;gap:8px}.eq-label{font-size:.85em;font-weight:600;color:#666}.eq-slider{width:60px;height:150px;writing-mode:bt-lr;-webkit-appearance:slider-vertical;appearance:slider-vertical}.eq-value{font-size:.8em;color:#999;font-weight:500}</style></head><body><div class="container"><div class="header"><h1>Control Panel</h1><p>NetworkBuster Operational Dashboard</p></div><div class="status-bar"><div class="status-item"><div class="status-label">Status</div><div class="status-value" id="statusValue">Running</div></div><div class="status-item"><div class="status-label">Uptime</div><div class="status-value" id="uptimeValue">0s</div></div><div class="status-item"><div class="status-label">Requests</div><div class="status-value" id="requestsValue">0</div></div></div><div class="music-player"><div class="music-title">Now Playing: Rocketman 🚀</div><audio class="audio-player" id="musicPlayer" controls><source src="https://open.spotify.com/embed/track/3z8h0TU7RvxVfncKcFK3hk" type="audio/mpeg"><p>Your browser does not support the audio element. <a href="https://open.spotify.com/track/3z8h0TU7RvxVfncKcFK3hk" target="_blank">Listen on Spotify →</a></p></audio><div class="volume-control"><label for="volumeSlider">Master Volume:</label><input type="range" id="volumeSlider" min="0" max="100" value="30" oninput="setMasterVolume(this.value)"><span id="volumeValue">30%</span><button class="btn-primary" style="padding:8px 12px;font-size:0.9em;margin-left:10px" id="volumeToggle" onclick="toggleVolume()">🔊 Mute</button></div><div class="equalizer-section"><div class="equalizer-title">🎛️ Equalizer</div><div class="equalizer-controls"><div class="eq-band"><label class="eq-label">Bass</label><input type="range" class="eq-slider" id="bassBand" min="-20" max="20" value="0" oninput="updateEQ('bass',this.value)"><div class="eq-value" id="bassValue">0dB</div></div><div class="eq-band"><label class="eq-label">Low Mid</label><input type="range" class="eq-slider" id="lowMidBand" min="-20" max="20" value="0" oninput="updateEQ('lowMid',this.value)"><div class="eq-value" id="lowMidValue">0dB</div></div><div class="eq-band"><label class="eq-label">Mid</label><input type="range" class="eq-slider" id="midBand" min="-20" max="20" value="0" oninput="updateEQ('mid',this.value)"><div class="eq-value" id="midValue">0dB</div></div><div class="eq-band"><label class="eq-label">High Mid</label><input type="range" class="eq-slider" id="highMidBand" min="-20" max="20" value="0" oninput="updateEQ('highMid',this.value)"><div class="eq-value" id="highMidValue">0dB</div></div><div class="eq-band"><label class="eq-label">Treble</label><input type="range" class="eq-slider" id="trebleBand" min="-20" max="20" value="0" oninput="updateEQ('treble',this.value)"><div class="eq-value" id="trebleValue">0dB</div></div></div><button class="btn-primary" style="margin-top:15px;width:100%" onclick="resetEQ()">Reset Equalizer</button></div></div><div class="controls"><div class="control-section"><div class="section-title">Controls</div><div class="button-group"><button class="btn-success" onclick="checkHealth()">Health Check</button><button class="btn-info" onclick="getStatus()">System Info</button><button class="btn-danger" onclick="restartApp()">Restart</button></div></div></div><div class="logs-container"><div class="logs-list" id="logsList">Loading logs...</div></div></div><script>const eqPresets={acoustic:{bass:10,lowMid:5,mid:-5,highMid:10,treble:8},rock:{bass:15,lowMid:8,mid:-3,highMid:5,treble:10},pop:{bass:5,lowMid:0,mid:5,highMid:8,treble:5},jazz:{bass:8,lowMid:3,mid:2,highMid:6,treble:4},electronic:{bass:20,lowMid:0,mid:0,highMid:-5,treble:15}};let lastVolume=30;function toggleVolume(){const player=document.getElementById('musicPlayer');const toggle=document.getElementById('volumeToggle');const slider=document.getElementById('volumeSlider');if(player.volume>0){lastVolume=Math.round(player.volume*100);player.volume=0;toggle.textContent='🔇 Unmute';document.getElementById('volumeValue').textContent='MUTE'}else{player.volume=lastVolume/100;slider.value=lastVolume;toggle.textContent='🔊 Mute';document.getElementById('volumeValue').textContent=lastVolume+'%'}}function setMasterVolume(v){document.getElementById('musicPlayer').volume=v/100;document.getElementById('volumeValue').textContent=v+'%';const toggle=document.getElementById('volumeToggle');if(v>0){toggle.textContent='🔊 Mute'}else{toggle.textContent='🔇 Unmute'}}function updateEQ(band,value){document.getElementById(band+'Value').textContent=value+'dB'}function resetEQ(){document.getElementById('bassBand').value=0;document.getElementById('lowMidBand').value=0;document.getElementById('midBand').value=0;document.getElementById('highMidBand').value=0;document.getElementById('trebleBand').value=0;updateEQ('bass',0);updateEQ('lowMid',0);updateEQ('mid',0);updateEQ('highMid',0);updateEQ('treble',0)}function updateStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{document.getElementById('statusValue').textContent=d.status;document.getElementById('uptimeValue').textContent=formatUptime(d.uptime);document.getElementById('requestsValue').textContent=d.requestCount}).catch(e=>console.error(e))}function formatUptime(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h>0?h+'h '+m+'m':m+'m'}function checkHealth(){fetch('/api/health').then(r=>r.json()).then(d=>alert('Healthy! Uptime: '+formatUptime(d.uptime))).catch(e=>alert('Failed'))}function getStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{const m=d.systemInfo.memoryUsage;alert('Platform: '+d.systemInfo.platform+' | CPUs: '+d.systemInfo.cpus+' | Memory: '+m.heapUsed+'MB')}).catch(e=>alert('Failed'))}function restartApp(){fetch('/api/restart',{method:'POST'}).catch(e=>console.error(e))}setInterval(updateStatus,5000);updateStatus();setMasterVolume(30)</script></body></html>`);
});

// Serve static files (if they exist)
const staticPaths = [
  { prefix: '/blog', dir: 'blog' },
  { prefix: '/dashboard', dir: 'dashboard/dist' },
  { prefix: '/overlay', dir: 'challengerepo/real-time-overlay/dist' },
  { prefix: '/', dir: 'web-app' }
];

staticPaths.forEach(({ prefix, dir }) => {
  const fullPath = path.join(__dirname, dir);
  try {
    app.use(prefix, express.static(fullPath, { maxAge: '24h' }));
  } catch (err) {
    console.warn(`⚠️  Static path not found: ${fullPath}`);
  }
});

// SPA fallbacks (safe) - use regex instead of wildcard
const dashboardPath = path.join(__dirname, 'dashboard/dist/index.html');
const overlayPath = path.join(__dirname, 'web-app/overlay.html');
const challengeOverlayPath = path.join(__dirname, 'challengerepo/real-time-overlay/dist/index.html');

// AI Robot endpoint using Azure OpenAI (set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT)
app.post('/api/robot', async (req, res) => {
  const { prompt = 'Analyze lunar recycling and space materials. Summarize risks and opportunities.' } = req.body || {};
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!endpoint || !apiKey || !deployment) {
    return res.status(500).json({
      error: 'Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT.'
    });
  }

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
  const body = {
    messages: [
      { role: 'system', content: 'You are NetBot, an expert in recycling, lunar regolith processing, and space materials.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 512,
    temperature: 0.2
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'OpenAI request failed', details: text });
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content || 'No response generated.';
    res.json({ message, usage: data?.usage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to call Azure OpenAI', details: err.message });
  }
});

app.get(/^\/dashboard(.*)$/, (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.sendFile(dashboardPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Dashboard not found' });
    }
  });
});

// AI World / Overlay page
app.get(/^\/overlay(.*)$/, (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.sendFile(overlayPath, (err) => {
    if (err) {
      // Fallback to challenge repo version
      res.sendFile(challengeOverlayPath, (err2) => {
        if (err2) {
          res.status(404).json({ error: 'Overlay not found' });
        }
      });
    }
  });
});

// Auth UI redirect
app.get('/auth', (req, res) => res.redirect('/auth/'));
app.get('/auth/', (req, res) => {
  res.redirect('http://localhost:3003');
});

// Audio Lab redirect
app.get('/audio-lab', (req, res) => {
  res.redirect('http://localhost:3002/audio-lab');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`⚡ Features:`);
  if (compression) console.log(`   ✓ Compression enabled`);
  if (helmet) console.log(`   ✓ Security headers enabled`);
  console.log(`   ✓ Health checks available`);
  console.log(`   ✓ Control panel: /control-panel`);
  console.log(`   ✓ API: /api/*\n`);
  addLog('Server started', `Port: ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
