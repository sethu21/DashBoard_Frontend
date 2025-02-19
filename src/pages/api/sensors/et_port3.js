import pool from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Query water content data from Port 3, sorted by timestamp
    const query = `
      SELECT 
        DATE(timestamp) AS date, 
        water_content 
      FROM public.port3 
      ORDER BY timestamp ASC;
    `;
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No ET data found for Port 3.' });
    }

    let previousWaterContent = null;
    const processedData = result.rows.map((row) => {
      const date = row.date; // "YYYY-MM-DD"
      const waterContent = row.water_content !== null ? Number(row.water_content) : null;
      
      let et = 0;
      if (previousWaterContent !== null && waterContent !== null) {
        // Calculate ET as the absolute difference multiplied by depth factor (adjust factor as needed)
        et = Math.abs(previousWaterContent - waterContent) * 200;
      }
      previousWaterContent = waterContent;
      
      return {
        date,
        et: parseFloat(et.toFixed(3))
      };
    });

    res.status(200).json({ etResults: processedData });
  } catch (error) {
    console.error("Database query error (Port 3):", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
