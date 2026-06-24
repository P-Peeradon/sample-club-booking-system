import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'elmore_stop_two',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

export const db = drizzle(getPool(), { schema, mode: 'default' });

export async function query<T = unknown>(sql: mysql.QueryOptions, params?: mysql.ExecuteValues[] | undefined): Promise<T> {
  const connection = getPool();
  const [results] = await connection.execute(sql, params);
  return results as T;
}

