import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { clubs } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session || (session.student_id !== 'EH-2024001' && session.student_id !== 'EH-2024002')) {
      return NextResponse.json({ error: 'Forbidden. Only Gumball or Darwin can approve clubs.' }, { status: 403 });
    }

    const { club_id } = await req.json();

    if (!club_id) {
      return NextResponse.json({ error: 'Missing club_id' }, { status: 400 });
    }

    await db.update(clubs)
      .set({ is_approved: true })
      .where(eq(clubs.club_id, club_id));

    return NextResponse.json({ message: 'Club officially created and approved.' }, { status: 201 });

  } catch (error: unknown) {
    console.error('Club approval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
