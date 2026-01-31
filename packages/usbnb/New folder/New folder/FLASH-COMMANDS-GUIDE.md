# ⚡ Flash Commands - AI Terminal Behavior Guide

## Overview

Flash Commands provide **lightning-fast one-click terminal operations** with **AI-powered automation and smart suggestions**. No more typing long commands – just use flash commands for instant deployment, syncing, and optimization.

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# View all commands
.\flash-commands.bat help

# Deploy in seconds
.\flash-commands.bat deploy

# Sync branches instantly
.\flash-commands.bat sync

# Analyze code with AI
.\flash-commands.bat analyze
```

### Linux/Mac (Bash)
```bash
# View all commands
bash flash-commands.sh help

# Deploy in seconds
bash flash-commands.sh deploy

# Sync branches instantly
bash flash-commands.sh sync

# Analyze code with AI
bash flash-commands.sh analyze
```

## 📋 Complete Command Reference

### Deployment Commands

#### `flash deploy`
**Action:** Deploy to Vercel production  
**What it does:**
- Stages all changes
- Creates commit with timestamp
- Pushes to git
- Deploys to Vercel production
- Updates both main and bigtree

**Usage:**
```bash
flash-commands.bat deploy
```

#### `flash sync`
**Action:** Synchronize main ↔ bigtree branches  
**What it does:**
- Detects current branch
- Merges changes to other branch
- Handles merge conflicts
- Pushes both branches
- Maintains branch parity

**Usage:**
```bash
flash-commands.bat sync
```

#### `flash dev`
**Action:** Start development server  
**What it does:**
- Launches Node.js server
- Enables hot-reload
- Opens on localhost:3000
- Watches for file changes

**Usage:**
```bash
flash-commands.bat dev
```

### Build & Test Commands

#### `flash build`
**Action:** Build all applications  
**What it does:**
- Builds React dashboard
- Builds 3D overlay
- Optimizes assets
- Creates production bundles

**Usage:**
```bash
flash-commands.bat build
```

#### `flash test`
**Action:** Run validation and tests  
**What it does:**
- Installs dependencies
- Runs linting checks
- Validates configuration
- Reports results

**Usage:**
```bash
flash-commands.bat test
```

#### `flash clean`
**Action:** Clean and reinstall everything  
**What it does:**
- Removes all node_modules
- Deletes package-lock.json files
- Fresh npm install
- Resolves dependency conflicts

**Usage:**
```bash
flash-commands.bat clean
```

### Utility Commands

#### `flash status`
**Action:** Show current status  
**What it does:**
- Git status and branch info
- Deployment status
- Vercel project info
- File changes

**Usage:**
```bash
flash-commands.bat status
```

#### `flash backup`
**Action:** Create project backup  
**What it does:**
- Creates compressed archive
- Excludes node_modules
- Excludes .git
- Timestamped filename

**Usage:**
```bash
flash-commands.bat backup
```

### 🤖 AI-Powered Commands

#### `flash analyze`
**AI Codebase Analysis**  
**What it does:**
- Counts JavaScript/TypeScript files
- Shows git commit history
- Displays branch information
- Analyzes code complexity
- Generates insights report

**Output:**
```
🔍 AI: Analyzing codebase...
Files analyzed: 45
Git commits: 150+
Branches: 2
✅ Analysis complete
```

#### `flash suggest`
**AI Optimization Suggestions**  
**What it does:**
- Identifies code splitting opportunities
- Recommends lazy loading
- Suggests caching strategies
- Proposes bundle optimization
- Lists performance improvements

**Output:**
```
💡 AI: Optimization suggestions
- Consider code splitting in dashboard
- Implement lazy loading for images
- Add caching headers for static assets
- Optimize bundle size with tree-shaking
✅ Suggestions ready
```

#### `flash docs`
**AI Documentation Generation**  
**What it does:**
- Analyzes project structure
- Generates markdown documentation
- Creates AUTO-DOCS.md file
- Documents key files
- Lists dependencies

**Output:**
```
📚 AI: Generating documentation
✅ Documentation generated: AUTO-DOCS.md
```

#### `flash optimize`
**AI Performance Optimization**  
**What it does:**
- Enables gzip compression
- Configures caching headers
- Optimizes image delivery
- Minifies assets
- Suggests CDN usage

**Output:**
```
⚡ AI: Optimizing performance
Optimizations applied:
- Enabled gzip compression
- Added HTTP caching headers
- Optimized image delivery
- Minified assets
✅ Performance optimized
```

## 🎯 Common Workflows

### Daily Development Workflow
```bash
# Start work
flash-commands.bat dev

