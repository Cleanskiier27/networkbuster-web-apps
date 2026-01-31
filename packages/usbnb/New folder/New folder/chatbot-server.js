// NetworkBuster AI Chatbot Server API
// Advanced AI response generation with context awareness

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const PORT = process.env.CHATBOT_PORT || 3005;

app.use(cors());
app.use(express.json());

// Enhanced Knowledge Base with deep learning simulation
const AI_BRAIN = {
  // Core system knowledge
  system: {
    name: 'NetBot',
    version: '1.0.0',
    capabilities: ['conversation', 'technical-support', 'navigation', 'code-help'],
    personality: {
      tone: 'friendly-professional',
      humor: 'light-tech',
      expertise: 'networking-space-tech'
    }
  },
  
  // Intent classification patterns
  intents: {
    greeting: {
      patterns: [/^(hi|hello|hey|greetings|howdy|yo|sup)/i, /good (morning|afternoon|evening)/i],
      confidence: 0.95
    },
    farewell: {
      patterns: [/^(bye|goodbye|see you|later|exit|quit)/i, /have a (good|nice) (day|one)/i],
      confidence: 0.95
    },
    question: {
      patterns: [/^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does)/i, /\?$/],
      confidence: 0.85
    },
    command: {
      patterns: [/^(show|display|list|get|find|search|run|start|stop|help)/i],
      confidence: 0.90
    },
    feedback: {
      patterns: [/^(thanks|thank you|great|awesome|cool|nice|good job)/i, /^(bad|terrible|wrong|broken)/i],
      confidence: 0.90
    }
  },
  
  // Topic knowledge graphs
  topics: {
    servers: {
      keywords: ['server', 'port', 'service', 'running', 'start', 'stop', 'api', 'web'],
      data: {
        web: { port: 3000, description: 'Main web server with dashboard and control panel' },
        api: { port: 3001, description: 'REST API for system data and operations' },
        audio: { port: 3002, description: 'Audio streaming and synthesis server' },
        auth: { port: 3003, description: 'Authentication and user management' },
        flash: { port: 3004, description: 'USB flash upgrade service' },
        chatbot: { port: 3005, description: 'AI chatbot API service' }
      }
    },
    features: {
      keywords: ['feature', 'capability', 'function', 'can do', 'abilities'],
      list: [
        'Real-time dashboard monitoring',
        'Music player with 5-band equalizer',
        'Audio Lab with frequency synthesis',
        'Lunar Recycling Challenge interface',
        'AI World immersive overlay',
        'Satellite mapping visualization',
        'USB flash upgrade system',
        'Docker containerization support'
      ]
    },
    lunar: {
      keywords: ['lunar', 'moon', 'space', 'recycling', 'regolith', 'challenge'],
      info: 'The Lunar Recycling Challenge focuses on sustainable resource management in space, including regolith processing, 3D printing from lunar materials, and habitat development.'
    },
    docker: {
      keywords: ['docker', 'container', 'compose', 'deploy', 'image'],
      commands: {
        start: 'npm run flash:compose',
        build: 'npm run flash:build',
        stop: 'npm run flash:down'
      }
    },
    audio: {
      keywords: ['audio', 'music', 'sound', 'equalizer', 'frequency', 'streaming'],
      features: ['5-band equalizer', 'Real-time synthesis', 'AI frequency detection', 'Spotify integration']
    }
  }
};

// Conversation memory (per session)
const sessions = new Map();

// Intent classification
function classifyIntent(message) {
  const normalized = message.toLowerCase().trim();
  let bestMatch = { intent: 'general', confidence: 0.5 };
  
  for (const [intent, config] of Object.entries(AI_BRAIN.intents)) {
    for (const pattern of config.patterns) {
      if (pattern.test(normalized)) {
        if (config.confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence: config.confidence };
        }
      }
    }
  }
  
  return bestMatch;
}

