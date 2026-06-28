import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { studyGroups, students, users } from '@/lib/schema';
import { getStudentSession } from '@/lib/auth';
import { eq, desc, like, or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search'); // query parameter for subject or classroom

    let query = db.select({
      id: studyGroups.id,
      name: studyGroups.name,
      subject: studyGroups.subject,
      classroom: studyGroups.classroom,
      created_by: studyGroups.created_by,
      created_at: studyGroups.created_at,
      creator_name: users.full_name
    })
    .from(studyGroups)
    .leftJoin(students, eq(studyGroups.created_by, students.student_id))
    .leftJoin(users, eq(students.uid, users.uid));

    if (search) {
      query = query.where(
        or(
          like(studyGroups.subject, `%${search}%`),
          like(studyGroups.classroom, `%${search}%`)
        )
      ) as any;
    }

    const allGroups = await query.orderBy(desc(studyGroups.created_at));

    return NextResponse.json(allGroups);
  } catch (error: unknown) {
    console.error('Study Groups GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, subject, classroom } = body;

    if (!name || !subject || !classroom) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await db.insert(studyGroups).values({
      name,
      subject,
      classroom,
      created_by: session.student_id
    });

    return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Study Groups POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
