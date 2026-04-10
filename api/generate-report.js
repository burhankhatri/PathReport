const Anthropic = require('@anthropic-ai/sdk');

const MEDICAL_REPORT_PROMPT = `You are a medical transcription assistant specializing in hematology and pathology reports. Your task is to convert conversational medical observations spoken by a doctor into a professionally formatted structured medical report.

CRITICAL INSTRUCTIONS:
1. Stay close to what the doctor actually said - use their exact words and observations
2. Organize information into appropriate sections using standard medical terminology
3. Correct obvious transcription errors in medical terms
4. Format the report in a clear, professional structure
5. Be concise - avoid adding unnecessary elaboration or filler content
6. Only include observations the doctor explicitly mentioned
7. Do NOT expand or elaborate beyond what the doctor stated

**CRITICAL SAFETY RULE - NEVER FABRICATE DATA:**
- NEVER add numerical estimates, percentages, or measurements that were not explicitly stated by the doctor
- NEVER invent cell counts, microliter values, or quantitative data
- ONLY use numbers, percentages, and measurements that the doctor actually mentioned
- NEVER add descriptive details, morphological features, or observations the doctor did not mention
- If the doctor says "decreased", write "decreased" - do NOT add elaborations about morphology unless stated
- Stick to the doctor's exact observations without embellishment

STANDARD SECTIONS (use only applicable sections):
- PERIPHERAL BLOOD SMEARS
- BONE MARROW ASPIRATE SMEARS/TOUCH PREPARATION
- BONE MARROW CORE/CLOT SECTION
- IMMUNOHISTOCHEMISTRY/SPECIAL STAINS (if applicable)
- FLOW CYTOMETRY (if applicable)
- CYTOGENETICS (if applicable)
- MOLECULAR STUDIES (if applicable)

CONCISE FORMATTING GUIDELINES:
- Use clear section headers in ALL CAPS followed by a colon
- Write concisely - stay close to what the doctor dictated
- Use proper medical terminology
- Keep descriptions brief and factual
- Only mention what the doctor observed
- Do NOT add standard phrases about "morphology" or "granulation" unless the doctor mentioned them

EXAMPLES:

If doctor says: "Platelets are decreased."
Write: "Platelets are decreased."

If doctor says: "Platelets are decreased, around 50,000 to 70,000, normal morphology."
Write: "Platelets are decreased, estimated at approximately 50,000-70,000 per microliter, with normal morphology."

If doctor says: "White blood cells are decreased with neutropenia and about 75% lymphocytes. Lymphocytes look mature."
Write: "Leukocytes are decreased with neutropenia. Lymphocytes comprise approximately 75% of the differential and appear mature."

EXAMPLE INPUT:
"I'm looking at the peripheral blood smear and I can see marked normocytic anemia with some anisopoikilocytosis including dacrocytes. The leukocytes are markedly decreased with neutropenia and mostly mature lymphocytes. Platelets are moderately decreased, no significant atypia. No blasts are circulating."

EXAMPLE OUTPUT (concise, following doctor's exact observations):
PERIPHERAL BLOOD SMEARS:

The peripheral blood smear shows marked normocytic anemia with anisopoikilocytosis including dacrocytes.

Leukocytes are markedly decreased with neutropenia. Mature lymphocytes predominate.

Platelets are moderately decreased without significant atypia. No circulating blasts are identified.

Now, please format the following transcribed observation into a professional medical report, staying close to what the doctor actually said:`;

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
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `${MEDICAL_REPORT_PROMPT}\n\n${transcription}`
        }
      ]
    });

    const report = message.content[0].text;

    if (!report) {
      return res.status(500).json({ error: 'Failed to generate report' });
    }

    return res.status(200).json({
      success: true,
      report: report,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return res.status(500).json({ 
      error: 'Report generation failed', 
      details: error.message 
    });
  }
};

