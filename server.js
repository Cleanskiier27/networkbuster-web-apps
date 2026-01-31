import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  if (appState.logs.length > 100) {
    appState.logs.shift();
  }
  console.log(logEntry);
}

// Update uptime
setInterval(() => {
  appState.uptime = Math.floor((Date.now() - appState.startTime) / 1000);
}, 1000);

// Request counter middleware
app.use((req, res, next) => {
  appState.requestCount++;
  next();
});

// ============================================
// OPERATIONAL API ENDPOINTS
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
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
      memoryUsage: process.memoryUsage(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
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
app.post('/api/logs/clear', (req, res) => {
  appState.logs = [];
  appState.lastAction = 'Logs cleared';
  addLog('Cleared logs');
  res.json({ message: 'Logs cleared successfully', timestamp: new Date().toISOString() });
});

// Restart application indicator
app.post('/api/restart', (req, res) => {
  appState.lastAction = 'Restart initiated';
  addLog('Restart requested');
  res.json({
    message: 'Application restart requested',
    timestamp: new Date().toISOString(),
    action: 'restart'
  });
});

// ============================================
// COMPREHENSIVE DASHBOARD API ENDPOINTS
// ============================================

// Get dashboard metrics
app.get('/api/dashboard/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    activeUsers: Math.floor(Math.random() * 2000) + 500,
    totalRequests: appState.requestCount,
    avgResponseTime: Math.floor(Math.random() * 100) + 20,
    errorRate: (Math.random() * 0.5).toFixed(2),
    uptime: appState.uptime,
    cpuUsage: Math.floor(Math.random() * 80),
    memoryUsage: Math.round(memUsage.heapUsed / 1024 / 1024),
    totalMemory: Math.round(memUsage.heapTotal / 1024 / 1024),
    networkBandwidth: Math.floor(Math.random() * 1000) + 100,
    timestamp: new Date().toISOString()
  });
});

// Get dashboard charts data
app.get('/api/dashboard/charts', (req, res) => {
  const chartData = {
    requestVolume: [
      { time: '12:00', requests: Math.floor(Math.random() * 500) + 100 },
      { time: '12:15', requests: Math.floor(Math.random() * 500) + 150 },
      { time: '12:30', requests: Math.floor(Math.random() * 500) + 200 },
      { time: '12:45', requests: Math.floor(Math.random() * 500) + 250 },
      { time: '13:00', requests: Math.floor(Math.random() * 500) + 300 }
    ],
    latencyTrend: [
      { time: '12:00', latency: 45 },
      { time: '12:15', latency: 42 },
      { time: '12:30', latency: 38 },
      { time: '12:45', latency: 41 },
      { time: '13:00', latency: 39 }
    ],
    cpuUsage: [
      { component: 'API Server', usage: 35 },
      { component: 'Database', usage: 28 },
      { component: 'Cache', usage: 15 },
      { component: 'Workers', usage: 22 }
    ]
  };
  res.json(chartData);
});

// Get service status
app.get('/api/dashboard/services', (req, res) => {
  const services = [
    { name: 'API Server', status: 'healthy', uptime: '99.99%', responseTime: '45ms' },
    { name: 'Database', status: 'healthy', uptime: '99.95%', responseTime: '12ms' },
    { name: 'Cache (Redis)', status: 'healthy', uptime: '100%', responseTime: '2ms' },
    { name: 'Message Queue', status: 'healthy', uptime: '99.98%', responseTime: '8ms' },
    { name: 'Search Engine', status: 'healthy', uptime: '99.90%', responseTime: '78ms' },
    { name: 'Background Jobs', status: 'warning', uptime: '99.85%', responseTime: '234ms' }
  ];
  res.json(services);
});

// Get dashboard activity feed
app.get('/api/dashboard/activity', (req, res) => {
  const activity = [
    { time: new Date(Date.now() - 60000).toISOString(), event: 'User login detected', severity: 'info' },
    { time: new Date(Date.now() - 120000).toISOString(), event: 'Database backup completed', severity: 'success' },
    { time: new Date(Date.now() - 180000).toISOString(), event: 'API rate limit warning', severity: 'warning' },
    { time: new Date(Date.now() - 240000).toISOString(), event: 'Cache invalidation triggered', severity: 'info' }
  ];
  res.json(activity);
});

