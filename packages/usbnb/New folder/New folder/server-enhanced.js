import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

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
// OPERATIONAL ENDPOINTS
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

// Control panel HTML
app.get('/control-panel', (req, res) => {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>NetworkBuster Control Panel</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px}.container{max-width:1200px;margin:0 auto}.header{text-align:center;color:white;margin-bottom:30px}.header h1{font-size:2.5em;margin-bottom:10px;text-shadow:2px 2px 4px rgba(0,0,0,0.3)}.status-bar{background:rgba(255,255,255,0.95);padding:20px;border-radius:10px;margin-bottom:30px;box-shadow:0 10px 40px rgba(0,0,0,0.2);display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}.status-item{text-align:center;padding:15px;background:#f8f9fa;border-radius:8px;border-left:4px solid #667eea}.status-label{font-size:0.9em;color:#666;margin-bottom:5px;font-weight:600}.status-value{font-size:1.5em;color:#333;font-weight:bold}.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px}.control-section{background:rgba(255,255,255,0.95);padding:25px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.2)}.section-title{font-size:1.2em;font-weight:700;color:#333;margin-bottom:20px;display:flex;align-items:center;gap:10px}.section-icon{font-size:1.5em}.button-group{display:flex;flex-direction:column;gap:10px}button{padding:12px 20px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;gap:8px}.btn-primary{background:#667eea;color:white}.btn-primary:hover{background:#5568d3;transform:translateY(-2px);box-shadow:0 5px 15px rgba(102,126,234,0.4)}.btn-success{background:#48bb78;color:white}.btn-success:hover{background:#38a169;transform:translateY(-2px);box-shadow:0 5px 15px rgba(72,187,120,0.4)}.btn-warning{background:#ed8936;color:white}.btn-warning:hover{background:#dd6b20;transform:translateY(-2px);box-shadow:0 5px 15px rgba(237,137,54,0.4)}.btn-danger{background:#f56565;color:white}.btn-danger:hover{background:#e53e3e;transform:translateY(-2px);box-shadow:0 5px 15px rgba(245,101,101,0.4)}.btn-info{background:#4299e1;color:white}.btn-info:hover{background:#3182ce;transform:translateY(-2px);box-shadow:0 5px 15px rgba(66,153,225,0.4)}button:active{transform:translateY(0)}button:disabled{opacity:0.5;cursor:not-allowed}.alert{padding:12px 16px;border-radius:6px;margin-bottom:15px;animation:slideIn 0.3s ease}.alert-success{background:#c6f6d5;color:#22543d;border-left:4px solid #48bb78}.alert-error{background:#fed7d7;color:#742a2a;border-left:4px solid #f56565}.alert-info{background:#bee3f8;color:#2c5282;border-left:4px solid #4299e1}@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}.logs-container{background:rgba(255,255,255,0.95);padding:25px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.2)}.logs-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.logs-list{background:#1a202c;color:#a0aec0;padding:15px;border-radius:6px;max-height:300px;overflow-y:auto;font-family:'Courier New',monospace;font-size:0.9em;line-height:1.6}.log-entry{margin-bottom:5px}.log-entry .timestamp{color:#4299e1}.log-entry .action{color:#48bb78}</style></head><body><div class="container"><div class="header"><h1>🚀 NetworkBuster Control Panel</h1><p>Operational Dashboard & System Controls</p></div><div class="status-bar" id="statusBar"><div class="status-item"><div class="status-label">Status</div><div class="status-value" id="statusValue">Running</div></div><div class="status-item"><div class="status-label">Uptime</div><div class="status-value" id="uptimeValue">0s</div></div><div class="status-item"><div class="status-label">Requests</div><div class="status-value" id="requestsValue">0</div></div><div class="status-item"><div class="status-label">Last Action</div><div class="status-value" id="lastActionValue">None</div></div></div><div id="alerts"></div><div class="controls"><div class="control-section"><div class="section-title"><span class="section-icon">⚙️</span> Application Control</div><div class="button-group"><button class="btn-success" onclick="checkHealth()">✓ Health Check</button><button class="btn-info" onclick="getComponentStatus()">📊 Component Status</button><button class="btn-warning" onclick="getSystemStatus()">💻 System Info</button><button class="btn-danger" onclick="restartApp()">🔄 Restart</button></div></div><div class="control-section"><div class="section-title"><span class="section-icon">🎯</span> Navigation</div><div class="button-group"><button class="btn-primary" onclick="openPath('/')">🏠 Home</button><button class="btn-primary" onclick="openPath('/dashboard')">📈 Dashboard</button><button class="btn-primary" onclick="openPath('/overlay')">🎨 Overlay</button><button class="btn-primary" onclick="openPath('/blog')">📝 Blog</button></div></div><div class="control-section"><div class="section-title"><span class="section-icon">🔧</span> Features</div><div class="button-group"><button class="btn-primary" onclick="toggleFeature('analytics')">📊 Analytics</button><button class="btn-primary" onclick="toggleFeature('notifications')">🔔 Notifications</button><button class="btn-primary" onclick="toggleFeature('darkMode')">🌙 Dark Mode</button><button class="btn-primary" onclick="toggleFeature('debugging')">🐛 Debug Mode</button></div></div><div class="control-section"><div class="section-title"><span class="section-icon">📋</span> Maintenance</div><div class="button-group"><button class="btn-info" onclick="viewLogs()">📜 View Logs</button><button class="btn-warning" onclick="clearLogs()">🗑️ Clear Logs</button><button class="btn-danger" onclick="clearCache()">💾 Clear Cache</button><button class="btn-success" onclick="exportLogs()">📥 Export Logs</button></div></div></div><div class="logs-container"><div class="logs-header"><div class="section-title"><span class="section-icon">📜</span> System Logs</div><button class="btn-warning" onclick="viewLogs()" style="width:auto;">Refresh Logs</button></div><div class="logs-list" id="logsList"><div class="log-entry">Loading system logs...</div></div></div></div><script>function showAlert(m,t='info'){const a=document.getElementById('alerts');const e=document.createElement('div');e.className='alert alert-'+t;e.textContent=m;a.appendChild(e);setTimeout(()=>e.remove(),5000)}function updateStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{document.getElementById('statusValue').textContent=d.status.toUpperCase();document.getElementById('uptimeValue').textContent=formatUptime(d.uptime);document.getElementById('requestsValue').textContent=d.requestCount;document.getElementById('lastActionValue').textContent=d.lastAction||'None'}).catch(e=>console.error('Status update failed:',e))}function formatUptime(s){const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);const sec=s%60;if(h>0)return h+'h '+m+'m';if(m>0)return m+'m '+sec+'s';return sec+'s'}function checkHealth(){fetch('/api/health').then(r=>r.json()).then(d=>{showAlert('✓ Application is healthy! Uptime: '+formatUptime(d.uptime),'success');updateStatus()}).catch(e=>showAlert('Health check failed','error'))}function getSystemStatus(){fetch('/api/status').then(r=>r.json()).then(d=>{const mu=Math.round(d.systemInfo.memoryUsage.heapUsed/1024/1024);const mt=Math.round(d.systemInfo.memoryUsage.heapTotal/1024/1024);showAlert('💻 Platform: '+d.systemInfo.platform+' | CPUs: '+d.systemInfo.cpus+' | Memory: '+mu+'MB / '+mt+'MB','info')}).catch(e=>showAlert('Failed to get system status','error'))}function getComponentStatus(){fetch('/api/components').then(r=>r.json()).then(d=>{const c=Object.keys(d.components).join(', ');showAlert('✓ Components online: '+c,'success')}).catch(e=>showAlert('Failed to get components','error'))}function restartApp(){if(confirm('Are you sure you want to restart the application?')){fetch('/api/restart',{method:'POST'}).then(r=>r.json()).then(d=>showAlert('⚠️ '+d.message,'warning')).catch(e=>showAlert('Restart failed','error'))}}function toggleFeature(f){fetch('/api/toggle/'+f,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:true})}).then(r=>r.json()).then(d=>showAlert(d.message,'success')).catch(e=>showAlert('Toggle failed','error'))}function viewLogs(){fetch('/api/logs').then(r=>r.json()).then(d=>{const ll=document.getElementById('logsList');if(d.logs.length===0){ll.innerHTML='<div class="log-entry">No logs available</div>'}else{ll.innerHTML=d.logs.map(l=>{const m=l.match(/\\[(.*?)\\](.*)/);if(m){return'<div class="log-entry"><span class="timestamp">'+m[1]+'</span> <span class="action">'+m[2]+'</span></div>'}return'<div class="log-entry">'+l+'</div>'}).join('')}ll.scrollTop=ll.scrollHeight}).catch(e=>console.error('Failed to fetch logs:',e))}function clearLogs(){if(confirm('Are you sure you want to clear all logs?')){fetch('/api/logs/clear',{method:'POST'}).then(r=>r.json()).then(d=>{showAlert('✓ Logs cleared','success');viewLogs()}).catch(e=>showAlert('Clear logs failed','error'))}}function clearCache(){if(confirm('Clear browser cache?')){if('caches' in window){caches.keys().then(n=>{n.forEach(name=>caches.delete(name));showAlert('✓ Cache cleared','success')})}else{localStorage.clear();showAlert('✓ Local storage cleared','success')}}}function exportLogs(){fetch('/api/logs').then(r=>r.json()).then(d=>{const lt=d.logs.join('\\n');const b=new Blob([lt],{type:'text/plain'});const u=window.URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='networkbuster-logs-'+new Date().toISOString().slice(0,10)+'.txt';a.click();showAlert('✓ Logs exported','success')}).catch(e=>showAlert('Export failed','error'))}function openPath(p){window.location.href=p}window.addEventListener('load',()=>{updateStatus();viewLogs();setInterval(updateStatus,5000)})</script></body></html>`;
  res.send(html);
});

// Serve the blog on /blog
app.use('/blog', express.static(path.join(__dirname, 'blog')));

// Serve the dashboard on /dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard/dist')));        

// Serve the real-time-overlay build on /overlay
app.use('/overlay', express.static(path.join(__dirname, 'challengerepo/real-time-overlay/dist')));

// Serve the web-app on the root
app.use('/', express.static(path.join(__dirname, 'web-app')));

// Fallback for dashboard SPA
app.get('/dashboard*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/dist/index.html'));
});

// Fallback for overlay SPA
app.get('/overlay*', (req, res) => {
  res.sendFile(path.join(__dirname, 'challengerepo/real-time-overlay/dist/index.html'));
});

// Fallback for root SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-app/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Web app: http://localhost:${PORT}`);
  console.log(`Real-time overlay: http://localhost:${PORT}/overlay`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`Blog: http://localhost:${PORT}/blog`);
  console.log(`⚙️ Control Panel: http://localhost:${PORT}/control-panel`);
  addLog('Server started', `Port: ${PORT}`);
});
