// Command Index for NetBot Command Search
const COMMAND_INDEX = [
  {
    name: 'Flash Deploy',
    keywords: ['deploy', 'vercel', 'production', 'push', 'release'],
    command: 'flash_commands.bat deploy',
    description: 'Deploy to Vercel production in one command. Automatically commits changes with timestamp.'
  },
  {
    name: 'Flash Sync',
    keywords: ['sync', 'branches', 'merge', 'conflict', 'main', 'bigtree'],
    command: 'flash_commands.bat sync',
    description: 'Synchronize main and bigtree branches automatically with conflict resolution.'
  },
  {
    name: 'Flash Dev',
    keywords: ['dev', 'development', 'start', 'hot-reload', 'server'],
    command: 'npm start',
    description: 'Start development server with hot-reload and instant feedback.'
  },
  {
    name: 'Flash Build',
    keywords: ['build', 'production', 'compile'],
    command: 'flash_commands.bat build',
    description: 'Build all applications (dashboard, overlay, etc) for production.'
  },
  {
    name: 'Flash Test',
    keywords: ['test', 'validate', 'check'],
    command: 'flash_commands.bat test',
    description: 'Run validation checks and tests across the codebase.'
  },
  {
    name: 'Flash Clean',
    keywords: ['clean', 'dependencies', 'reinstall', 'fix'],
    command: 'flash_commands.bat clean',
    description: 'Clean all dependencies and reinstall fresh. Useful for resolving issues.'
  },
  {
    name: 'Flash Status',
    keywords: ['status', 'git', 'deploy', 'info'],
    command: 'flash_commands.bat status',
    description: 'Check git status and deployment information at a glance.'
  },
  {
    name: 'Flash Backup',
    keywords: ['backup', 'compress', 'archive', 'save'],
    command: 'flash_commands.bat backup',
    description: 'Create compressed backup of the project (excludes node_modules and .git).'
  },
  {
    name: 'Flash Analyze',
    keywords: ['analyze', 'analyser', 'analysis', 'files', 'insights'],
    command: 'flash_commands.bat analyze',
    description: 'AI automatically analyzes your codebase, counts files, and provides insights.'
  },
  {
    name: 'Flash Suggest',
    keywords: ['suggest', 'recommend', 'advice', 'tips', 'best practices'],
    command: 'flash_commands.bat suggest',
    description: 'AI suggests code optimizations and best practices for your project.'
  },
  {
    name: 'Flash Docs',
    keywords: ['docs', 'documentation', 'generate', 'markdown'],
    command: 'flash_commands.bat docs',
    description: 'AI generates project documentation automatically in markdown format.'
  },
  {
    name: 'Flash Optimize',
    keywords: ['optimize', 'performance', 'compression', 'cache'],
    command: 'flash_commands.bat optimize',
    description: 'AI applies performance optimizations including compression and caching.'
  }
];

function searchCommandIndex(userInput) {
  const input = userInput.toLowerCase();
  // Score commands by keyword matches
  const matches = COMMAND_INDEX.map(cmd => {
    let score = 0;
    for (const kw of cmd.keywords) {
      if (input.includes(kw)) score++;
    }
    return { ...cmd, score };
  }).filter(cmd => cmd.score > 0);
  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3); // Return top 3
}
// NetworkBuster AI Chatbot - Client-side module
// Trained knowledge base for NetworkBuster ecosystem

const CHATBOT_CONFIG = {
  name: 'NetBot',
  version: '1.0.0',
  avatar: '🤖',
  personality: 'helpful, technical, friendly'
};