// ============================================
// COMPREHENSIVE SECRETS MANAGEMENT ENDPOINTS
// ============================================

// In-memory secrets storage
const secretsStore = [
  { id: '1', name: 'github_token', environment: 'production', status: 'active', created: new Date(Date.now() - 86400000), expires: null, masked: '****...e3k9' },
  { id: '2', name: 'api_key_stripe', environment: 'production', status: 'active', created: new Date(Date.now() - 172800000), expires: new Date(Date.now() + 30*86400000), masked: '****...x8p2' },
  { id: '3', name: 'db_password', environment: 'production', status: 'active', created: new Date(Date.now() - 259200000), expires: null, masked: '****...q9l1' },
  { id: '4', name: 'auth_secret', environment: 'staging', status: 'active', created: new Date(Date.now() - 7*86400000), expires: new Date(Date.now() - 86400000), masked: '****...m6v4' },
  { id: '5', name: 'api_key_aws', environment: 'production', status: 'expiring', created: new Date(Date.now() - 340*86400000), expires: new Date(Date.now() + 5*86400000), masked: '****...f2j7' },
  { id: '6', name: 'backup_key', environment: 'dev', status: 'active', created: new Date(Date.now() - 14*86400000), expires: null, masked: '****...z1o3' }
];

// Get all secrets (masked)
app.get('/api/secrets', (req, res) => {
  const secrets = secretsStore.map(s => ({
    id: s.id,
    name: s.name,
    environment: s.environment,
    status: s.status,
    created: s.created,
    expires: s.expires,
    masked: s.masked,
    daysToExpire: s.expires ? Math.ceil((s.expires - Date.now()) / 86400000) : null
  }));
  res.json({ secrets, count: secrets.length });
});

// Get secret by ID (masked)
app.get('/api/secrets/:id', (req, res) => {
  const secret = secretsStore.find(s => s.id === req.params.id);
  if (!secret) return res.status(404).json({ error: 'Secret not found' });
  res.json({
    id: secret.id,
    name: secret.name,
    environment: secret.environment,
    status: secret.status,
    created: secret.created,
    expires: secret.expires,
    masked: secret.masked
  });
});

// Create new secret
app.post('/api/secrets', (req, res) => {
  const { name, environment, expiresInDays } = req.body;
  if (!name || !environment) {
    return res.status(400).json({ error: 'Name and environment required' });
  }
  
  const newSecret = {
    id: Date.now().toString(),
    name,
    environment,
    status: 'active',
    created: new Date(),
    expires: expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null,
    masked: '****...' + Math.random().toString(36).substr(2, 4).toLowerCase()
  };
  
  secretsStore.push(newSecret);
  appState.lastAction = `Secret created: ${name}`;
  addLog('Secret created', name);
  
  res.status(201).json({
    id: newSecret.id,
    name: newSecret.name,
    message: 'Secret created successfully',
    timestamp: new Date().toISOString()
  });
});

// Update secret status
app.patch('/api/secrets/:id', (req, res) => {
  const secret = secretsStore.find(s => s.id === req.params.id);
  if (!secret) return res.status(404).json({ error: 'Secret not found' });
  
  const { status } = req.body;
  if (status) secret.status = status;
  
  appState.lastAction = `Secret updated: ${secret.name}`;
  addLog('Secret updated', secret.name);
  
  res.json({ message: 'Secret updated', id: secret.id, status: secret.status });
});

// Delete secret
app.delete('/api/secrets/:id', (req, res) => {
  const index = secretsStore.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Secret not found' });
  
  const deleted = secretsStore.splice(index, 1)[0];
  appState.lastAction = `Secret deleted: ${deleted.name}`;
  addLog('Secret deleted', deleted.name);
  
  res.json({ message: 'Secret deleted', id: deleted.id, name: deleted.name });
});

// Get secrets by environment
app.get('/api/secrets/filter/:environment', (req, res) => {
  const { environment } = req.params;
  const filtered = secretsStore.filter(s => s.environment === environment);
  res.json({ secrets: filtered, count: filtered.length, environment });
});

// Validate secret expiration
app.get('/api/secrets/validate/expiring', (req, res) => {
  const expiring = secretsStore.filter(s => {
    if (!s.expires) return false;
    const daysLeft = (s.expires - Date.now()) / 86400000;
    return daysLeft <= 30 && daysLeft > 0;
  });
  
  res.json({
    expiringCount: expiring.count,
    expiringSoon: expiring,
    expired: secretsStore.filter(s => s.expires && s.expires < Date.now()).length
  });
});

