import { db } from '../lib/db';
import { clubs, clubMembers } from '../lib/schema';
import { eq, sql } from 'drizzle-orm';

async function test() {
  try {
    const fetchedClubs = await db.select({
      id: clubs.club_id,
      name: clubs.name,
      category: clubs.category,
      icon: clubs.icon,
      description: clubs.desc,
      member_count: sql<number>`count(${clubMembers.student_id})`.mapWith(Number)
    })
    .from(clubs)
    .leftJoin(clubMembers, eq(clubs.club_id, clubMembers.club_id))
    .groupBy(clubs.club_id)
    .orderBy(clubs.club_id);

    console.log('SUCCESS:', fetchedClubs);
  } catch (error: any) {
    console.error('ERROR:', error.message);
  }
  process.exit();
}
test();
