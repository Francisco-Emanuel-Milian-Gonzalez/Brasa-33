'use strict';

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const requiredEnv = ['PG_USER', 'PG_PASSWORD', 'PG_DATABASE'];
for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable ${name}`);
  }
}

export const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT || 5432),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: process.env.PG_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const dbConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('PostgreSQL | conectado correctamente');
  } catch (error) {
    console.error(`Error al conectar la db: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});