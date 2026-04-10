const express = require('express');
const { createClient } = require('@deepgram/sdk');
const multer = require('multer');
const router = express.Router();

// Configure multer for audio file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

/**
 * POST /api/transcribe
 * Transcribe audio file using Deepgram API
 */
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return res.status(500).json({ error: 'Deepgram API key not configured' });
    }

    // Initialize Deepgram client
    const deepgram = createClient(deepgramApiKey);

    // Transcribe the audio
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      req.file.buffer,
      {
        model: 'nova-3-medical',
        smart_format: true,
        punctuate: true,
        diarize: false,
        language: 'en',
      }
    );

    if (error) {
      console.error('Deepgram error:', error);
      return res.status(500).json({ error: 'Transcription failed', details: error.message });
    }

    // Extract the transcript
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript;

    if (!transcript) {
      return res.status(500).json({ error: 'No transcription returned' });
    }

    res.json({
      success: true,
      transcript: transcript,
      confidence: result.results?.channels[0]?.alternatives[0]?.confidence || 0,
      words: result.results?.channels[0]?.alternatives[0]?.words || []
    });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ 
      error: 'Transcription failed', 
      details: error.message 
    });
  }
});

module.exports = router;

