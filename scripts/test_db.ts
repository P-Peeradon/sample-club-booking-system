import { db } from '../lib/db';
import { users } from '../lib/schema';
import { sql } from 'drizzle-orm';

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
