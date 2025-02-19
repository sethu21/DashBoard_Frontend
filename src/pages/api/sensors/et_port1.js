import pool from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Query water_content data from Port 1, sorted by timestamp
    const result = await pool.query(
      `SELECT timestamp, water_content FROM public.port1 ORDER BY timestamp ASC`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No ET data found in the database." });
    }

    let etResults = [];
    const depthFactor = 100; // Factor for converting change in water_content to ET (mm)

    // Loop through rows, comparing each with the previous row (only if on the same day)
    for (let i = 1; i < result.rows.length; i++) {
      const prevRow = result.rows[i - 1];
      const currRow = result.rows[i];

      // Convert timestamps to Date objects and extract the date (YYYY-MM-DD)
      const prevDateObj = new Date(prevRow.timestamp);
      const currDateObj = new Date(currRow.timestamp);
      const prevDate = prevDateObj.toISOString().split("T")[0];
      const currDate = currDateObj.toISOString().split("T")[0];

      // Only compute ET if both rows belong to the same day
      if (prevDate === currDate && prevRow.water_content !== null && currRow.water_content !== null) {
        // Calculate the absolute difference in water_content multiplied by depthFactor
        const deltaWC = currRow.water_content - prevRow.water_content;
        const etValue = Math.abs(deltaWC * depthFactor);

        // Format current timestamp as "YYYY-MM-DD HH:MM:SS"
        const fullTimestamp = currDateObj.toISOString().replace("T", " ").substring(0, 19);

        etResults.push({
          timestamp: fullTimestamp,
          date: currDate,
          time: fullTimestamp.split(" ")[1],
          et_value: parseFloat(etValue.toFixed(3)),
        });
      }
    }

    res.status(200).json({ etResults });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
