import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { advocacyRequests, students, users } from '@/lib/schema';
import { getStudentSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view');
    const isAdmin = ['EH-2024001', 'EH-2024002', 'EH-2024003'].includes(session.student_id);

    // If admin is explicitly requesting all requests
    if (isAdmin && view === 'admin') {
      const allRequests = await db.select({
        id: advocacyRequests.id,
        student_id: advocacyRequests.student_id,
        request_type: advocacyRequests.request_type,
        title: advocacyRequests.title,
        description: advocacyRequests.description,
        status: advocacyRequests.status,
        admin_response: advocacyRequests.admin_response,
        resolved_by: advocacyRequests.resolved_by,
        revocation_reason: advocacyRequests.revocation_reason,
        created_at: advocacyRequests.created_at,
        student_name: users.full_name
      })
      .from(advocacyRequests)
      .leftJoin(students, eq(advocacyRequests.student_id, students.student_id))
      .leftJoin(users, eq(students.uid, users.uid))
      .orderBy(desc(advocacyRequests.created_at));
      
      return NextResponse.json(allRequests);
    }

    // Otherwise, return only the student's own requests
    const userRequests = await db.select()
      .from(advocacyRequests)
      .where(eq(advocacyRequests.student_id, session.student_id))
      .orderBy(desc(advocacyRequests.created_at));

    return NextResponse.json(userRequests);
  } catch (error: unknown) {
    console.error('Advocacy GET error:', error);
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
    const { request_type, title, description } = body;

    if (!request_type || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await db.insert(advocacyRequests).values({
      student_id: session.student_id,
      request_type,
      title,
      description,
      status: 'Pending',
    });

    return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Advocacy POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
