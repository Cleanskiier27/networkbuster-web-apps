import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import compression from 'compression';
import helmet from 'helmet';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Performance: Security & compression middleware (enable gzip)
app.use(compression());
app.use(helmet());

// Performance: Limit request sizes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Performance: Cache static assets aggressively
const STATIC_CACHE_DURATION = 86400000; // 24 hours in milliseconds

// Application state
const appState = {
  startTime: Date.now(),
  requestCount: 0,
  status: 'running',
  uptime: 0,
  lastAction: null,
  logs: [] // Keep only recent logs for memory efficiency
};

// Performance: Cache responses for status endpoints
const statusCache = {
  status: null,
  health: null,
  components: null,
  lastUpdate: 0,
  ttl: 1000 // 1 second cache for frequently called endpoints
};

// Helper function to add logs (optimized: no unnecessary allocations)
function addLog(action, details = '') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${action} ${details}`;
  appState.logs.push(logEntry);
  // Keep only 50 most recent logs instead of 100
  if (appState.logs.length > 50) {
    appState.logs.shift();
  }
  console.log(logEntry);
}

// Performance: Efficient uptime calculation (moved to single interval)
setInterval(() => {
  appState.uptime = Math.floor((Date.now() - appState.startTime) / 1000);
}, 5000); // Check every 5 seconds instead of 1

// Performance: Request counter middleware (minimal overhead)
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  appState.requestCount = requestCount;
  next();
});

// Performance: Cache static status responses
function updateStatusCache() {
  const now = Date.now();
  if (now - statusCache.lastUpdate > statusCache.ttl) {
    statusCache.health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: appState.uptime,
      requestCount: appState.requestCount,
      port: PORT
    };
    statusCache.lastUpdate = now;
  }
  return statusCache.health;
}

// ============================================
// OPERATIONAL API ENDPOINTS (OPTIMIZED)
// ============================================

// Health check endpoint (cached, minimal response)
app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=5'); // Cache for 5 seconds
  res.json(updateStatusCache());
});

// Get system status (optimized)
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
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // Convert to MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024)
    }
  });
});

// Get application logs (optimized)
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

// Get component status (cached)
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

// Control panel route (optimized HTML)
app.get('/control-panel', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NetworkBuster Control Panel</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}.container{max-width:1200px;margin:0 auto}.header{text-align:center;color:#fff;margin-bottom:30px}.header h1{font-size:2.5em;margin-bottom:10px}.status-bar{background:rgba(255,255,255,.95);padding:20px;border-radius:10px;margin-bottom:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}.status-item{padding:15px;background:#f8f9fa;border-radius:8px;border-left:4px solid #667eea}.status-label{font-size:.9em;color:#666;margin-bottom:5px;font-weight:600}.status-value{font-size:1.5em;color:#333;font-weight:bold}.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px}.control-section{background:rgba(255,255,255,.95);padding:25px;border-radius:10px}.section-title{font-size:1.2em;font-weight:700;color:#333;margin-bottom:20px}.button-group{display:flex;flex-direction:column;gap:10px}button{padding:12px 20px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;transition:all .3s;color:#fff}.btn-success{background:#48bb78}.btn-success:hover{background:#38a169;transform:translateY(-2px)}.btn-primary{background:#667eea}.btn-primary:hover{background:#5568d3;transform:translateY(-2px)}.btn-info{background:#4299e1}.btn-info:hover{background:#3182ce;transform:translateY(-2px)}.btn-warning{background:#ed8936}.btn-warning:hover{background:#dd6b20;transform:translateY(-2px)}.btn-danger{background:#f56565}.btn-danger:hover{background:#e53e3e;transform:translateY(-2px)}.alert{padding:12px 16px;border-radius:6px;margin-bottom:15px;animation:slideIn .3s}.alert-success{background:#c6f6d5;color:#22543d}.alert-error{background:#fed7d7;color:#742a2a}.alert-info{background:#bee3f8;color:#2c5282}@keyframes slideIn{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}.logs-container{background:rgba(255,255,255,.95);padding:25px;border-radius:10px}.logs-list{background:#1a202c;color:#a0aec0;padding:15px;border-radius:6px;max-height:300px;overflow-y:auto;font-family:monospace;font-size:.9em;line-height:1.6}</style></head><body><div class="container"><div class="header"><h1>⚙️ NetworkBuster Control Panel</h1><p>Operational Dashboard & System Controls</p></div><div class="status-bar"><div class="status-item"><div class="status-label">Status</div><div class="status-value" id="statusValue">Running</div></div><div class="status-item"><div class="status-label">Uptime</div><div class="status-value" id="uptimeValue">0s</div></div><div class="status-item"><div class="status-label">Requests</div><div class="status-value" id="requestsValue">0</div></div><div class="status-item"><div class="status-label">Last Action</div><div class="status-value" id="lastActionValue">None</div></div></div><div id="alerts"></div><div class="controls"><div class="control-section"><div class="section-title">⚙️ Application Control</div><div class="button-group"><button class="btn-success" onclick="checkHealth()">✓ Health Check</button><button class="btn-info" onclick="getComponentStatus()">📊 Components</button><button class="btn-warning" onclick="getSystemStatus()">💻 System Info</button><button class="btn-danger" onclick="restartApp()">🔄 Restart</button></div></div><div class="control-section"><div class="section-title">🎯 Navigation</div><div class="button-group"><button class="btn-primary" onclick="openPath('/')">🏠 Home</button><button class="btn-primary" onclick="openPath('/dashboard')">📈 Dashboard</button><button class="btn-primary" onclick="openPath('/overlay')">🎨 Overlay</button><button class="btn-primary" onclick="openPath('/blog')">📝 Blog</button></div></div><div class="control-section"><div class="section-title">🔧 Features</div><div class="button-group"><button class="btn-primary" onclick="toggleFeature('analytics')">📊 Analytics</button><button class="btn-primary" onclick="toggleFeature('notifications')">🔔 Notifications</button><button class="btn-primary" onclick="toggleFeature('darkMode')">🌙 Dark Mode</button><button class="btn-primary" onclick="toggleFeature('debug')">🐛 Debug</button></div></div><div class="control-section"><div class="section-title">📋 Maintenance</div><div class="button-group"><button class="btn-info" onclick="viewLogs()">📜 View Logs</button><button class="btn-warning" onclick="clearLogs()">🗑️ Clear Logs</button><button class="btn-danger" onclick="clearCache()">💾 Cache</button><button class="btn-success" onclick="exportLogs()">📥 Export</button></div></div></div><div class="logs-container"><div style="display:flex;justify-content:space-between;margin-bottom:15px"><h3>📜 System Logs</h3><button class="btn-warning" onclick="viewLogs()" style="width:auto">Refresh</button></div><div class="logs-list" id="logsList">Loading logs...</div></div></div><script>function showAlert(m,t='info'){const a=document.getElementById('alerts');const e=document.createElement('div');e.className='alert alert-'+t;e.textContent=m;a.appendChild(e);setTimeout(()=>e.remove(),5e3)}function updateStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{document.getElementById('statusValue').textContent=d.status;document.getElementById('uptimeValue').textContent=formatUptime(d.uptime);document.getElementById('requestsValue').textContent=d.requestCount;document.getElementById('lastActionValue').textContent=d.lastAction||'None'}).catch(e=>console.error(e))}function formatUptime(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return h>0?h+'h '+m+'m':m+'m '+sec+'s'}function checkHealth(){fetch('/api/health').then(r=>r.json()).then(d=>{showAlert('✓ Healthy! Uptime: '+formatUptime(d.uptime),'success');updateStatus()}).catch(e=>showAlert('Health check failed','error'))}function getSystemStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{const mu=d.systemInfo.memoryUsage.heapUsed;showAlert('Platform: '+d.systemInfo.platform+' | CPUs: '+d.systemInfo.cpus+' | Memory: '+mu+'MB','info')}).catch(e=>showAlert('Failed','error'))}function getComponentStatus(){fetch('/api/components').then(r=>r.json()).then(d=>{const c=Object.keys(d.components).join(', ');showAlert('✓ Online: '+c,'success')}).catch(e=>showAlert('Failed','error'))}function restartApp(){confirm('Restart application?')&&fetch('/api/restart',{method:'POST'}).then(r=>r.json()).then(d=>showAlert('⚠️ '+d.message,'warning')).catch(e=>showAlert('Failed','error'))}function toggleFeature(f){fetch('/api/toggle/'+f,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:!0})}).then(r=>r.json()).then(d=>showAlert(d.message,'success')).catch(e=>showAlert('Failed','error'))}function viewLogs(){fetch('/api/logs').then(r=>r.json()).then(d=>{const l=document.getElementById('logsList');l.innerHTML=0===d.logs.length?'No logs':d.logs.map(x=>'<div>'+x+'</div>').join('');l.scrollTop=l.scrollHeight}).catch(e=>console.error(e))}function clearLogs(){confirm('Clear logs?')&&fetch('/api/logs/clear',{method:'POST'}).then(r=>r.json()).then(d=>{showAlert('✓ Cleared','success');viewLogs()}).catch(e=>showAlert('Failed','error'))}function clearCache(){localStorage.clear();showAlert('✓ Cache cleared','success')}function exportLogs(){fetch('/api/logs').then(r=>r.json()).then(d=>{const t=d.logs.join('\\n'),b=new Blob([t],{type:'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='logs.txt';a.click();showAlert('✓ Exported','success')}).catch(e=>showAlert('Failed','error'))}function openPath(p){location.href=p}setInterval(updateStatus,5e3);updateStatus();viewLogs()</script></body></html>`);
});

