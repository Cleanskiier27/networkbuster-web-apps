import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Load system specifications
const specs = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/system-specifications.json'), 'utf8'));

// API Routes
app.use(express.json());

app.get('/api/specs', (req, res) => {
  res.json(specs);
});

app.get('/api/specs/:section', (req, res) => {
  const section = req.params.section;
  if (specs[section]) {
    res.json({ [section]: specs[section] });
  } else {
    res.status(404).json({ error: 'Section not found' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log(`Specs: http://localhost:${PORT}/api/specs`);
});