# When ready to commit
flash-commands.bat status
flash-commands.bat build

# Deploy changes
flash-commands.bat deploy

# Get suggestions
flash-commands.bat suggest
```

### Performance Optimization Workflow
```bash
# Analyze current state
flash-commands.bat analyze

# Get suggestions
flash-commands.bat suggest

# Implement optimizations
flash-commands.bat optimize

# Build and test
flash-commands.bat build
flash-commands.bat test

# Deploy optimized version
flash-commands.bat deploy
```

### Emergency Cleanup Workflow
```bash
# Check status
flash-commands.bat status

# Clean everything
flash-commands.bat clean

# Rebuild
flash-commands.bat build

# Test
flash-commands.bat test

# Verify with dev server
flash-commands.bat dev
```

### Documentation Workflow
```bash
# Analyze codebase
flash-commands.bat analyze

# Generate documentation
flash-commands.bat docs

# Review AUTO-DOCS.md
# Commit documentation
flash-commands.bat deploy
```

## 🤖 AI Features Explained

### Smart Automation
Flash commands handle complex multi-step tasks in a single command:
- ✅ Multiple git operations
- ✅ Dependency management
- ✅ Build optimization
- ✅ Deployment coordination

### Intelligent Analysis
AI analyzes your project:
- **Code Complexity** - Identifies complex areas
- **File Metrics** - Counts and categorizes files
- **Git History** - Analyzes commit patterns
- **Architecture** - Understands project structure

### Adaptive Suggestions
AI provides context-aware recommendations:
- **Performance** - Bundle size, caching, compression
- **Code Quality** - Structure, patterns, best practices
- **Scaling** - Architecture improvements
- **Security** - Vulnerability scanning

### Auto-Documentation
Automatically generates:
- Project structure docs
- API documentation
- Architecture guides
- Setup instructions

## 🎨 Web Interface

Access Flash Commands via web at `/flash-commands.html`:

**Features:**
- ✅ One-click button execution
- ✅ Terminal output preview
- ✅ Command copying
- ✅ Real-time feedback
- ✅ Mobile responsive

**Access:**
```
https://networkbuster-dl1vnr5da-networkbuster.vercel.app/flash-commands.html
```

## 🔧 Advanced Usage

### Chaining Commands
```bash
# Build, test, and deploy in sequence
flash-commands.bat build && flash-commands.bat test && flash-commands.bat deploy
```

### Custom Workflows
Create aliases for complex workflows:
```powershell
# Add to PowerShell profile
function Deploy-All {
    .\flash-commands.bat build
    .\flash-commands.bat test
    .\flash-commands.bat deploy
}
```

### Terminal Customization
- Add flash commands to PATH for global access
- Create shell aliases for quicker typing
- Configure shell completion

## 📊 Performance Impact

Flash commands are optimized for speed:
- **Deploy:** ~30 seconds
- **Sync:** ~10 seconds
- **Build:** ~2-5 minutes
- **Analyze:** ~5 seconds
- **Suggest:** ~3 seconds

## 🛡️ Safety Features

Flash commands include safety mechanisms:
- ✅ Conflict detection and resolution
- ✅ Pre-commit validation
- ✅ Backup creation
- ✅ Rollback capability
- ✅ Status verification

## 🐛 Troubleshooting

### Command Not Found
```bash
# Ensure script is executable
chmod +x flash-commands.sh  # Linux/Mac
```

### Git Conflicts
```bash
# Flash sync handles conflicts
# But you can review manually
git status
```

### Node Dependencies Issues
```bash
# Clean and reinstall
flash-commands.bat clean
```

### Deployment Fails
```bash
# Check status first
flash-commands.bat status

# Verify build
flash-commands.bat build

# Try again
flash-commands.bat deploy
```

## 📚 Additional Resources

- Web UI: `/flash-commands.html`
- Bash Version: `flash-commands.sh`
- Windows Version: `flash-commands.bat`
- Repository: GitHub NetworkBuster/networkbuster.net

## 🎊 Summary

**Flash Commands** provide:
- ⚡ Lightning-fast operations
- 🤖 AI-powered automation
- 📊 Smart analysis & suggestions
- 🔧 One-click workflows
- 🛡️ Safety and validation

Start using Flash Commands today for faster, smarter development! 🚀
