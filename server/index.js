require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const transcribeRouter = require('./routes/transcribe');
const generateReportRouter = require('./routes/generate-report');
const generatePdfRouter = require('./routes/generate-pdf');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Initialize Database
initDb();

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
      deepgramConfigured: !!process.env.DEEPGRAM_API_KEY
    }
  });
});

// API Routes
app.use('/api/transcribe', transcribeRouter);
app.use('/api/generate-report', generateReportRouter);
app.use('/api/generate-pdf', generatePdfRouter);
app.use('/api/reports', reportsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ 
      error: 'File upload error', 
      details: err.message 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Medical Transcription Server running on port ${PORT}`);
  console.log(`📡 Accepting requests from: ${CLIENT_URL}`);
  console.log(`🔑 API Keys configured:`);
  console.log(`   - Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗'}`);
  console.log(`   - Deepgram: ${process.env.DEEPGRAM_API_KEY ? '✓' : '✗'}`);
});
