import pool from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Query to join data from port1, port2, and port3 by timestamp.
    // port1 is used as the base table.
    const query = `
      SELECT 
        p1.timestamp, 
        p1.water_content AS p1, 
        p2.water_content AS p2, 
        p3.water_content AS p3
      FROM public.port1 p1
      LEFT JOIN public.port2 p2 ON p1.timestamp = p2.timestamp
      LEFT JOIN public.port3 p3 ON p1.timestamp = p3.timestamp
      ORDER BY p1.timestamp ASC;
    `;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No sensor data found.' });
    }

    // Process the data and compute ET
    let prevP1 = null, prevP2 = null, prevP3 = null;
    const processedData = result.rows.map((row, index) => {
      // Ensure timestamp is in "YYYY-MM-DD HH:MM:SS" format
      let timestamp = row.timestamp;
      if (timestamp instanceof Date) {
        timestamp = timestamp.toISOString().replace('T', ' ').substring(0, 19);
      }

      // Convert sensor values to numbers (if not null)
      const p1 = row.p1 !== null ? Number(row.p1) : null;
      const p2 = row.p2 !== null ? Number(row.p2) : null;
      const p3 = row.p3 !== null ? Number(row.p3) : null;

      // Compute ET using the formula:
      // ET = (|p1_current - p1_previous| + |p2_current - p2_previous| + |p3_current - p3_previous|) * 100
      let et = 0;
      if (index === 0 || p1 === null || p2 === null || p3 === null ||
          prevP1 === null || prevP2 === null || prevP3 === null) {
        et = 0;
      } else {
        const diff1 = Math.abs(p1 - prevP1);
        const diff2 = Math.abs(p2 - prevP2);
        const diff3 = Math.abs(p3 - prevP3);
        et = (diff1 + diff2 + diff3) * 150;
      }

      // Update previous values
      prevP1 = p1;
      prevP2 = p2;
      prevP3 = p3;

      return {
        timestamp,
        p1,
        p2,
        p3,
        et: Number(et.toFixed(3))
      };
    });

    res.status(200).json({ data: processedData });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
