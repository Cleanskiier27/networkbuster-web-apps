import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.AUTH_PORT || 3003;

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CORS - Allow all origins for open challenge access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mock user database
const users = new Map();
const sessions = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-ui-v750-lunar-recycling',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    publicAPI: true
  });
});

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'v750',
    environment: 'lunar-recycling-challenge',
    endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/signup',
      'POST /api/auth/logout',
      'GET /api/auth/sessions',
      'POST /api/auth/verify',
      'GET /api/auth/me'
    ]
  });
});

// Open: Login endpoint (no token required, auto-creates users)
app.post('/api/auth/login', (req, res) => {
  const { email, password, remember } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }

  // Auto-create or get user
  let user = users.get(email);
  
  if (!user) {
    user = {
      email,
      password,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
      loginCount: 0
    };
  }

  user.loginCount = (user.loginCount || 0) + 1;
  user.lastLogin = new Date().toISOString();
  users.set(email, user);

  const token = generateToken(email);
  const sessionId = createSession(email, token);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    sessionId,
    user: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin
    },
    rememberMe: remember
  });
});

// Open: Signup endpoint (public registration)
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password required'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }

  if (users.has(email)) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Create user
  const user = {
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
    loginCount: 1,
    lastLogin: new Date().toISOString()
  };

  users.set(email, user);
  const token = generateToken(email);
  const sessionId = createSession(email, token);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    sessionId,
    user: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      loginCount: user.loginCount
    }
  });
});

// Open: Verify token endpoint
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token required'
    });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [email] = decoded.split(':');

    if (users.has(email)) {
      const user = users.get(email);
      return res.status(200).json({
        success: true,
        valid: true,
        user: {
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        }
      });
    }

    res.status(401).json({
      success: false,
      valid: false,
      message: 'User not found'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      message: 'Token verification failed'
    });
  }
});

// Open: Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Open: Get current user (token-optional)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

  if (!token) {
    return res.status(200).json({
      success: true,
      user: null,
      message: 'No user authenticated'
    });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [email] = decoded.split(':');

    if (users.has(email)) {
      const user = users.get(email);
      return res.json({
        success: true,
        user: {
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          loginCount: user.loginCount,
          lastLogin: user.lastLogin
        }
      });
    }

    res.json({
      success: true,
      user: null
    });
  } catch (error) {
    res.json({
      success: true,
      user: null
    });
  }
});

// Open: Get all active sessions
app.get('/api/auth/sessions', (req, res) => {
  const sessionList = Array.from(sessions.entries()).map(([sessionId, data]) => ({
    sessionId,
    email: data.email,
    token: data.token.substring(0, 20) + '...',
    createdAt: data.createdAt,
    lastActivity: data.lastActivity
  }));

  res.json({
    success: true,
    activeSessions: sessionList.length,
    sessions: sessionList
  });
});

// Open: Get user stats
app.get('/api/auth/stats', (req, res) => {
  const totalLogins = Array.from(users.values()).reduce((sum, user) => sum + (user.loginCount || 0), 0);
  
  res.json({
    success: true,
    stats: {
      totalUsers: users.size,
      totalSessions: sessions.size,
      totalLogins,
      registeredEmails: Array.from(users.keys()),
      timestamp: new Date().toISOString()
    }
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Auth UI v750 - Lunar Recycling Challenge',
    description: 'Open Public Authentication API',
    baseUrl: 'http://localhost:3003',
    endpoints: {
      'POST /api/auth/login': {
        description: 'Login or auto-create user',
        body: { email: 'string', password: 'string', remember: 'boolean' },
        public: true
      },
      'POST /api/auth/signup': {
        description: 'Create new account',
        body: { name: 'string', email: 'string', password: 'string (8+ chars)' },
        public: true
      },
      'POST /api/auth/verify': {
        description: 'Verify token validity',
        body: { token: 'string' },
        public: true
      },
      'POST /api/auth/logout': {
        description: 'Logout and destroy session',
        body: { sessionId: 'string' },
        public: true
      },
      'GET /api/auth/me': {
        description: 'Get current user (token optional)',
        query: { token: 'string (optional)' },
        headers: { Authorization: 'Bearer <token> (optional)' },
        public: true
      },
      'GET /api/auth/sessions': {
        description: 'List active sessions',
        public: true
      },
      'GET /api/auth/stats': {
        description: 'Get authentication statistics',
        public: true
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
    path: req.path
  });
});

function generateToken(email) {
  const data = `${email}:${Date.now()}`;
  return Buffer.from(data).toString('base64');
}

function createSession(email, token) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessions.set(sessionId, {
    email,
    token,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  });
  return sessionId;
}

app.listen(PORT, () => {
  console.log(`
🔐 Auth UI Server v750 - Lunar Recycling Challenge
🌍 Running at http://localhost:${PORT}
📍 Features:
   ✓ Open Public API (no authentication required)
   ✓ CORS enabled for all origins
   ✓ Auto-user creation on login
   ✓ Session management
   ✓ Token verification
   ✓ User statistics
   ✓ Full API documentation at /api/docs
`);
});
