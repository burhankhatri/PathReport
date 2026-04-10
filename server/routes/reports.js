const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get reports for a specific doctor
router.get('/', async (req, res) => {
  try {
    const { doctor } = req.query;
    if (!doctor) {
      return res.status(400).json({ error: 'Doctor name is required' });
    }

    const result = await pool.query(
      'SELECT * FROM reports WHERE doctor_name = $1 ORDER BY date DESC',
      [doctor]
    );

    // Format the date for the frontend
    const reports = result.rows.map(row => ({
      id: row.id,
      doctor: row.doctor_name,
      date: new Date(row.date).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
      }),
      report: row.report_content
    }));

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Save a new report
router.post('/', async (req, res) => {
  try {
    const { id, doctor, report } = req.body;
    
    if (!id || !doctor || !report) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await pool.query(
      'INSERT INTO reports (id, doctor_name, report_content) VALUES ($1, $2, $3)',
      [id, doctor, report]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

module.exports = router;
