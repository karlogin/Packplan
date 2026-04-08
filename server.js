'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3847;
const SYNC_TOKEN = process.env.SYNC_TOKEN || 'change-this-token';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'packplan.json');
const KEY_FILE = path.join(DATA_DIR, 'apikey.enc');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// CORS - allow all origins (personal tool)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-token');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Auth middleware
function auth(req, res, next) {
  const token = req.headers['x-token'];
  if (token !== SYNC_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Health check (no auth — used by frontend to detect backend)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, version: '1.0.0', ts: Date.now() });
});

// Get all trip data
app.get('/api/data', auth, (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json(null);
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(raw));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Save all trip data
app.post('/api/data', auth, (req, res) => {
  try {
    const data = req.body;
    if (!data?.trips) return res.status(400).json({ error: 'Invalid data structure' });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    res.json({ ok: true, saved: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Store Anthropic API key server-side (plain text — personal tool on private network)
app.get('/api/key', auth, (req, res) => {
  try {
    if (!fs.existsSync(KEY_FILE)) return res.json({ key: '' });
    res.json({ key: fs.readFileSync(KEY_FILE, 'utf8').trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/key', auth, (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'No key provided' });
    fs.writeFileSync(KEY_FILE, key.trim());
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PackPlan running on http://localhost:${PORT}`);
  console.log(`Sync token: ${SYNC_TOKEN === 'change-this-token' ? '⚠ USING DEFAULT TOKEN — SET SYNC_TOKEN ENV VAR' : '✓ set'}`);
  console.log(`Data dir: ${DATA_DIR}`);
});
