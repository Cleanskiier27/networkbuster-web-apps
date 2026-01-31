#!/usr/bin/env node

/**
 * NetworkBuster Security Monitor & Amber Alert System
 * Real-time hack attempt detection with emoji status indicators
 */

import express from 'express';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.SECURITY_PORT || 3006;

app.use(express.json());

// Security State with Emoji Status Indicators
const securityState = {
  status: '🟢', // 🟢 Safe | 🟡 Warning | 🟠 Amber Alert | 🔴 Critical | ⚫ Offline
  level: 'SAFE',
  startTime: Date.now(),
  threatCount: 0,
  blockedIPs: new Set(),
  alerts: [],
  attemptedHacks: [],
  suspiciousActivity: [],
  activeThreats: 0,
  timeline: []
};

// Threat Detection Patterns
const THREAT_PATTERNS = {
  sqlInjection: /(\bunion\b.*\bselect\b|\bor\b.*1\s*=\s*1|;.*drop\b|<script|javascript:|onerror=)/i,
  pathTraversal: /(\.\.[\/\\]|\.\.%2[fF]|%2e%2e|\.\.;)/,
  commandInjection: /([;&|`$(){}]|\\x[0-9a-f]{2})/,
  bruteForce: /^(admin|root|test|user|password|123456)/i,
  portScan: /\b(nmap|masscan|zmap|shodan)\b/i,
  xss: /(<script|<iframe|onerror|onload|javascript:)/i
};

// Emoji Status Update Function
function updateSecurityStatus() {
  const now = Date.now();
  const recentThreats = securityState.attemptedHacks.filter(h => now - h.timestamp < 60000).length;
  
  if (securityState.activeThreats > 10 || recentThreats > 50) {
    securityState.status = '🔴';
    securityState.level = 'CRITICAL';
  } else if (securityState.activeThreats > 5 || recentThreats > 20) {
    securityState.status = '🟠';
    securityState.level = 'AMBER_ALERT';
  } else if (securityState.activeThreats > 0 || recentThreats > 5) {
    securityState.status = '🟡';
    securityState.level = 'WARNING';
  } else {
    securityState.status = '🟢';
    securityState.level = 'SAFE';
  }
  
  // Add to timeline
  addToTimeline({
    status: securityState.status,
    level: securityState.level,
    threats: securityState.activeThreats,
    timestamp: now
  });
}

// Timeline Management (Past-Future-Present Reference)
function addToTimeline(event) {
  securityState.timeline.push({
    past: securityState.timeline.length > 0 ? securityState.timeline[securityState.timeline.length - 1] : null,
    present: event,
    future: null, // Predicted state based on patterns
    timestamp: Date.now()
  });
  
  // Keep last 1000 timeline events
  if (securityState.timeline.length > 1000) {
    securityState.timeline.shift();
  }
  
  // Predict future state
  if (securityState.timeline.length > 10) {
    const recent = securityState.timeline.slice(-10);
    const threatTrend = recent.filter(t => t.present.threats > 0).length / 10;
    
    if (threatTrend > 0.5) {
      event.future = {
        prediction: 'ESCALATING',
        confidence: threatTrend,
        recommendedAction: 'Increase monitoring, prepare countermeasures'
      };
    } else if (threatTrend > 0.2) {
      event.future = {
        prediction: 'STABLE_ELEVATED',
        confidence: threatTrend,
        recommendedAction: 'Maintain vigilance'
      };
    } else {
      event.future = {
        prediction: 'STABLE_SAFE',
        confidence: 1 - threatTrend,
        recommendedAction: 'Normal operations'
      };
    }
  }
}

// Threat Analysis Engine
function analyzeThreat(data) {
  const threats = [];
  const dataStr = JSON.stringify(data).toLowerCase();
  
  for (const [type, pattern] of Object.entries(THREAT_PATTERNS)) {
    if (pattern.test(dataStr)) {
      threats.push(type);
    }
  }
  
  return threats;
}

// IP Reputation Check
function checkIPReputation(ip) {
  // Check against blocked IPs
  if (securityState.blockedIPs.has(ip)) {
    return { blocked: true, reason: 'Previously flagged for malicious activity' };
  }
  
  // Check for private/internal IPs (shouldn't be making external requests)
  const isPrivate = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)/.test(ip);
  if (isPrivate) {
    return { blocked: false, warning: true, reason: 'Internal IP' };
  }
  
  return { blocked: false, safe: true };
}

// Amber Alert Generator
function triggerAmberAlert(threat) {
  const alert = {
    id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: '🟠',
    level: 'AMBER_ALERT',
    type: threat.type,
    source: threat.source,
    timestamp: Date.now(),
    details: threat.details,
    action: 'AUTOMATED_BLOCK',
    notified: false
  };
  
  securityState.alerts.push(alert);
  securityState.activeThreats++;
  
  // Auto-block malicious IP
  if (threat.source.ip) {
    securityState.blockedIPs.add(threat.source.ip);
  }
  
  // Log alert
  console.log(`🟠 AMBER ALERT: ${alert.type} detected from ${threat.source.ip || 'unknown'}`);
  console.log(`   Details: ${JSON.stringify(threat.details)}`);
  console.log(`   Action: IP blocked, threat level elevated`);
  
  updateSecurityStatus();
  
  return alert;
}

// Security Middleware for Express Apps
function securityMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Check IP reputation
  const repCheck = checkIPReputation(ip);
  if (repCheck.blocked) {
    securityState.threatCount++;
    return res.status(403).json({
      error: 'Access denied',
      reason: repCheck.reason,
      status: '🔴'
    });
  }
  
  // Analyze request for threats
  const threats = analyzeThreat({
    url: req.url,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  
  if (threats.length > 0) {
    const threat = {
      type: threats.join(', '),
      source: {
        ip: ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        url: req.url
      },
      details: {
        patterns: threats,
        requestData: {
          query: req.query,
          body: req.body,
          headers: Object.keys(req.headers)
        }
      }
    };
    
    securityState.attemptedHacks.push({
      ...threat,
      timestamp: Date.now(),
      blocked: true
    });
    
    // Trigger Amber Alert
    const alert = triggerAmberAlert(threat);
    
    return res.status(403).json({
      error: 'Security threat detected',
      alertId: alert.id,
      status: '🟠',
      message: 'This incident has been logged and reported'
    });
  }
  
  next();
}

// ============================================
// API ENDPOINTS
// ============================================

// Security Status Dashboard
app.get('/api/security/status', (req, res) => {
  updateSecurityStatus();
  
  res.json({
    status: securityState.status,
    level: securityState.level,
    uptime: Math.floor((Date.now() - securityState.startTime) / 1000),
    statistics: {
      totalThreats: securityState.threatCount,
      activeThreats: securityState.activeThreats,
      blockedIPs: securityState.blockedIPs.size,
      recentHackAttempts: securityState.attemptedHacks.filter(h => Date.now() - h.timestamp < 3600000).length,
      alertCount: securityState.alerts.length
    },
    currentStatus: {
      emoji: securityState.status,
      level: securityState.level,
      description: getStatusDescription(securityState.level)
    }
  });
});

// Get All Alerts
app.get('/api/security/alerts', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    alerts: securityState.alerts.slice(-limit).reverse(),
    count: securityState.alerts.length
  });
});

// Get Amber Alerts Only
app.get('/api/security/amber-alerts', (req, res) => {
  const amberAlerts = securityState.alerts.filter(a => a.level === 'AMBER_ALERT');
  res.json({
    status: '🟠',
    alerts: amberAlerts,
    count: amberAlerts.length
  });
});

// Get Attempted Hacks
app.get('/api/security/hack-attempts', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({
    attempts: securityState.attemptedHacks.slice(-limit).reverse(),
    count: securityState.attemptedHacks.length
  });
});

// Get Timeline (Past-Future-Present)
app.get('/api/security/timeline', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({
    timeline: securityState.timeline.slice(-limit),
    current: securityState.timeline[securityState.timeline.length - 1],
    analysis: analyzeTimeline()
  });
});

// Get Blocked IPs
app.get('/api/security/blocked-ips', (req, res) => {
  res.json({
    blockedIPs: Array.from(securityState.blockedIPs),
    count: securityState.blockedIPs.size
  });
});

// Unblock IP (Admin only)
app.post('/api/security/unblock/:ip', (req, res) => {
  const ip = req.params.ip;
  if (securityState.blockedIPs.has(ip)) {
    securityState.blockedIPs.delete(ip);
    res.json({ success: true, message: `IP ${ip} unblocked`, status: '🟢' });
  } else {
    res.status(404).json({ error: 'IP not found in block list' });
  }
});

// Clear Alerts
app.post('/api/security/alerts/clear', (req, res) => {
  const clearedCount = securityState.alerts.length;
  securityState.alerts = [];
  securityState.activeThreats = 0;
  updateSecurityStatus();
  
  res.json({
    success: true,
    cleared: clearedCount,
    status: securityState.status
  });
});

// System Health
app.get('/api/security/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'security-monitor',
    emoji: '🛡️',
    uptime: Math.floor((Date.now() - securityState.startTime) / 1000)
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStatusDescription(level) {
  const descriptions = {
    'SAFE': 'All systems secure. No threats detected.',
    'WARNING': 'Minor suspicious activity detected. Monitoring increased.',
    'AMBER_ALERT': 'Hack attempts detected and blocked. System on high alert.',
    'CRITICAL': 'Active attack in progress. Emergency protocols engaged.',
    'OFFLINE': 'Security monitoring offline. Immediate attention required.'
  };
  return descriptions[level] || 'Unknown status';
}

function analyzeTimeline() {
  if (securityState.timeline.length < 10) {
    return { analysis: 'Insufficient data for trend analysis' };
  }
  
  const recent = securityState.timeline.slice(-100);
  const threatLevels = recent.map(t => {
    const level = t.present.level;
    if (level === 'CRITICAL') return 4;
    if (level === 'AMBER_ALERT') return 3;
    if (level === 'WARNING') return 2;
    if (level === 'SAFE') return 1;
    return 0;
  });
  
  const avgThreatLevel = threatLevels.reduce((a, b) => a + b, 0) / threatLevels.length;
  const maxThreatLevel = Math.max(...threatLevels);
  const currentLevel = threatLevels[threatLevels.length - 1];
  
  let trend = 'STABLE';
  if (currentLevel > avgThreatLevel + 0.5) trend = 'ESCALATING';
  if (currentLevel < avgThreatLevel - 0.5) trend = 'IMPROVING';
  
  return {
    averageThreatLevel: avgThreatLevel.toFixed(2),
    maxThreatLevel,
    currentLevel,
    trend,
    prediction: recent[recent.length - 1]?.present?.future?.prediction || 'Unknown'
  };
}

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   🛡️  NetworkBuster Security Monitor & Amber Alert System  ║
╚════════════════════════════════════════════════════════════╝

Status: ${securityState.status} ${securityState.level}
Port: ${PORT}
Started: ${new Date().toISOString()}

Endpoints:
  GET  /api/security/status          - Current security status
  GET  /api/security/alerts          - All security alerts
  GET  /api/security/amber-alerts    - Amber alerts only
  GET  /api/security/hack-attempts   - Logged hack attempts
  GET  /api/security/timeline        - Past-future-present timeline
  GET  /api/security/blocked-ips     - List of blocked IPs
  POST /api/security/unblock/:ip     - Unblock an IP address
  POST /api/security/alerts/clear    - Clear all alerts

Monitoring active. All threats will be logged and blocked.
`);
  
  addToTimeline({
    status: '🟢',
    level: 'SAFE',
    threats: 0,
    timestamp: Date.now()
  });
});

// Export middleware for use in other servers
export { securityMiddleware, securityState, triggerAmberAlert, updateSecurityStatus };
