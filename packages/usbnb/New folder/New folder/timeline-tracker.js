#!/usr/bin/env node

/**
 * NetworkBuster Timeline Tracker
 * Past-Future-Present Reference System for State Management
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.TIMELINE_PORT || 3007;

app.use(express.json());

// Timeline State Management
const timelineState = {
  past: [],      // Historical events and states
  present: null, // Current state snapshot
  future: [],    // Predicted/scheduled events
  version: '1.0.0',
  initialized: Date.now()
};

// Timeline Event Structure
class TimelineEvent {
  constructor(type, data, metadata = {}) {
    this.id = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.timestamp = Date.now();
    this.data = data;
    this.metadata = {
      ...metadata,
      capturedAt: new Date().toISOString()
    };
    this.context = {
      past: null,    // Reference to previous state
      present: this, // Self reference
      future: null   // Predicted next state
    };
  }
}

// State Snapshot
class StateSnapshot {
  constructor() {
    this.id = `snap-${Date.now()}`;
    this.timestamp = Date.now();
    this.system = this.captureSystemState();
    this.application = this.captureApplicationState();
    this.git = this.captureGitState();
    this.performance = this.capturePerformanceState();
  }

  captureSystemState() {
    const os = require('os');
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      uptime: os.uptime()
    };
  }

  captureApplicationState() {
    return {
      version: timelineState.version,
      uptime: Date.now() - timelineState.initialized,
      eventsRecorded: timelineState.past.length,
      futureEventsScheduled: timelineState.future.length
    };
  }

  captureGitState() {
    try {
      const { execSync } = require('child_process');
      return {
        branch: execSync('git branch --show-current', { encoding: 'utf-8' }).trim(),
        commit: execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim(),
        shortCommit: execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(),
        isDirty: execSync('git status --porcelain', { encoding: 'utf-8' }).trim().length > 0
      };
    } catch {
      return { error: 'Git not available or not a git repository' };
    }
  }

  capturePerformanceState() {
    const memUsage = process.memoryUsage();
    return {
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      },
      processUptime: process.uptime(),
      cpuUsage: process.cpuUsage()
    };
  }
}

// Add Event to Timeline
function addToTimeline(event) {
  // Link to past
  if (timelineState.past.length > 0) {
    event.context.past = timelineState.past[timelineState.past.length - 1];
  }

  // Add to past
  timelineState.past.push(event);

  // Update present
  timelineState.present = event;

  // Predict future based on patterns
  const prediction = predictFutureState(event);
  if (prediction) {
    event.context.future = prediction;
    scheduleFutureEvent(prediction);
  }

  // Cleanup old events (keep last 10000)
  if (timelineState.past.length > 10000) {
    timelineState.past = timelineState.past.slice(-10000);
  }

  return event;
}

// Predict Future State
function predictFutureState(currentEvent) {
  // Analyze patterns from recent past
  const recentEvents = timelineState.past.slice(-100);
  
  // Pattern detection
  const patterns = {
    deployment: /deploy|build|release/i,
    security: /security|threat|alert/i,
    performance: /performance|optimization|speed/i,
    error: /error|fail|crash/i
  };

  let prediction = null;

  // Check for deployment patterns
  if (patterns.deployment.test(currentEvent.type)) {
    prediction = {
      type: 'predicted_validation',
      confidence: 0.85,
      timestamp: Date.now() + 300000, // 5 minutes from now
      description: 'Validation and monitoring phase expected',
      recommendation: 'Monitor logs and metrics for 5-10 minutes'
    };
  }

  // Check for security patterns
  if (patterns.security.test(currentEvent.type)) {
    const recentSecurityEvents = recentEvents.filter(e => patterns.security.test(e.type));
    if (recentSecurityEvents.length > 5) {
      prediction = {
        type: 'predicted_escalation',
        confidence: 0.75,
        timestamp: Date.now() + 60000, // 1 minute from now
        description: 'Potential security escalation detected',
        recommendation: 'Increase monitoring, prepare incident response'
      };
    }
  }

  // Check for error patterns
  if (patterns.error.test(currentEvent.type)) {
    const errorRate = recentEvents.filter(e => patterns.error.test(e.type)).length / recentEvents.length;
    if (errorRate > 0.1) {
      prediction = {
        type: 'predicted_outage',
        confidence: 0.65,
        timestamp: Date.now() + 120000, // 2 minutes from now
        description: 'High error rate may lead to service degradation',
        recommendation: 'Review error logs, consider rollback'
      };
    }
  }

  return prediction;
}

// Schedule Future Event
function scheduleFutureEvent(prediction) {
  // Remove predictions that have become the present
  const now = Date.now();
  timelineState.future = timelineState.future.filter(f => f.timestamp > now);

  // Add new prediction
  timelineState.future.push(prediction);

  // Sort by timestamp
  timelineState.future.sort((a, b) => a.timestamp - b.timestamp);
}

// Timeline Analysis
function analyzeTimeline(startTime, endTime) {
  const events = timelineState.past.filter(e => 
    (!startTime || e.timestamp >= startTime) &&
    (!endTime || e.timestamp <= endTime)
  );

  const analysis = {
    period: {
      start: startTime || events[0]?.timestamp || Date.now(),
      end: endTime || Date.now(),
      duration: (endTime || Date.now()) - (startTime || events[0]?.timestamp || Date.now())
    },
    statistics: {
      totalEvents: events.length,
      uniqueTypes: new Set(events.map(e => e.type)).size,
      averageEventInterval: events.length > 1 
        ? (events[events.length - 1].timestamp - events[0].timestamp) / events.length
        : 0
    },
    patterns: detectPatterns(events),
    trends: analyzeTrends(events),
    predictions: generatePredictions(events)
  };

  return analysis;
}

// Detect Patterns
function detectPatterns(events) {
  const eventTypes = events.map(e => e.type);
  const patterns = [];

  // Check for repeating sequences
  for (let len = 2; len <= 5; len++) {
    const sequences = new Map();
    for (let i = 0; i <= eventTypes.length - len; i++) {
      const seq = eventTypes.slice(i, i + len).join('->');
      sequences.set(seq, (sequences.get(seq) || 0) + 1);
    }
    
    sequences.forEach((count, seq) => {
      if (count > 2) {
        patterns.push({
          pattern: seq,
          occurrences: count,
          confidence: count / (eventTypes.length - len + 1)
        });
      }
    });
  }

  return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
}

// Analyze Trends
function analyzeTrends(events) {
  if (events.length < 10) {
    return { trend: 'insufficient_data' };
  }

  const halfPoint = Math.floor(events.length / 2);
  const firstHalf = events.slice(0, halfPoint);
  const secondHalf = events.slice(halfPoint);

  const firstHalfTypes = new Set(firstHalf.map(e => e.type));
  const secondHalfTypes = new Set(secondHalf.map(e => e.type));

  return {
    trend: secondHalf.length > firstHalf.length ? 'increasing_activity' : 'stable',
    newEventTypes: [...secondHalfTypes].filter(t => !firstHalfTypes.has(t)),
    droppedEventTypes: [...firstHalfTypes].filter(t => !secondHalfTypes.has(t)),
    activityChange: ((secondHalf.length - firstHalf.length) / firstHalf.length * 100).toFixed(2) + '%'
  };
}

// Generate Predictions
function generatePredictions(events) {
  const predictions = [];
  const now = Date.now();

  if (events.length < 5) {
    return predictions;
  }

  // Calculate average interval between events
  const intervals = [];
  for (let i = 1; i < events.length; i++) {
    intervals.push(events[i].timestamp - events[i - 1].timestamp);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Predict next event
  const lastEvent = events[events.length - 1];
  predictions.push({
    type: 'next_event_prediction',
    expectedTime: lastEvent.timestamp + avgInterval,
    confidence: 0.7,
    reasoning: 'Based on average event interval'
  });

  // Predict pattern completion
  const patterns = detectPatterns(events);
  if (patterns.length > 0) {
    const topPattern = patterns[0];
    predictions.push({
      type: 'pattern_completion',
      pattern: topPattern.pattern,
      confidence: topPattern.confidence,
      reasoning: 'Pattern detected in historical data'
    });
  }

  return predictions;
}

// ============================================
// API ENDPOINTS
// ============================================

// Record Event
app.post('/api/timeline/event', (req, res) => {
  const { type, data, metadata } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: 'Event type is required' });
  }

  const event = new TimelineEvent(type, data, metadata);
  addToTimeline(event);

  res.json({
    success: true,
    event: {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp
    },
    context: {
      past: event.context.past ? event.context.past.id : null,
      future: event.context.future
    }
  });
});

// Get Current State
app.get('/api/timeline/present', (req, res) => {
  const snapshot = new StateSnapshot();
  
  res.json({
    present: timelineState.present,
    snapshot: snapshot,
    timestamp: Date.now()
  });
});

// Get Past Events
app.get('/api/timeline/past', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  const type = req.query.type;

  let events = timelineState.past;
  
  if (type) {
    events = events.filter(e => e.type === type);
  }

  res.json({
    events: events.slice(offset, offset + limit).reverse(),
    total: events.length,
    limit,
    offset
  });
});

// Get Future Predictions
app.get('/api/timeline/future', (req, res) => {
  const now = Date.now();
  const activePredictions = timelineState.future.filter(f => f.timestamp > now);

  res.json({
    predictions: activePredictions,
    count: activePredictions.length,
    nextPrediction: activePredictions[0] || null
  });
});

// Get Full Timeline
app.get('/api/timeline/full', (req, res) => {
  const startTime = req.query.start ? parseInt(req.query.start) : null;
  const endTime = req.query.end ? parseInt(req.query.end) : null;

  res.json({
    past: timelineState.past.filter(e => 
      (!startTime || e.timestamp >= startTime) &&
      (!endTime || e.timestamp <= endTime)
    ),
    present: timelineState.present,
    future: timelineState.future
  });
});

// Analyze Timeline
app.get('/api/timeline/analyze', (req, res) => {
  const startTime = req.query.start ? parseInt(req.query.start) : null;
  const endTime = req.query.end ? parseInt(req.query.end) : null;

  const analysis = analyzeTimeline(startTime, endTime);

  res.json(analysis);
});

// Timeline Statistics
app.get('/api/timeline/stats', (req, res) => {
  const now = Date.now();
  const last24h = timelineState.past.filter(e => now - e.timestamp < 86400000);
  const lastHour = timelineState.past.filter(e => now - e.timestamp < 3600000);

  res.json({
    total: {
      events: timelineState.past.length,
      predictions: timelineState.future.length
    },
    recent: {
      last24Hours: last24h.length,
      lastHour: lastHour.length
    },
    uptime: Date.now() - timelineState.initialized,
    version: timelineState.version
  });
});

// Export Timeline Data
app.get('/api/timeline/export', (req, res) => {
  const format = req.query.format || 'json';
  const data = {
    exported: new Date().toISOString(),
    timeline: {
      past: timelineState.past,
      present: timelineState.present,
      future: timelineState.future
    },
    metadata: {
      version: timelineState.version,
      initialized: timelineState.initialized,
      totalEvents: timelineState.past.length
    }
  };

  if (format === 'json') {
    res.json(data);
  } else if (format === 'csv') {
    const csv = convertToCSV(timelineState.past);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=timeline.csv');
    res.send(csv);
  } else {
    res.status(400).json({ error: 'Unsupported format' });
  }
});

// Clear Timeline (Admin)
app.post('/api/timeline/clear', (req, res) => {
  const backup = {
    past: timelineState.past,
    present: timelineState.present,
    future: timelineState.future,
    clearedAt: Date.now()
  };

  timelineState.past = [];
  timelineState.present = null;
  timelineState.future = [];

  res.json({
    success: true,
    cleared: backup.past.length,
    backup: backup
  });
});

// Health Check
app.get('/api/timeline/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'timeline-tracker',
    emoji: '⏰',
    uptime: Date.now() - timelineState.initialized
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function convertToCSV(events) {
  const headers = ['ID', 'Type', 'Timestamp', 'ISO Time', 'Data'];
  const rows = events.map(e => [
    e.id,
    e.type,
    e.timestamp,
    new Date(e.timestamp).toISOString(),
    JSON.stringify(e.data)
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

// ============================================
// AUTO-CAPTURE SYSTEM EVENTS
// ============================================

// Capture startup event
addToTimeline(new TimelineEvent('system_startup', {
  service: 'timeline-tracker',
  port: PORT,
  version: timelineState.version
}));

// Capture periodic snapshots
setInterval(() => {
  const snapshot = new StateSnapshot();
  addToTimeline(new TimelineEvent('periodic_snapshot', snapshot));
}, 300000); // Every 5 minutes

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   ⏰ NetworkBuster Timeline Tracker                        ║
║   Past-Future-Present Reference System                    ║
╚════════════════════════════════════════════════════════════╝

Port: ${PORT}
Version: ${timelineState.version}
Started: ${new Date().toISOString()}

Endpoints:
  POST /api/timeline/event        - Record new event
  GET  /api/timeline/present      - Get current state
  GET  /api/timeline/past         - Get historical events
  GET  /api/timeline/future       - Get predictions
  GET  /api/timeline/full         - Get complete timeline
  GET  /api/timeline/analyze      - Analyze timeline patterns
  GET  /api/timeline/stats        - Get statistics
  GET  /api/timeline/export       - Export timeline data
  POST /api/timeline/clear        - Clear timeline (admin)

Timeline tracking active. Recording all system states.
`);
});

export { TimelineEvent, StateSnapshot, addToTimeline, analyzeTimeline };
