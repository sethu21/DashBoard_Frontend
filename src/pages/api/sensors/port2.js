import pool from '../../../lib/db';

export default async function handler(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM public.port2 ORDER BY "timestamp" ASC'
    );

    const processedData = result.rows.map(row => {
      let timestamp = row.timestamp;
      if (timestamp instanceof Date) {
        timestamp = timestamp.toISOString().replace('T', ' ').substring(0, 19);
      }
      return {
        timestamp,
        water_content: row.water_content !== null ? Number(row.water_content) : null,
        soil_temp: row.soil_temp !== null ? Number(row.soil_temp) : null,
        bulk_ec: row.bulk_ec !== null ? Number(row.bulk_ec) : null
      };
    });

    res.status(200).json({ data: processedData });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