// AI Knowledge Base - Training Data
const KNOWLEDGE_BASE = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    responses: [
      "Hello! I'm NetBot, your NetworkBuster AI assistant. How can I help you today?",
      "Hey there! Welcome to NetworkBuster. What would you like to know?",
      "Hi! I'm here to help you navigate NetworkBuster's features. Ask me anything!"
    ]
  },
  farewell: {
    patterns: ['bye', 'goodbye', 'see you', 'later', 'exit', 'quit'],
    responses: [
      "Goodbye! Feel free to come back anytime you need help.",
      "See you later! Happy coding!",
      "Bye! Don't forget to check out our latest features!"
    ]
  },
  about: {
    patterns: ['what is networkbuster', 'about', 'tell me about', 'what do you do', 'what is this'],
    responses: [
      "NetworkBuster is a multi-server ecosystem featuring web services, APIs, audio streaming, and AI-powered tools. We specialize in lunar recycling technology and real-time data visualization.",
      "I'm part of the NetworkBuster platform - a comprehensive system with web servers (port 3000), APIs (port 3001), audio streaming (port 3002), and authentication services (port 3003)."
    ]
  },
  servers: {
    patterns: ['servers', 'ports', 'services', 'what ports', 'running services'],
    responses: [
      "NetworkBuster runs on multiple servers:\n• Web Server: Port 3000\n• API Server: Port 3001\n• Audio Server: Port 3002\n• Auth Server: Port 3003\n• Flash USB Service: Port 3004"
    ]
  },
  features: {
    patterns: ['features', 'what can you do', 'capabilities', 'functions'],
    responses: [
      "NetworkBuster features include:\n• 🌐 Web Dashboard & Control Panel\n• 🎵 Music Player with 5-band Equalizer\n• 🔊 Real-time Audio Streaming\n• 🌙 Lunar Recycling Challenge\n• 🤖 AI World Overlay\n• 📊 Satellite Mapping\n• 🔐 Authentication System\n• 💾 USB Flash Upgrade Service"
    ]
  },
  lunar: {
    patterns: ['lunar', 'moon', 'recycling', 'space', 'challenge'],
    responses: [
      "The Lunar Recycling Challenge is our flagship project! It involves processing lunar regolith for resource extraction, 3D printing from moon materials, and sustainable space habitat development. Check out /challengerepo for more!",
      "Our lunar technology focuses on sustainable resource management in space. We're developing systems for material processing, environmental monitoring, and habitat construction on the Moon."
    ]
  },
  audio: {
    patterns: ['audio', 'music', 'sound', 'equalizer', 'streaming'],
    responses: [
      "Our Audio Lab features:\n• Real-time frequency synthesis\n• AI frequency detection\n• 5-band equalizer (Bass, Low Mid, Mid, High Mid, Treble)\n• Spotify integration\n• Volume control with mute toggle\n\nAccess it at port 3002!"
    ]
  },
  dashboard: {
    patterns: ['dashboard', 'control panel', 'admin'],
    responses: [
      "The Dashboard provides real-time monitoring and control:\n• System status overview\n• Server health metrics\n• Quick actions panel\n• Music player controls\n\nAccess: /dashboard or /control-panel"
    ]
  },
  api: {
    patterns: ['api', 'endpoints', 'rest', 'data'],
    responses: [
      "Our API (port 3001) provides:\n• GET /api/health - System health check\n• GET /api/specs - System specifications\n• GET /api/status - Server status\n• POST /api/data - Data submission\n\nAll endpoints support CORS for cross-origin requests."
    ]
  },
  docker: {
    patterns: ['docker', 'container', 'compose', 'deploy'],
    responses: [
      "NetworkBuster supports Docker deployment:\n• docker-compose-flash.yml - Full stack with USB support\n• Dockerfile - Standard web deployment\n• Dockerfile.flash - USB upgrade container\n\nRun: npm run flash:compose"
    ]
  },
  help: {
    patterns: ['help', 'commands', 'what can i ask', 'options'],
    responses: [
      "I can help you with:\n• 📖 About NetworkBuster\n• 🖥️ Server information\n• ⭐ Features overview\n• 🌙 Lunar Challenge\n• 🎵 Audio & Music\n• 📊 Dashboard\n• 🔗 API endpoints\n• 🐳 Docker deployment\n• 💻 Technical support\n\nJust ask me anything!"
    ]
  },
  technical: {
    patterns: ['error', 'problem', 'issue', 'not working', 'bug', 'fix'],
    responses: [
      "For technical issues, try these steps:\n1. Check if all servers are running (npm run start:local)\n2. Verify port availability (3000-3004)\n3. Clear browser cache\n4. Check console for errors\n\nNeed more help? Describe the specific issue!"
    ]
  },
  aiworld: {
    patterns: ['ai world', 'overlay', 'avatar', 'immersive'],
    responses: [
      "AI World is our immersive overlay interface featuring:\n• Avatar World - 3D character interactions\n• Satellite Map - Real-time positioning\n• Camera Feed - Live video integration\n• Connection Graph - Network visualization\n• Immersive Reader - Enhanced content display\n• Audio Lab - Sound synthesis\n\nAccess: /overlay"
    ]
  }
};

