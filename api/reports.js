const { neon } = require('@neondatabase/serverless');

let tableCreated = false;

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

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is not configured' });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Create table once per cold start
    if (!tableCreated) {
      await sql`
        CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(255) PRIMARY KEY,
          doctor_name VARCHAR(255) NOT NULL,
          date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          report_content TEXT NOT NULL
        )
      `;
      tableCreated = true;
    }

    if (req.method === 'GET') {
      const { doctor } = req.query;
      if (!doctor) {
        return res.status(400).json({ error: 'Doctor name is required' });
      }

      const rows = await sql`
        SELECT * FROM reports WHERE doctor_name = ${doctor} ORDER BY date DESC
      `;

      const reports = rows.map(row => ({
        id: row.id,
        doctor: row.doctor_name,
        date: new Date(row.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
        }),
        report: row.report_content
      }));

      return res.status(200).json({ success: true, reports });
    }

    if (req.method === 'POST') {
      const { id, doctor, report } = req.body;

      if (!id || !doctor || !report) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO reports (id, doctor_name, report_content) VALUES (${id}, ${doctor}, ${report})
      `;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
};
