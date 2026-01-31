# NetworkBuster Auth UI v750

Modern, secure authentication UI with full backend API support.

## Features

- 🔐 **Login & Registration** - Full authentication flow
- 🎨 **Modern Design** - Gradient UI with smooth transitions
- 📱 **Responsive** - Mobile-friendly interface
- 🔒 **Security** - Helmet.js security headers
- ⚡ **Performance** - Compression enabled
- 🐳 **Docker Ready** - Multi-stage optimized Dockerfile
- 🔄 **Token Management** - JWT-style token generation
- 👤 **User Management** - Create, verify, and manage users

## Quick Start

### Local Development

```bash
cd auth-ui/v750
node server.js
```

Navigate to `http://localhost:3003`

### With Docker

```bash
docker build -f auth-ui/v750/Dockerfile -t networkbuster-auth:v750 .
docker run -p 3003:3003 networkbuster-auth:v750
```

### With Docker Compose

```bash
docker-compose up auth-ui
```

## API Endpoints

### Authentication

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "remember": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "dXNlckBlkxhbXBsZS5jb206MTczNDIwNDAwMDAwMA==",
  "user": {
    "email": "user@example.com",
    "name": "user",
    "createdAt": "2025-12-14T17:30:00Z"
  }
}
```

#### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Verify Token
```bash
POST /api/auth/verify
Content-Type: application/json

{
  "token": "dXNlckBlkxhbXBsZS5jb206MTczNDIwNDAwMDAwMA=="
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer dXNlckBlkxhbXBsZS5jb206MTczNDIwNDAwMDAwMA==
```

#### Logout
```bash
POST /api/auth/logout
```

#### Get Stats
```bash
GET /api/auth/stats
```

## Health Checks

```bash
# Basic health check
curl http://localhost:3003/health

# API health
curl http://localhost:3003/api/health
```

## Environment Variables

- `AUTH_PORT` - Port to run on (default: 3003)
- `NODE_ENV` - Environment (production/development)

## UI Features

### Login Tab
- Email/Password authentication
- Remember me checkbox
- Social login buttons (UI placeholder)
- Forgot password link
- Sign up redirection

### Sign Up Tab
- Name, email, password fields
- Password confirmation
- Password strength validation (min 8 chars)
- Terms acceptance checkbox
- Login redirection

### Interactive Elements
- Password visibility toggle
- Real-time form validation
- Success/error messages
- Responsive design
- Smooth animations

## Demo Credentials

The authentication system runs in **demo mode** and will:
- Auto-create users on first login attempt
- Store users in memory (persists during session)
- Accept any password on login
- Require strong passwords on signup (8+ chars)

**Test Login:**
```
Email: demo@networkbuster.net
Password: demo123
```

**Create Account:**
```
Name: Demo User
Email: test@example.com
Password: TestPass123!
```

## Architecture

```
auth-ui/v750/
├── index.html      # Modern authentication UI
├── server.js       # Express.js backend
└── Dockerfile      # Multi-stage Docker build

Features:
- Helmet.js for security headers
- Express compression middleware
- Static file serving
- RESTful API endpoints
- In-memory user database (demo)
- Token generation & verification
```

## Security Considerations

### Current (Demo)
- Passwords stored in plain text (demo only)
- In-memory storage (no persistence)
- Basic token validation

### Production Recommendations
- Use bcrypt for password hashing
- Implement JWT tokens with signing keys
- Use database (MongoDB, PostgreSQL, etc.)
- Add rate limiting on auth endpoints
- Enable HTTPS/TLS
- Implement refresh token rotation
- Add CSRF protection
- Use secure, HttpOnly cookies

## Customization

### Change Port
```bash
AUTH_PORT=8080 node server.js
```

### Modify Branding
Edit `index.html`:
- Change gradient colors (line ~20)
- Update service name (line ~212)
- Modify social login providers

### Add Database
Replace in-memory `Map` with database calls:
```javascript
// Instead of:
const users = new Map();

// Use:
const db = new Database();
const users = db.collection('users');
```

## Performance

- **Build Time:** ~30 seconds (multi-stage)
- **Image Size:** ~200MB (Node.js Alpine + deps)
- **Startup Time:** <2 seconds
- **Memory Usage:** ~50-80MB at idle

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 3003
netstat -ano | findstr :3003

# Kill process
taskkill /PID <PID> /F
```

### Docker Build Fails
```bash
# Clean cache
docker system prune -a

# Rebuild
docker build -f auth-ui/v750/Dockerfile -t networkbuster-auth:v750 .
```

### CORS Issues
Add CORS middleware if integrating with other services:
```javascript
import cors from 'cors';
app.use(cors());
```

## Version History

- **v750** (Current)
  - Modern responsive design
  - Full authentication API
  - Docker support
  - Security headers
  - Health checks
  - Token management

## License

MIT - See [LICENSE](../../LICENSE) in root directory

## Support

For issues or feature requests, please visit:
https://github.com/NetworkBuster/networkbuster.net/issues