// Topic extraction
function extractTopics(message) {
  const normalized = message.toLowerCase();
  const foundTopics = [];
  
  for (const [topic, config] of Object.entries(AI_BRAIN.topics)) {
    const matchCount = config.keywords.filter(kw => normalized.includes(kw)).length;
    if (matchCount > 0) {
      foundTopics.push({ topic, relevance: matchCount / config.keywords.length });
    }
  }
  
  return foundTopics.sort((a, b) => b.relevance - a.relevance);
}

// Entity extraction
function extractEntities(message) {
  const entities = {
    ports: message.match(/\b(3000|3001|3002|3003|3004|3005)\b/g) || [],
    commands: message.match(/\b(npm|node|docker|git)\s+\w+/gi) || [],
    urls: message.match(/https?:\/\/[^\s]+/gi) || [],
    files: message.match(/\b[\w-]+\.(js|json|html|css|md|yml|yaml)\b/gi) || []
  };
  return entities;
}

// Generate contextual response
function generateResponse(message, sessionId) {
  const intent = classifyIntent(message);
  const topics = extractTopics(message);
  const entities = extractEntities(message);
  
  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [], context: {} });
  }
  const session = sessions.get(sessionId);
  session.history.push({ role: 'user', message, timestamp: Date.now() });
  
  let response = '';
  
  // Handle by intent
  switch (intent.intent) {
    case 'greeting':
      response = generateGreeting(session);
      break;
    case 'farewell':
      response = generateFarewell(session);
      break;
    case 'question':
      response = answerQuestion(message, topics, entities, session);
      break;
    case 'command':
      response = handleCommand(message, topics, entities);
      break;
    case 'feedback':
      response = handleFeedback(message);
      break;
    default:
      response = handleGeneral(message, topics, entities);
  }
  
  session.history.push({ role: 'bot', message: response, timestamp: Date.now() });
  
  return {
    response,
    intent: intent.intent,
    confidence: intent.confidence,
    topics: topics.map(t => t.topic),
    entities,
    sessionId
  };
}