// Performance: Serve static files with aggressive caching
app.use('/blog', express.static(path.join(__dirname, 'blog'), { maxAge: STATIC_CACHE_DURATION }));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard/dist'), { maxAge: STATIC_CACHE_DURATION }));        
app.use('/overlay', express.static(path.join(__dirname, 'challengerepo/real-time-overlay/dist'), { maxAge: STATIC_CACHE_DURATION }));
app.use('/', express.static(path.join(__dirname, 'web-app'), { maxAge: STATIC_CACHE_DURATION }));

// Performance: SPA fallbacks with proper cache headers
app.get('/dashboard*', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(__dirname, 'dashboard/dist/index.html'));
});

app.get('/overlay*', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(__dirname, 'challengerepo/real-time-overlay/dist/index.html'));
});

// Performance: Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Optimized Server running at http://localhost:${PORT}`);
  console.log(`⚡ Performance optimizations enabled:`);
  console.log(`   • Compression (gzip) enabled`);
  console.log(`   • Response caching enabled`);
  console.log(`   • Helmet security middleware active`);
  console.log(`   • Static asset caching: 24 hours`);
  console.log(`   • Memory-efficient logging`);
  console.log(`\n📍 Routes:`);
  console.log(`🏠 Web app: http://localhost:${PORT}`);
  console.log(`🎨 Real-time overlay: http://localhost:${PORT}/overlay`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📝 Blog: http://localhost:${PORT}/blog`);
  console.log(`⚙️ Control Panel: http://localhost:${PORT}/control-panel`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
  addLog('Server started', `Port: ${PORT} - Optimized`);
});

// Performance: Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
