import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Optional performance packages
let compression = null;
let helmet = null;

try {
  compression = (await import('compression')).default;
} catch {
  console.warn('⚠️  compression module not found');
}

try {
  helmet = (await import('helmet')).default;
} catch {
  console.warn('⚠️  helmet module not found');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.AUDIO_PORT || 3002;

// Middleware
if (compression) app.use(compression());
if (helmet) app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Audio processing state
const audioStreams = new Map();
let streamIdCounter = 0;

// ============================================
// AUDIO STREAMING ENDPOINTS
// ============================================

// Create audio stream session
app.post('/api/audio/stream/create', (req, res) => {
  const streamId = ++streamIdCounter;
  const timestamp = Date.now();
  
  audioStreams.set(streamId, {
    id: streamId,
    createdAt: timestamp,
    duration: 0,
    chunks: 0,
    format: 'wav',
    sampleRate: 44100,
    bitDepth: 16,
    channels: 2,
    status: 'active'
  });

  res.json({
    streamId,
    timestamp,
    status: 'ready',
    message: 'Audio stream created successfully'
  });
});

// Process audio chunk (AI analysis)
app.post('/api/audio/process', (req, res) => {
  const { streamId, audioData, frequency } = req.body;

  if (!streamId || !audioData) {
    return res.status(400).json({ error: 'Missing streamId or audioData' });
  }

  const stream = audioStreams.get(streamId);
  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  // Simulate AI audio analysis
  const analysis = {
    streamId,
    frequency: frequency || 440,
    amplitude: Math.random() * 100,
    noiseLevel: Math.random() * 20,
    clarity: (Math.random() * 50 + 50).toFixed(2) + '%',
    detectedPitch: frequency ? `${frequency.toFixed(2)} Hz` : 'N/A',
    audioQuality: Math.random() > 0.5 ? 'Good' : 'Excellent',
    timestamp: new Date().toISOString()
  };

  stream.chunks++;
  stream.duration += 0.1;

  res.json({
    success: true,
    analysis,
    streamStatus: stream
  });
});

// Synthesize audio tone
app.post('/api/audio/synthesize', (req, res) => {
  const { frequency, duration, waveform } = req.body;
  
  if (!frequency || !duration) {
    return res.status(400).json({ error: 'Missing frequency or duration' });
  }

  const synthParams = {
    frequency: parseFloat(frequency),
    duration: parseFloat(duration),
    waveform: waveform || 'sine',
    sampleRate: 44100,
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    synthesis: synthParams,
    message: `Synthesizing ${synthParams.waveform} wave at ${synthParams.frequency}Hz for ${synthParams.duration}ms`,
    downloadUrl: `/api/audio/download/${Date.now()}`
  });
});

// Real-time frequency detection
app.post('/api/audio/detect-frequency', (req, res) => {
  const { audioBuffer } = req.body;
  
  if (!audioBuffer) {
    return res.status(400).json({ error: 'Missing audioBuffer' });
  }

  // Simulate frequency detection (FFT-like analysis)
  const detectedFrequencies = [
    { frequency: 440, strength: 95, note: 'A4' },
    { frequency: 880, strength: 45, note: 'A5' },
    { frequency: 220, strength: 30, note: 'A3' }
  ];

  res.json({
    success: true,
    dominantFrequency: detectedFrequencies[0].frequency,
    detectedFrequencies,
    confidence: (Math.random() * 30 + 70).toFixed(2) + '%'
  });
});

// Audio spectrum analysis
app.post('/api/audio/spectrum', (req, res) => {
  const { streamId } = req.body;

  const spectrum = {
    bass: (Math.random() * 100).toFixed(2),
    lowMid: (Math.random() * 100).toFixed(2),
    mid: (Math.random() * 100).toFixed(2),
    highMid: (Math.random() * 100).toFixed(2),
    treble: (Math.random() * 100).toFixed(2),
    overall: (Math.random() * 100).toFixed(2)
  };

  res.json({
    success: true,
    streamId,
    spectrum,
    analyzed: true,
    timestamp: new Date().toISOString()
  });
});

// Get stream status
app.get('/api/audio/stream/:streamId', (req, res) => {
  const stream = audioStreams.get(parseInt(req.params.streamId));
  
  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  res.json({
    success: true,
    stream,
    elapsedTime: Date.now() - stream.createdAt
  });
});

// List all active streams
app.get('/api/audio/streams', (req, res) => {
  const streams = Array.from(audioStreams.values());
  
  res.json({
    success: true,
    totalStreams: streams.length,
    activeStreams: streams.filter(s => s.status === 'active').length,
    streams
  });
});

