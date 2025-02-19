import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || 'Sensor_Data',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'xxxxxxx',
  connectionTimeoutMillis: 10000,
 
});

export default pool;