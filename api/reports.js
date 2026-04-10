const { Pool } = require('pg');

// Use neon DB string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LeB69XmCxRbf@ep-wild-king-anj1x61c-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

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
    // Initialize DB if needed (Vercel functions are stateless, but we can try to create table if not exists)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(255) PRIMARY KEY,
        doctor_name VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        report_content TEXT NOT NULL
      );
    `);

    if (req.method === 'GET') {
      const { doctor } = req.query;
      if (!doctor) {
        return res.status(400).json({ error: 'Doctor name is required' });
      }

      const result = await pool.query(
        'SELECT * FROM reports WHERE doctor_name = $1 ORDER BY date DESC',
        [doctor]
      );

      const reports = result.rows.map(row => ({
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

      await pool.query(
        'INSERT INTO reports (id, doctor_name, report_content) VALUES ($1, $2, $3)',
        [id, doctor, report]
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
};
