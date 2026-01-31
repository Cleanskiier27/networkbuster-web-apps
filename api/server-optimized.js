import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Performance: Enable compression
app.use(compression());
app.use(helmet());

// Performance: Limit request size
app.use(express.json({ limit: '1mb' }));

// Performance: Load and cache specs on startup
let specsCache = null;
let specsCacheTTL = 0;
const CACHE_DURATION = 300000; // 5 minutes

function loadAndCacheSpecs() {
  try {
    specsCache = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/system-specifications.json'), 'utf8'));
    specsCacheTTL = Date.now() + CACHE_DURATION;
    return specsCache;
  } catch (error) {
    console.error('Error loading specs:', error);
    return null;
  }
}

// Load specs on startup
loadAndCacheSpecs();

// Performance: Specs endpoint with caching
app.get('/api/specs', (req, res) => {
  // Set cache headers
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  
  // Reload if cache expired
  if (Date.now() > specsCacheTTL) {
    loadAndCacheSpecs();
  }
  
  if (specsCache) {
    res.json(specsCache);
  } else {
    res.status(500).json({ error: 'Failed to load specifications' });
  }
});

// Performance: Section-specific specs with caching
app.get('/api/specs/:section', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  
  // Reload if cache expired
  if (Date.now() > specsCacheTTL) {
    loadAndCacheSpecs();
  }
  
  const section = req.params.section.toLowerCase();
  if (specsCache && specsCache[section]) {
    res.json({ [section]: specsCache[section] });
  } else {
    res.status(404).json({ error: 'Section not found' });
  }
});

// Performance: Lightweight health endpoint (no caching needed)
app.get('/health', (req, res) => {
  // Minimal response for load balancers
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Performance: Additional monitoring endpoint
app.get('/api/health/detailed', (req, res) => {
  res.set('Cache-Control', 'public, max-age=5');
  
  const memUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    },
    cached: specsCache ? 'yes' : 'no',
    cacheAge: specsCache ? Math.round((Date.now() - (specsCacheTTL - CACHE_DURATION)) / 1000) : 'N/A'
  });
});

// Performance: Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Performance: 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Performance: Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Optimized API Server running at http://localhost:${PORT}`);
  console.log(`⚡ Performance optimizations enabled:`);
  console.log(`   • Compression (gzip) enabled`);
  console.log(`   • Response caching enabled (5 min)`);
  console.log(`   • Specs cached in memory`);
  console.log(`   • Helmet security middleware active`);
  console.log(`   • Efficient error handling`);
  console.log(`\n📍 Routes:`);
  console.log(`📊 Specs: http://localhost:${PORT}/api/specs`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`📈 Detailed Health: http://localhost:${PORT}/api/health/detailed\n`);
});

// Performance: Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('API Server closed');
    process.exit(0);
  });
});
