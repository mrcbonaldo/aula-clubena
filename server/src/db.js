import mysql from 'mysql2/promise';
import 'dotenv/config';

// Pool de conexões: reaproveita conexões em vez de abrir uma por requisição
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true, // DECIMAL volta como número, não string
});