// Get component status
app.get('/api/components', (req, res) => {
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
app.post('/api/toggle/:feature', (req, res) => {
  const { feature } = req.params;
  const isEnabled = req.body.enabled !== false;
  appState.lastAction = `Feature ${feature} toggled: ${isEnabled}`;
  addLog(`Toggled ${feature}`, `enabled: ${isEnabled}`);
  res.json({
    feature,
    enabled: isEnabled,
    message: `${feature} is now ${isEnabled ? 'enabled' : 'disabled'}`,
    timestamp: new Date().toISOString()
  });
});

// AI World route - Interactive AI environment
app.get('/ai-world', (req, res) => {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI World - NetworkBuster</title>
<style>
* {margin:0;padding:0;box-sizing:border-box}
body {font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto;background:linear-gradient(135deg,#1a202c,#2d3748);min-height:100vh;color:#e2e8f0;padding:20px}
.container {max-width:1400px;margin:0 auto}
.header {text-align:center;margin-bottom:40px}
.header h1 {font-size:3em;margin-bottom:10px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.header p {font-size:1.2em;opacity:.8}
.world-grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:30px}
.world-card {background:rgba(45,55,72,.6);border:1px solid rgba(102,126,234,.3);border-radius:12px;padding:20px;transition:all .3s ease}
.world-card:hover {border-color:#667eea;transform:translateY(-5px)}
.card-icon {font-size:2.5em;margin-bottom:10px}
.card-title {font-size:1.2em;font-weight:700;color:#667eea;margin-bottom:8px}
.card-desc {font-size:.9em;opacity:.8;line-height:1.5;margin-bottom:12px}
.card-button {width:100%;padding:10px;background:#667eea;border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer}
.card-button:hover {background:#5568d3}
.ai-features {background:rgba(45,55,72,.6);border:1px solid rgba(102,126,234,.3);border-radius:12px;padding:20px;margin-bottom:30px}
.feature-grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:15px}
.feature-item {background:rgba(102,126,234,.1);padding:12px;border-radius:6px;border-left:3px solid #667eea}
.feature-name {font-weight:600;color:#667eea;font-size:.9em}
.ai-simulator {background:rgba(45,55,72,.6);border:1px solid rgba(102,126,234,.3);border-radius:12px;padding:20px;margin-bottom:30px}
.sim-input {width:100%;padding:10px;margin-bottom:10px;background:rgba(0,0,0,.3);border:1px solid rgba(102,126,234,.3);border-radius:6px;color:#e2e8f0}
.sim-output {background:#1a202c;padding:12px;border-radius:6px;max-height:250px;overflow-y:auto;font-family:monospace;font-size:.9em}
.stat-box {display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:20px 0}
.stat-card {background:rgba(102,126,234,.1);padding:12px;border-radius:6px;text-align:center;border-left:3px solid #667eea}
.stat-number {font-size:1.5em;font-weight:700;color:#667eea}
.stat-label {font-size:.85em;opacity:.7;margin-top:5px}
.modal {display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);z-index:1000;align-items:center;justify-content:center}
.modal.active {display:flex}
.modal-content {background:#2d3748;border:1px solid #667eea;border-radius:12px;padding:25px;max-width:500px;width:90%}
.modal-close {float:right;font-size:1.5em;cursor:pointer;color:#667eea}
.close-btn {background:#667eea;padding:10px 15px;border:none;border-radius:6px;color:#fff;cursor:pointer;margin-top:15px;width:100%}
</style>
</head>
<body>
<div class="container">
<div class="header"><h1>🌍 AI World</h1><p>Artificial Intelligence Learning & Simulation Environment</p></div>
<div class="world-grid">
<div class="world-card"><div class="card-icon">🧠</div><div class="card-title">Machine Learning</div><div class="card-desc">Explore neural networks and deep learning</div><button class="card-button" onclick="loadModule('ml')">Explore</button></div>
<div class="world-card"><div class="card-icon">🤖</div><div class="card-title">AI Agents</div><div class="card-desc">Autonomous decision-making systems</div><button class="card-button" onclick="loadModule('agents')">Explore</button></div>
<div class="world-card"><div class="card-icon">📊</div><div class="card-title">Data Science</div><div class="card-desc">Analysis and visualization</div><button class="card-button" onclick="loadModule('data')">Explore</button></div>
<div class="world-card"><div class="card-icon">🔮</div><div class="card-title">Predictions</div><div class="card-desc">Forecasting and trends</div><button class="card-button" onclick="loadModule('predict')">Explore</button></div>
<div class="world-card"><div class="card-icon">🗣️</div><div class="card-title">NLP</div><div class="card-desc">Natural Language Processing</div><button class="card-button" onclick="loadModule('nlp')">Explore</button></div>
<div class="world-card"><div class="card-icon">👁️</div><div class="card-title">Computer Vision</div><div class="card-desc">Image recognition and detection</div><button class="card-button" onclick="loadModule('vision')">Explore</button></div>
</div>
<div class="ai-features"><h2>🚀 AI Features</h2><div class="feature-grid">
<div class="feature-item"><div class="feature-name">🧬 Neural Networks</div></div>
<div class="feature-item"><div class="feature-name">📈 Training</div></div>
<div class="feature-item"><div class="feature-name">🎯 Classification</div></div>
<div class="feature-item"><div class="feature-name">🔗 Clustering</div></div>
<div class="feature-item"><div class="feature-name">🎮 Reinforcement</div></div>
<div class="feature-item"><div class="feature-name">🌐 Deep Learning</div></div>
</div></div>
<div class="ai-simulator"><h2>💬 AI Chat</h2><input type="text" class="sim-input" id="aiInput" placeholder="Ask the AI..."><button class="card-button" onclick="askAI()">Send</button><div class="sim-output" id="aiOutput">Chat responses appear here...</div></div>
<div class="stat-box">
<div class="stat-card"><div class="stat-number">47</div><div class="stat-label">AI Models</div></div>
<div class="stat-card"><div class="stat-number">1.2K</div><div class="stat-label">Datasets</div></div>
<div class="stat-card"><div class="stat-number">96.8%</div><div class="stat-label">Accuracy</div></div>
<div class="stat-card"><div class="stat-number">99.9%</div><div class="stat-label">Uptime</div></div>
</div>
</div>
<div id="modal" class="modal"><div class="modal-content"><span class="modal-close" onclick="closeModal()">&times;</span><h2 id="modalTitle">Module</h2><p id="modalBody">Loading...</p><button class="close-btn" onclick="closeModal()">Close</button></div></div>
<script>
function loadModule(m){const m2={ml:'Machine Learning - Deep neural networks and algorithms',agents:'AI Agents - Autonomous decision-making',data:'Data Science - Statistical analysis',predict:'Predictions - Forecasting models',nlp:'NLP - Text processing',vision:'Vision - Image recognition'};document.getElementById('modalTitle').textContent='🌍 '+m.toUpperCase();document.getElementById('modalBody').textContent=m2[m]||'Module loaded';document.getElementById('modal').classList.add('active')}
function closeModal(){document.getElementById('modal').classList.remove('active')}
function askAI(){const input=document.getElementById('aiInput');const output=document.getElementById('aiOutput');const q=input.value.trim();if(!q)return;output.innerHTML+='<div><b>You:</b> '+q+'</div><div style="opacity:.7"><b>AI:</b> Processing...</div>';input.value='';output.scrollTop=output.scrollHeight}
window.addEventListener('keypress',(e)=>{if(e.key==='Enter'&&document.getElementById('aiInput')===document.activeElement)askAI()})
</script>
</body>
</html>`;
  res.send(htmlContent);
  addLog('AI World loaded');
});

// Home route with navigation buttons
app.get('/home', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>NetworkBuster - Home</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}html,body{height:100%}.container{max-width:1200px;margin:0 auto;height:100%}.header{text-align:center;color:#fff;margin-bottom:40px}.header h1{font-size:3em;margin-bottom:10px;text-shadow:2px 2px 4px rgba(0,0,0,.3)}.header p{font-size:1.3em;opacity:.9}.nav-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:25px;margin-bottom:40px}.nav-card{background:rgba(255,255,255,.95);border-radius:12px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,.2);transition:all .3s ease;cursor:pointer;text-decoration:none;color:inherit;display:flex;flex-direction:column;align-items:center;text-align:center}.nav-card:hover{transform:translateY(-8px);box-shadow:0 20px 60px rgba(0,0,0,.3)}.nav-icon{font-size:3.5em;margin-bottom:15px}.nav-title{font-size:1.5em;font-weight:700;color:#333;margin-bottom:10px}.nav-desc{color:#666;line-height:1.5;margin-bottom:20px}.nav-button{background:#667eea;color:#fff;border:none;padding:12px 30px;border-radius:6px;font-weight:600;cursor:pointer;transition:all .2s;align-self:flex-end;width:100%}.nav-button:hover{background:#5568d3;transform:translateY(-2px)}.quick-actions{background:rgba(255,255,255,.95);border-radius:12px;padding:30px;margin-bottom:40px;box-shadow:0 10px 40px rgba(0,0,0,.2)}.quick-actions h2{color:#333;margin-bottom:20px}.action-buttons{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px}.action-btn{background:#667eea;color:#fff;border:none;padding:15px;border-radius:6px;font-weight:600;cursor:pointer;transition:all .3s;font-size:1em}.action-btn:hover{background:#5568d3;transform:translateY(-3px)}.action-btn.success{background:#48bb78}.action-btn.success:hover{background:#38a169}.action-btn.info{background:#4299e1}.action-btn.info:hover{background:#3182ce}.action-btn.warning{background:#ed8936}.action-btn.warning:hover{background:#dd6b20}.footer{text-align:center;color:rgba(255,255,255,.8);padding:20px;border-top:1px solid rgba(255,255,255,.2)}</style></head><body><div class="container"><div class="header"><h1>🚀 NetworkBuster</h1><p>Content & Operation Hub</p></div><div class="quick-actions"><h2>⚡ Quick Actions</h2><div class="action-buttons"><button class="action-btn success" onclick="fetch('/api/health').then(r=>r.json()).then(d=>alert('✓ Healthy! Uptime: '+formatUptime(d.uptime))).catch(e=>alert('Error'))">✓ Health Check</button><button class="action-btn info" onclick="location.href='/control-panel'">⚙️ Control Panel</button><button class="action-btn" onclick="fetch('/api/logs').then(r=>r.json()).then(d=>alert('Logs: '+d.count+' entries')).catch(e=>alert('Error'))">📜 View Logs</button><button class="action-btn warning" onclick="fetch('/api/status').then(r=>r.json()).then(d=>alert('Platform: '+d.systemInfo.platform+'\\nCPUs: '+d.systemInfo.cpus)).catch(e=>alert('Error'))">💻 System Status</button></div></div><div class="nav-grid"><a href="/dashboard" class="nav-card"><div class="nav-icon">📈</div><div class="nav-title">Dashboard</div><div class="nav-desc">View real-time analytics and performance metrics</div><button class="nav-button">Open Dashboard</button></a><a href="/overlay" class="nav-card"><div class="nav-icon">🎨</div><div class="nav-title">Overlay</div><div class="nav-desc">Real-time visualization and interactive overlay</div><button class="nav-button">Open Overlay</button></a><a href="/blog" class="nav-card"><div class="nav-icon">📝</div><div class="nav-title">Blog</div><div class="nav-desc">Read articles, guides, and announcements</div><button class="nav-button">Read Blog</button></a><a href="/ai-world" class="nav-card"><div class="nav-icon">🌍</div><div class="nav-title">AI World</div><div class="nav-desc">Artificial intelligence learning and simulation environment</div><button class="nav-button">Enter AI World</button></a><a href="/control-panel" class="nav-card"><div class="nav-icon">⚙️</div><div class="nav-title">Control Panel</div><div class="nav-desc">System controls, health checks, and logs</div><button class="nav-button">Open Controls</button></a><a href="/api/health" class="nav-card"><div class="nav-icon">🏥</div><div class="nav-title">API Health</div><div class="nav-desc">Check API status and system health metrics</div><button class="nav-button">View Status</button></a><a href="/api/status" class="nav-card"><div class="nav-icon">📊</div><div class="nav-title">API Status</div><div class="nav-desc">Detailed system information and performance data</div><button class="nav-button">View Details</button></a></div><div class="footer"><p>NetworkBuster Server | Click any card to navigate to relevant information</p></div></div><script>function formatUptime(s){const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);if(h>0)return h+'h '+m+'m';return m+'m'}</script></body></html>`);
});

// Control panel route (embedded HTML with operational buttons)
app.get('/control-panel', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>NetworkBuster Control Panel</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}.container{max-width:1200px;margin:0 auto}.header{text-align:center;color:#fff;margin-bottom:30px}.header h1{font-size:2.5em;margin-bottom:10px}.status-bar{background:rgba(255,255,255,.95);padding:20px;border-radius:10px;margin-bottom:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}.status-item{padding:15px;background:#f8f9fa;border-radius:8px;border-left:4px solid #667eea}.status-label{font-size:.9em;color:#666;margin-bottom:5px;font-weight:600}.status-value{font-size:1.5em;color:#333;font-weight:bold}.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px}.control-section{background:rgba(255,255,255,.95);padding:25px;border-radius:10px}.section-title{font-size:1.2em;font-weight:700;color:#333;margin-bottom:20px}.button-group{display:flex;flex-direction:column;gap:10px}button{padding:12px 20px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;transition:all 0.3s;color:#fff}.btn-success{background:#48bb78}.btn-success:hover{background:#38a169;transform:translateY(-2px)}.btn-primary{background:#667eea}.btn-primary:hover{background:#5568d3;transform:translateY(-2px)}.btn-info{background:#4299e1}.btn-info:hover{background:#3182ce;transform:translateY(-2px)}.btn-warning{background:#ed8936}.btn-warning:hover{background:#dd6b20;transform:translateY(-2px)}.btn-danger{background:#f56565}.btn-danger:hover{background:#e53e3e;transform:translateY(-2px)}.alert{padding:12px 16px;border-radius:6px;margin-bottom:15px}.alert-success{background:#c6f6d5;color:#22543d}.alert-error{background:#fed7d7;color:#742a2a}.alert-info{background:#bee3f8;color:#2c5282}.logs-container{background:rgba(255,255,255,.95);padding:25px;border-radius:10px}.logs-list{background:#1a202c;color:#a0aec0;padding:15px;border-radius:6px;max-height:300px;overflow-y:auto;font-family:monospace;font-size:.9em;line-height:1.6}</style></head><body><div class="container"><div class="header"><h1>⚙️ NetworkBuster Control Panel</h1><p>Operational Dashboard & System Controls</p></div><div class="status-bar"><div class="status-item"><div class="status-label">Status</div><div class="status-value" id="statusValue">Running</div></div><div class="status-item"><div class="status-label">Uptime</div><div class="status-value" id="uptimeValue">0s</div></div><div class="status-item"><div class="status-label">Requests</div><div class="status-value" id="requestsValue">0</div></div><div class="status-item"><div class="status-label">Last Action</div><div class="status-value" id="lastActionValue">None</div></div></div><div id="alerts"></div><div class="controls"><div class="control-section"><div class="section-title">⚙️ Application Control</div><div class="button-group"><button class="btn-success" onclick="checkHealth()">✓ Health Check</button><button class="btn-info" onclick="getComponentStatus()">📊 Components</button><button class="btn-warning" onclick="getSystemStatus()">💻 System Info</button><button class="btn-danger" onclick="restartApp()">🔄 Restart</button></div></div><div class="control-section"><div class="section-title">🎯 Navigation</div><div class="button-group"><button class="btn-primary" onclick="openPath('/home')">🏠 Home Hub</button><button class="btn-primary" onclick="openPath('/dashboard')">📈 Dashboard</button><button class="btn-primary" onclick="openPath('/overlay')">🎨 Overlay</button><button class="btn-primary" onclick="openPath('/blog')">📝 Blog</button></div></div><div class="control-section"><div class="section-title">🔧 Features</div><div class="button-group"><button class="btn-primary" onclick="toggleFeature('analytics')">📊 Analytics</button><button class="btn-primary" onclick="toggleFeature('notifications')">🔔 Notifications</button><button class="btn-primary" onclick="toggleFeature('darkMode')">🌙 Dark Mode</button><button class="btn-primary" onclick="toggleFeature('debug')">🐛 Debug</button></div></div><div class="control-section"><div class="section-title">📋 Maintenance</div><div class="button-group"><button class="btn-info" onclick="viewLogs()">📜 View Logs</button><button class="btn-warning" onclick="clearLogs()">🗑️ Clear Logs</button><button class="btn-danger" onclick="clearCache()">💾 Cache</button><button class="btn-success" onclick="exportLogs()">📥 Export</button></div></div></div><div class="logs-container"><div style="display:flex;justify-content:space-between;margin-bottom:15px"><h3>📜 System Logs</h3><button class="btn-warning" onclick="viewLogs()" style="width:auto">Refresh</button></div><div class="logs-list" id="logsList">Loading logs...</div></div></div><script>function showAlert(m,t='info'){const a=document.getElementById('alerts');const e=document.createElement('div');e.className='alert alert-'+t;e.textContent=m;a.appendChild(e);setTimeout(()=>e.remove(),5000)}function updateStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{document.getElementById('statusValue').textContent=d.status;document.getElementById('uptimeValue').textContent=formatUptime(d.uptime);document.getElementById('requestsValue').textContent=d.requestCount;document.getElementById('lastActionValue').textContent=d.lastAction||'None'}).catch(e=>console.error(e))}function formatUptime(s){const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);const sec=s%60;if(h>0)return h+'h '+m+'m';return m+'m '+sec+'s'}function checkHealth(){fetch('/api/health').then(r=>r.json()).then(d=>{showAlert('✓ Healthy! Uptime: '+formatUptime(d.uptime),'success');updateStatus()}).catch(e=>showAlert('Health check failed','error'))}function getSystemStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{const mu=Math.round(d.systemInfo.memoryUsage.heapUsed/1024/1024);showAlert('Platform: '+d.systemInfo.platform+' | CPUs: '+d.systemInfo.cpus+' | Memory: '+mu+'MB','info')}).catch(e=>showAlert('Failed','error'))}function getComponentStatus(){fetch('/api/components').then(r=>r.json()).then(d=>{const c=Object.keys(d.components).join(', ');showAlert('✓ Online: '+c,'success')}).catch(e=>showAlert('Failed','error'))}function restartApp(){if(confirm('Restart application?')){fetch('/api/restart',{method:'POST'}).then(r=>r.json()).then(d=>showAlert('⚠️ '+d.message,'warning')).catch(e=>showAlert('Failed','error'))}}function toggleFeature(f){fetch('/api/toggle/'+f,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:true})}).then(r=>r.json()).then(d=>showAlert(d.message,'success')).catch(e=>showAlert('Failed','error'))}function viewLogs(){fetch('/api/logs').then(r=>r.json()).then(d=>{const l=document.getElementById('logsList');if(d.logs.length===0){l.innerHTML='No logs'}else{l.innerHTML=d.logs.map(x=>'<div>'+x+'</div>').join('')}l.scrollTop=l.scrollHeight}).catch(e=>console.error(e))}function clearLogs(){if(confirm('Clear logs?')){fetch('/api/logs/clear',{method:'POST'}).then(r=>r.json()).then(d=>{showAlert('✓ Cleared','success');viewLogs()}).catch(e=>showAlert('Failed','error'))}}function clearCache(){localStorage.clear();showAlert('✓ Cache cleared','success')}function exportLogs(){fetch('/api/logs').then(r=>r.json()).then(d=>{const t=d.logs.join('\\n');const b=new Blob([t],{type:'text/plain'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='logs.txt';a.click();showAlert('✓ Exported','success')}).catch(e=>showAlert('Failed','error'))}function openPath(p){location.href=p}setInterval(updateStatus,5000);updateStatus();viewLogs()</script></body></html>`);
});

// Root route - redirect to home hub
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Serve static files
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard/dist')));        
app.use('/overlay', express.static(path.join(__dirname, 'challengerepo/real-time-overlay/dist')));
app.use('/static', express.static(path.join(__dirname, 'web-app')));

// SPA fallbacks
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/dist/index.html'));
});

app.get('/overlay', (req, res) => {
  res.sendFile(path.join(__dirname, 'challengerepo/real-time-overlay/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`🏠 Home Hub: http://localhost:${PORT}/home`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🎨 Real-time overlay: http://localhost:${PORT}/overlay`);
  console.log(`📝 Blog: http://localhost:${PORT}/blog`);
  console.log(`⚙️ Control Panel: http://localhost:${PORT}/control-panel`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status\n`);
  addLog('Server started', `Port: ${PORT}`);
});
