import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { clubs, clubMembers, darwinChats } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session || (session.student_id !== 'EH-2024001' && session.student_id !== 'EH-2024002')) {
      return NextResponse.json({ error: 'Forbidden. Only Gumball or Darwin can reject clubs.' }, { status: 403 });
    }

    const { club_id, reason } = await req.json();

    if (!club_id) {
      return NextResponse.json({ error: 'Missing club_id' }, { status: 400 });
    }

    // 1. Fetch club info and the president to notify them
    const clubInfo = await db.select().from(clubs).where(eq(clubs.club_id, club_id));
    if (clubInfo.length === 0) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const presidentData = await db.select()
      .from(clubMembers)
      .where(and(eq(clubMembers.club_id, club_id), eq(clubMembers.is_president, true)));

    // 2. Update the club to rejected
    await db.update(clubs)
      .set({ 
        is_rejected: true, 
        rejection_reason: reason || 'No specific reason provided.' 
      })
      .where(eq(clubs.club_id, club_id));

    // 3. Send automated Darwin message to the president
    if (presidentData.length > 0) {
      const presidentId = presidentData[0].student_id;
      const clubName = clubInfo[0].name;
      const messageText = `Hi there! I am sorry to say that your club request for "${clubName}" has been rejected by the Student Union. Reason: ${reason || 'Not specified.'} Don't give up though, you can always try starting a different club!`;

      await db.insert(darwinChats).values({
        student_id: presidentId,
        sender: 'Darwin',
        message: messageText,
        is_anonymous: 0
      });
    }

    return NextResponse.json({ message: 'Club rejected and creator notified.' }, { status: 200 });

  } catch (error: any) {
    console.error('Club rejection error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
