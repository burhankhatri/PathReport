const { createClient } = require('@deepgram/sdk');
const multiparty = require('multiparty');
const fs = require('fs');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      console.error('Deepgram API key not configured in environment');
      return res.status(500).json({ error: 'Deepgram API key not configured' });
    }

    // Parse multipart form data
    const form = new multiparty.Form({
      maxFilesSize: 25 * 1024 * 1024, // 25MB limit
    });

    const audioBuffer = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Multiparty form parse error:', err);
          reject(new Error(`Form parse error: ${err.message}`));
          return;
        }

        if (!files.audio || !files.audio[0]) {
          console.error('No audio file in request. Files received:', Object.keys(files || {}));
          reject(new Error('No audio file provided'));
          return;
        }

        const filePath = files.audio[0].path;
        console.log('Audio file received:', {
          path: filePath,
          size: files.audio[0].size,
          originalFilename: files.audio[0].originalFilename,
          headers: files.audio[0].headers
        });

        try {
          const buffer = fs.readFileSync(filePath);
          // Clean up temp file
          try {
            fs.unlinkSync(filePath);
          } catch (cleanupErr) {
            console.warn('Could not clean up temp file:', cleanupErr.message);
          }
          resolve(buffer);
        } catch (readErr) {
          console.error('Error reading audio file:', readErr);
          reject(new Error(`Failed to read audio file: ${readErr.message}`));
        }
      });
    });

    // Initialize Deepgram client
    const deepgram = createClient(deepgramApiKey);

    // Transcribe the audio
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        diarize: false,
        language: 'en',
        keywords: [
          'anemia:2',
          'leukocytes:2',
          'neutropenia:2',
          'lymphocytes:2',
          'platelets:2',
          'blasts:2',
          'erythroid:2',
          'myeloid:2',
          'megakaryocytes:2',
          'cellularity:2',
          'dyspoiesis:2',
          'anisopoikilocytosis:2',
          'dacrocytes:2',
          'hypercellular:2',
          'hypocellular:2',
          'normocytic:2',
          'microcytic:2',
          'macrocytic:2'
        ].join(',')
      }
    );

    if (error) {
      console.error('Deepgram API error:', error);
      return res.status(500).json({
        error: 'Transcription failed',
        details: error.message || 'Deepgram API returned an error'
      });
    }

    console.log('Deepgram response received:', JSON.stringify(result, null, 2).substring(0, 500));

    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript;

    if (!transcript) {
      console.error('No transcript in Deepgram response. Result structure:', JSON.stringify(result, null, 2).substring(0, 1000));
      return res.status(500).json({
        error: 'No transcription returned',
        details: 'Deepgram returned an empty transcript'
      });
    }

    return res.status(200).json({
      success: true,
      transcript: transcript,
      confidence: result.results?.channels[0]?.alternatives[0]?.confidence || 0,
      words: result.results?.channels[0]?.alternatives[0]?.words || []
    });

  } catch (error) {
    console.error('Transcription error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Transcription failed',
      details: error.message || 'Unknown error occurred'
    });
  }
};


module.exports.config = {
  api: {
    bodyParser: false,
  },
};
