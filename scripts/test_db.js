const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { db } = require('./lib/db');
const { users } = require('./lib/schema');
const { sql } = require('drizzle-orm');

async function test() {
  try {
    const res = await db.select({ count: sql`count(*)` }).from(users);
    console.log('SUCCESS:', res);
  } catch (error) {
    console.error('ERROR:', error);
  }
  process.exit();
}
test();
