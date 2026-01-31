# 🎵 AI Audio Streaming System - Quick Start

## What's New

Created a **Dual/Tri Server Audio System** with:

### 🎵 **Server #3: Audio Streaming Server** (port 3002)
- Real-time audio stream management
- AI frequency detection & synthesis
- Spectrum analysis (Bass, Mid, Treble)
- Volume toggle (Mute/Unmute)
- Audio Lab UI for interactive testing

---

## Quick Start

### Start All Three Servers (Recommended)
```bash
npm run start:tri-servers
```

**This starts:**
- 🌐 Main Web Server (port 3000)
- ⚙️ API Server (port 3001)  
- 🎵 Audio Server (port 3002)

### Start Individually
```bash
# Main server
npm start
node server-universal.js

# API server
npm run start:api
node api/server-universal.js

# Audio server (NEW)
npm run start:audio
node server-audio.js
```

---

## Features

### Audio Lab UI
```
http://localhost:3002/audio-lab
```

Interactive dashboard with:
- **Stream Manager** - Create/manage audio streams
- **Frequency Synthesizer** - Generate tones (20Hz-20kHz)
- **Real-Time Analysis** - Detect dominant frequencies
- **Spectrum Display** - Visual 5-band equalizer
- **Stream Monitoring** - Track active sessions

### API Endpoints

#### Create Audio Stream
```bash
curl -X POST http://localhost:3002/api/audio/stream/create
```

#### Synthesize Audio Tone
```bash
curl -X POST http://localhost:3002/api/audio/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": 440,
    "duration": 1000,
    "waveform": "sine"
  }'
```

#### Detect Frequency
```bash
curl -X POST http://localhost:3002/api/audio/detect-frequency \
  -H "Content-Type: application/json" \
  -d '{"audioBuffer": []}'
```

#### Analyze Spectrum
```bash
curl -X POST http://localhost:3002/api/audio/spectrum \
  -H "Content-Type: application/json" \
  -d '{"streamId": 1}'
```

#### List Active Streams
```bash
curl http://localhost:3002/api/audio/streams
```

#### Get Stream Status
```bash
curl http://localhost:3002/api/audio/stream/1
```

#### Close Stream
```bash
curl -X POST http://localhost:3002/api/audio/stream/1/close
```

#### Health Check
```bash
curl http://localhost:3002/health
```

---

## Tri-Server Architecture

```
┌─────────────────────────────────────────────┐
│   NetworkBuster Tri-Server System           │
├─────────────────────────────────────────────┤
│                                              │
│  🌐 Main Web Server (3000)                  │
│     ├─ Control Panel with equalizer         │
│     ├─ Rocketman music player              │
│     ├─ Volume toggle (mute/unmute)         │
│     └─ Static files (web-app, blog, etc)   │
│                                              │
│  ⚙️ API Server (3001)                      │
│     ├─ System specifications                │
│     ├─ Health monitoring                    │
│     └─ Data endpoints                       │
│                                              │
│  🎵 Audio Streaming Server (3002)           │
│     ├─ Audio stream management              │
│     ├─ Frequency synthesis                  │
│     ├─ AI frequency detection               │
│     ├─ Spectrum analysis                    │
│     └─ Audio Lab interactive UI             │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Audio Synthesis Waveforms

Supported waveforms for synthesis:
- **sine** - Pure tone (default)
- **square** - Digital/harsh tone
- **sawtooth** - Bright/buzzy tone
- **triangle** - Soft/mellow tone

---

## Example Workflow

### 1. Open Audio Lab
```
http://localhost:3002/audio-lab
```

### 2. Create Stream
Click "Create Audio Stream" → Get stream ID

### 3. Synthesize Tone
- Set frequency: 440 Hz (A note)
- Set duration: 1000 ms
- Choose waveform: sine
- Click "Synthesize Tone"

### 4. Detect Frequency
Click "Detect Frequency" → Shows dominant frequency

### 5. Analyze Spectrum
Click "Analyze Spectrum" → Shows 5-band equalizer analysis

### 6. Monitor Streams
Click "List Active Streams" → See all active sessions

---

## Technical Details

### Audio Stream Object
```json
{
  "id": 1,
  "createdAt": 1702560000000,
  "duration": 5.2,
  "chunks": 52,
  "format": "wav",
  "sampleRate": 44100,
  "bitDepth": 16,
  "channels": 2,
  "status": "active"
}
```

### Frequency Detection Response
```json
{
  "dominantFrequency": 440,
  "detectedFrequencies": [
    {"frequency": 440, "strength": 95, "note": "A4"},
    {"frequency": 880, "strength": 45, "note": "A5"},
    {"frequency": 220, "strength": 30, "note": "A3"}
  ],
  "confidence": "87.32%"
}
```

### Spectrum Analysis Response
```json
{
  "spectrum": {
    "bass": "25.34",
    "lowMid": "42.12",
    "mid": "61.89",
    "highMid": "38.45",
    "treble": "15.67"
  },
  "analyzed": true
}
```

---

## Package.json Scripts

All new scripts added:

```json
"start:audio": "node server-audio.js",
"start:tri-servers": "node start-tri-servers.js",
"dev:audio": "node --watch server-audio.js"
```

---

## Features Summary

✅ **Three Independent Servers**
- Run simultaneously on ports 3000, 3001, 3002
- Graceful shutdown handling
- Health checks for each server

✅ **Audio Streaming**
- Create/manage audio streams
- Multiple concurrent streams
- Stream status monitoring

✅ **Frequency Synthesis**
- Generate tones at any frequency (20Hz-20kHz)
- Multiple waveform types
- Configurable duration

✅ **AI Audio Analysis**
- Real-time frequency detection
- Confidence scoring
- Harmonic detection (overtones)
- 5-band spectrum analysis

✅ **Interactive UI**
- Audio Lab dashboard
- Real-time frequency controls
- Live spectrum visualization
- Stream monitoring

✅ **Control Panel Enhancements**
- Rocketman music player
- 5-band equalizer
- Volume control with mute toggle
- Real-time EQ adjustments

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3002 in use | Change: `AUDIO_PORT=3003 npm run start:audio` |
| Audio endpoints 404 | Ensure audio server running on 3002 |
| Stream not created | Check network connection |
| Frequency detection fails | Ensure valid audioBuffer data |

---

## Next Steps

1. **Test Audio Lab:**
   ```
   npm run start:tri-servers
   Open: http://localhost:3002/audio-lab
   ```

2. **Docker Build:**
   ```bash
   docker build -t networkbuster:audio .
   docker run -p 3000:3000 -p 3001:3001 -p 3002:3002 networkbuster:audio
   ```

3. **Deploy to Azure:**
   ```bash
   npm run deploy-azure
   ```

---

## File Structure

```
├── server-universal.js          (Main web server)
├── api/server-universal.js      (API server)
├── server-audio.js              (NEW: Audio streaming server)
├── start-tri-servers.js         (NEW: Startup orchestrator)
├── package.json                 (Updated with new scripts)
└── AUDIO-STREAMING-GUIDE.md     (This file)
```

---

## Status

✅ Audio server created & tested
✅ All endpoints functional
✅ Audio Lab UI ready
✅ Tri-server startup working
✅ Pushed to GitHub (commit 7d76407)

Your application now supports **AI audio streaming, synthesis, and analysis!** 🎵🚀
