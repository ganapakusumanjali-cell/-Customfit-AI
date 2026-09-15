import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAiRecommendRequest, handleAiBargainRequest } from './server/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes
app.post('/api/ai/recommend', (req, res) => {
  handleAiRecommendRequest(req, res);
});

app.post('/api/ai/bargain', (req, res) => {
  handleAiBargainRequest(req, res);
});

// Production static file serving
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CustomFit AI server running on http://0.0.0.0:${PORT}`);
});