// Sentiment Analysis
const SENTIMENT_WORDS = {
  positive: ['good', 'great', 'awesome', 'excellent', 'amazing', 'love', 'thanks', 'thank', 'helpful', 'cool', 'nice', 'wonderful'],
  negative: ['bad', 'terrible', 'awful', 'hate', 'broken', 'stupid', 'useless', 'wrong', 'annoying', 'frustrated'],
  question: ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does']
};

class NetworkBusterChatbot {
      // Enhanced: Suggest commands if relevant
      addCommandSuggestions(userInput) {
        const matches = searchCommandIndex(userInput);
        if (matches.length === 0) return;
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'chatbot-message bot-message';
        suggestionDiv.innerHTML = '<b>Relevant Commands:</b><ul style="margin:8px 0 0 16px;">' +
          matches.map(cmd => `<li><b>${cmd.name}:</b> <code>${cmd.command}</code><br><span style='font-size:0.95em;color:#8b949e;'>${cmd.description}</span></li>`).join('') + '</ul>';
        messagesContainer.appendChild(suggestionDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    setEnabled(enabled) {
      const container = this.container;
      if (!container) return;
      if (enabled) {
        container.style.display = '';
        // Optionally re-enable input
        const input = container.querySelector('#chatbot-input');
        if (input) input.disabled = false;
      } else {
        container.style.display = 'none';
        // Optionally disable input
        const input = container.querySelector('#chatbot-input');
        if (input) input.disabled = true;
      }
    }
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.conversationHistory = [];
    this.isTyping = false;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.addMessage('bot', this.getRandomResponse(KNOWLEDGE_BASE.greetings.responses));
  }

  render() {
    this.container.innerHTML = `
      <div class="chatbot-container">
        <div class="chatbot-header">
          <span class="chatbot-avatar">${CHATBOT_CONFIG.avatar}</span>
          <span class="chatbot-name">${CHATBOT_CONFIG.name}</span>
          <span class="chatbot-status">● Online</span>
          <button class="chatbot-minimize" id="chatbot-minimize">−</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-typing" id="chatbot-typing" style="display: none;">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" placeholder="Ask me anything..." autocomplete="off">
          <button id="chatbot-send">➤</button>
        </div>
        <div class="chatbot-quick-actions">
          <button class="quick-action" data-query="features">Features</button>
          <button class="quick-action" data-query="servers">Servers</button>
          <button class="quick-action" data-query="help">Help</button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const minimizeBtn = document.getElementById('chatbot-minimize');
    const quickActions = document.querySelectorAll('.quick-action');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isTyping) {
        this.handleUserInput(input.value);
        input.value = '';
      }
    });

    sendBtn.addEventListener('click', () => {
      if (!this.isTyping && input.value.trim()) {
        this.handleUserInput(input.value);
        input.value = '';
      }
    });

    minimizeBtn.addEventListener('click', () => {
      this.container.classList.toggle('minimized');
      minimizeBtn.textContent = this.container.classList.contains('minimized') ? '+' : '−';
    });

    quickActions.forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleUserInput(btn.dataset.query);
      });
    });
  }

  handleUserInput(message) {
    if (!message.trim()) return;
    this.addMessage('user', message);
    this.conversationHistory.push({ role: 'user', content: message });
    this.showTyping();
    const responseTime = Math.random() * 1000 + 500;
    setTimeout(() => {
      const response = this.generateResponse(message);
      this.hideTyping();
      this.addMessage('bot', response);
      this.addCommandSuggestions(message);
      this.conversationHistory.push({ role: 'bot', content: response });
    }, responseTime);
  }

  generateResponse(input) {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check sentiment first
    const sentiment = this.analyzeSentiment(normalizedInput);
    
    // Find matching knowledge base entry
    for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
      for (const pattern of data.patterns) {
        if (normalizedInput.includes(pattern)) {
          let response = this.getRandomResponse(data.responses);
          
          // Add sentiment-based prefix
          if (sentiment === 'positive' && category !== 'greetings') {
            response = "I'm glad you're interested! " + response;
          } else if (sentiment === 'negative') {
            response = "I understand your concern. " + response;
          }
          
          return response;
        }
      }
    }
    
    // Context-aware fallback responses
    if (this.isQuestion(normalizedInput)) {
      return this.handleUnknownQuestion(normalizedInput);
    }
    
    return this.getRandomResponse([
      "I'm not sure I understand. Could you rephrase that? Try asking about features, servers, or the lunar challenge!",
      "Interesting! I'd love to help, but I need more context. What would you like to know about NetworkBuster?",
      "I'm still learning! Try asking me about our servers, features, or type 'help' to see what I can do."
    ]);
  }

  analyzeSentiment(text) {
    const words = text.split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (SENTIMENT_WORDS.positive.includes(word)) positiveCount++;
      if (SENTIMENT_WORDS.negative.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  isQuestion(text) {
    return SENTIMENT_WORDS.question.some(word => text.startsWith(word)) || text.endsWith('?');
  }

  handleUnknownQuestion(question) {
    const questionWords = question.split(/\s+/);
    
    // Try to provide contextual help
    if (question.includes('start') || question.includes('run')) {
      return "To start NetworkBuster, run: npm run start:local\nThis launches all servers on ports 3000-3002.";
    }
    if (question.includes('install')) {
      return "To install NetworkBuster:\n1. Clone the repo\n2. Run: npm install\n3. Start: npm run start:local\n\nFor Docker: npm run flash:compose";
    }
    if (question.includes('connect') || question.includes('access')) {
      return "Access NetworkBuster at:\n• Web: http://localhost:3000\n• Dashboard: http://localhost:3000/dashboard\n• API: http://localhost:3001\n• Audio: http://localhost:3002";
    }
    
    return "That's a great question! I don't have a specific answer, but you might find help in our documentation at /documentation.html or try asking about specific features.";
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  addMessage(sender, text) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${sender}-message`;
    
    const avatar = sender === 'bot' ? CHATBOT_CONFIG.avatar : '👤';
    messageEl.innerHTML = `
      <span class="message-avatar">${avatar}</span>
      <div class="message-content">
        <div class="message-text">${this.formatMessage(text)}</div>
        <div class="message-time">${this.getTimeString()}</div>
      </div>
    `;
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessage(text) {
    // Convert newlines to <br> and preserve formatting
    return text
      .replace(/\n/g, '<br>')
      .replace(/•/g, '<span class="bullet">•</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  getTimeString() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  showTyping() {
    this.isTyping = true;
    document.getElementById('chatbot-typing').style.display = 'flex';
  }

  hideTyping() {
    this.isTyping = false;
    document.getElementById('chatbot-typing').style.display = 'none';
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NetworkBusterChatbot, KNOWLEDGE_BASE, CHATBOT_CONFIG };
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('netbot-chat');
  if (container) {
    window.netbot = new NetworkBusterChatbot('netbot-chat');
    // Listen for Net Bot toggle from main UI
    const toggleBtn = document.getElementById('toggle-netbot');
    const netbotStatus = document.getElementById('netbot-status');
    let netbotOn = true;
    if (toggleBtn && window.netbot) {
      toggleBtn.addEventListener('click', function() {
        netbotOn = !netbotOn;
        window.netbot.setEnabled(netbotOn);
        if (netbotStatus) netbotStatus.textContent = netbotOn ? 'On' : 'Off';
      });
    }
  }
});