function generateGreeting(session) {
  const greetings = [
    "Hello! I'm NetBot, your AI assistant for NetworkBuster. How can I help you today?",
    "Hey there! Welcome to NetworkBuster. I'm here to help with any questions!",
    "Hi! Ready to assist you with servers, features, or anything NetworkBuster related!"
  ];
  
  if (session.history.length > 2) {
    return "Welcome back! What can I help you with now?";
  }
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function generateFarewell(session) {
  const farewells = [
    "Goodbye! Feel free to come back anytime. Happy coding! 🚀",
    "See you later! Don't forget to check out our latest features!",
    "Bye! Remember, all servers are available at localhost:3000-3005!"
  ];
  return farewells[Math.floor(Math.random() * farewells.length)];
}

function answerQuestion(message, topics, entities, session) {
  const normalized = message.toLowerCase();
  
  // Server-related questions
  if (topics.some(t => t.topic === 'servers')) {
    const serverData = AI_BRAIN.topics.servers.data;
    if (normalized.includes('port') || normalized.includes('what port')) {
      return `NetworkBuster runs on multiple ports:\n${Object.entries(serverData).map(([name, info]) => `• ${name.toUpperCase()}: Port ${info.port} - ${info.description}`).join('\n')}`;
    }
    if (normalized.includes('start') || normalized.includes('run')) {
      return "To start all servers, run: `npm run start:local`\n\nThis launches:\n• Web Server (3000)\n• API Server (3001)\n• Audio Server (3002)\n\nOr use `node start-servers.js` directly!";
    }
  }
  
  // Feature questions
  if (topics.some(t => t.topic === 'features')) {
    return `NetworkBuster features include:\n${AI_BRAIN.topics.features.list.map(f => `• ${f}`).join('\n')}\n\nAsk about any specific feature for more details!`;
  }
  
  // Lunar questions
  if (topics.some(t => t.topic === 'lunar')) {
    return `🌙 ${AI_BRAIN.topics.lunar.info}\n\nKey components:\n• Material Processing Unit\n• Regolith Analyzer\n• 3D Printing System\n• Environmental Sensors\n\nExplore more at /challengerepo!`;
  }
  
  // Docker questions
  if (topics.some(t => t.topic === 'docker')) {
    const cmds = AI_BRAIN.topics.docker.commands;
    return `Docker commands for NetworkBuster:\n• Start: \`${cmds.start}\`\n• Build: \`${cmds.build}\`\n• Stop: \`${cmds.stop}\`\n\nThe compose file includes all services with USB support!`;
  }
  
  // Audio questions
  if (topics.some(t => t.topic === 'audio')) {
    return `🎵 Audio Lab features:\n${AI_BRAIN.topics.audio.features.map(f => `• ${f}`).join('\n')}\n\nAccess at http://localhost:3002 or /audio-lab`;
  }
  
  // Default question response
  return "That's a great question! Could you be more specific? I can help with:\n• Servers & Ports\n• Features & Capabilities\n• Lunar Challenge\n• Docker Deployment\n• Audio & Music\n\nOr type 'help' for all options!";
}

function handleCommand(message, topics, entities) {
  const normalized = message.toLowerCase();
  
  if (normalized.includes('show') || normalized.includes('list')) {
    if (normalized.includes('server')) {
      return `Active servers:\n${Object.entries(AI_BRAIN.topics.servers.data).map(([name, info]) => `• ${name}: localhost:${info.port}`).join('\n')}`;
    }
    if (normalized.includes('feature')) {
      return AI_BRAIN.topics.features.list.map((f, i) => `${i + 1}. ${f}`).join('\n');
    }
  }
  
  if (normalized.includes('help')) {
    return "🤖 NetBot Help Menu:\n\n📝 Topics I can help with:\n• Servers - ports, starting, stopping\n• Features - system capabilities\n• Lunar - recycling challenge info\n• Docker - containerization\n• Audio - music & equalizer\n\n💡 Try asking:\n• 'What ports are available?'\n• 'How do I start the servers?'\n• 'Tell me about the lunar challenge'";
  }
  
  return "I can help you with commands! Try:\n• 'show servers'\n• 'list features'\n• 'help'";
}

function handleFeedback(message) {
  const normalized = message.toLowerCase();
  
  if (/thanks|thank you|great|awesome|cool/i.test(normalized)) {
    return "You're welcome! Happy to help. Let me know if you need anything else! 😊";
  }
  
  if (/bad|terrible|wrong|broken/i.test(normalized)) {
    return "I'm sorry to hear that! Could you tell me more about the issue? I'll try my best to help or guide you to the right solution.";
  }
  
  return "Thanks for the feedback! How else can I assist you?";
}

function handleGeneral(message, topics, entities) {
  if (topics.length > 0) {
    return answerQuestion(message, topics, entities, { history: [] });
  }
  
  return "I'm not quite sure what you mean. Could you rephrase that?\n\nHere are some things I can help with:\n• Server information\n• Feature explanations\n• Technical support\n• Navigation help\n\nJust ask away! 🚀";
}

// API Routes
app.get('/api/chat/health', (req, res) => {
  res.json({ status: 'online', bot: AI_BRAIN.system.name, version: AI_BRAIN.system.version });
});

app.post('/api/chat/message', (req, res) => {
  const { message, sessionId = `session_${Date.now()}` } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const result = generateResponse(message, sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
});

app.get('/api/chat/topics', (req, res) => {
  res.json({
    topics: Object.keys(AI_BRAIN.topics),
    capabilities: AI_BRAIN.system.capabilities
  });
});

app.delete('/api/chat/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  res.json({ success: true, message: 'Session cleared' });
});

// Start server
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`🤖 NetBot AI Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/chat/health`);
  console.log(`   Chat:   POST http://localhost:${PORT}/api/chat/message`);
});

export default app;