// Close stream
app.post('/api/audio/stream/:streamId/close', (req, res) => {
  const streamId = parseInt(req.params.streamId);
  const stream = audioStreams.get(streamId);
  
  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  stream.status = 'closed';
  
  res.json({
    success: true,
    message: 'Stream closed',
    streamData: stream
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'audio-streaming',
    activeStreams: audioStreams.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Audio processing UI
app.get('/audio-lab', (req, res) => {
  const htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Audio Lab</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto;background:linear-gradient(135deg,#1a1a2e,#16213e);min-height:100vh;padding:20px;color:#fff}.container{max-width:1400px;margin:0 auto}.header{text-align:center;margin-bottom:40px}.header h1{font-size:3em;background:linear-gradient(135deg,#0f3460,#533483);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px}.header p{color:#aaa;font-size:1.1em}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:20px;margin-bottom:30px}.card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:25px;backdrop-filter:blur(10px)}.card-title{font-size:1.3em;font-weight:700;margin-bottom:15px;color:#00d4ff}.control-group{margin-bottom:15px}.label{font-size:.9em;color:#aaa;margin-bottom:5px;display:block}.input,select{width:100%;padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#fff;font-size:1em}.input:focus{outline:none;border-color:#00d4ff;background:rgba(0,212,255,.1)}.button{width:100%;padding:12px;background:linear-gradient(135deg,#0f3460,#533483);border:none;color:#fff;font-weight:600;border-radius:6px;cursor:pointer;transition:all .3s;font-size:1em}.button:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(0,212,255,.3)}.spectrum-display{display:flex;gap:8px;margin-top:15px;height:120px}.spectrum-bar{flex:1;background:linear-gradient(180deg,#00d4ff,#0f3460);border-radius:4px}.result-box{background:rgba(0,212,255,.1);border:1px solid #00d4ff;border-radius:6px;padding:15px;margin-top:15px;font-family:monospace;font-size:.9em}.success{color:#00ff88}</style></head><body><div class="container"><div class="header"><h1>🎵 AI Audio Lab</h1><p>Dual/Tri Server Audio Streaming & Processing</p></div><div class="grid"><div class="card"><div class="card-title">Stream Manager</div><div class="control-group"><button class="button" onclick="createStream()">Create Audio Stream</button></div><div id="streamStatus" style="margin-top:15px;color:#aaa;font-size:.9em">No active stream</div></div><div class="card"><div class="card-title">Frequency Synthesizer</div><div class="control-group"><label class="label">Frequency (Hz)</label><input type="number" id="frequency" class="input" value="440" min="20" max="20000"></div><div class="control-group"><label class="label">Duration (ms)</label><input type="number" id="duration" class="input" value="1000" min="10" max="10000"></div><div class="control-group"><label class="label">Waveform</label><select id="waveform" class="input"><option>sine</option><option>square</option><option>sawtooth</option><option>triangle</option></select></div><button class="button" onclick="synthesizeAudio()">Synthesize Tone</button><div id="synthResult" class="result-box" style="display:none"></div></div><div class="card"><div class="card-title">Real-Time Analysis</div><div class="control-group"><button class="button" onclick="detectFrequency()">Detect Frequency</button><button class="button" onclick="analyzeSpectrum()" style="margin-top:10px">Analyze Spectrum</button></div><div id="analysisResult" class="result-box" style="display:none"></div></div><div class="card"><div class="card-title">Spectrum Display</div><div class="spectrum-display" id="spectrumDisplay"><div class="spectrum-bar"></div><div class="spectrum-bar"></div><div class="spectrum-bar"></div><div class="spectrum-bar"></div><div class="spectrum-bar"></div></div></div><div class="card"><div class="card-title">Stream Monitoring</div><button class="button" onclick="listStreams()">List Active Streams</button><div id="streamsOutput" class="result-box" style="display:none"></div></div></div></div><script>let currentStreamId=null;function createStream(){fetch("/api/audio/stream/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})}).then(r=>r.json()).then(d=>{currentStreamId=d.streamId;document.getElementById("streamStatus").innerHTML="<div class=\"success\">Stream "+d.streamId+" created</div><small>Ready for audio processing</small>";console.log("Stream created:",d)}).catch(e=>{console.error(e);alert("Failed to create stream")})}function synthesizeAudio(){const freq=document.getElementById("frequency").value;const dur=document.getElementById("duration").value;const wave=document.getElementById("waveform").value;fetch("/api/audio/synthesize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({frequency:freq,duration:dur,waveform:wave})}).then(r=>r.json()).then(d=>{const result=document.getElementById("synthResult");result.style.display="block";result.innerHTML="<div class=\"success\">Synthesized</div>Frequency: "+d.synthesis.frequency+" Hz<br>Duration: "+d.synthesis.duration+" ms<br>Waveform: "+d.synthesis.waveform}).catch(e=>console.error(e))}function detectFrequency(){fetch("/api/audio/detect-frequency",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({audioBuffer:new Float32Array(1024)})}).then(r=>r.json()).then(d=>{const result=document.getElementById("analysisResult");result.style.display="block";result.innerHTML="<div class=\"success\">Detected</div>Dominant: "+d.dominantFrequency+" Hz<br>Confidence: "+d.confidence}).catch(e=>console.error(e))}function analyzeSpectrum(){fetch("/api/audio/spectrum",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({streamId:currentStreamId})}).then(r=>r.json()).then(d=>{const result=document.getElementById("analysisResult");result.style.display="block";result.innerHTML="<div class=\"success\">Analysis Complete</div>Bass: "+d.spectrum.bass+"%<br>Low Mid: "+d.spectrum.lowMid+"%<br>Mid: "+d.spectrum.mid+"%<br>High Mid: "+d.spectrum.highMid+"%<br>Treble: "+d.spectrum.treble+"%"}).catch(e=>console.error(e))}function listStreams(){fetch("/api/audio/streams").then(r=>r.json()).then(d=>{const output=document.getElementById("streamsOutput");output.style.display="block";output.innerHTML="<div class=\"success\">"+d.totalStreams+" Total Streams</div><small>Active: "+d.activeStreams+"</small>"}).catch(e=>console.error(e))}</script></body></html>';
  res.send(htmlContent);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Audio endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎵 Audio Server running at http://localhost:${PORT}`);
  console.log(`⚡ Features:`);
  if (compression) console.log(`   ✓ Compression enabled`);
  if (helmet) console.log(`   ✓ Security headers enabled`);
  console.log(`   ✓ Audio streaming: /api/audio/stream/*`);
  console.log(`   ✓ Frequency synthesis: /api/audio/synthesize`);
  console.log(`   ✓ Real-time analysis: /api/audio/detect-frequency`);
  console.log(`   ✓ Audio Lab UI: /audio-lab\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down Audio Server...');
  server.close(() => {
    console.log('Audio Server closed');
    process.exit(0);
  });
});
