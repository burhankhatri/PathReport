const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { MEDICAL_REPORT_PROMPT } = require('../utils/claudePrompt');
const router = express.Router();

/**
 * POST /api/generate-report
 * Generate formatted medical report from transcription using Claude
 */
router.post('/', async (req, res) => {
  try {
    const { transcription } = req.body;

    if (!transcription || typeof transcription !== 'string') {
      return res.status(400).json({ error: 'Transcription text is required' });
    }

    if (transcription.trim().length === 0) {
      return res.status(400).json({ error: 'Transcription cannot be empty' });
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    // Generate the report using Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for more consistent medical formatting
      messages: [
        {
          role: 'user',
          content: `${MEDICAL_REPORT_PROMPT}\n\n${transcription}`
        }
      ]
    });

    // Extract the formatted report
    const report = message.content[0].text;

    if (!report) {
      return res.status(500).json({ error: 'Failed to generate report' });
    }

    res.json({
      success: true,
      report: report,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      error: 'Report generation failed', 
      details: error.message 
    });
  }
});

module.exports = router;

