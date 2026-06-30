import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workshops } from '@/lib/schema';
import { getStudentSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allWorkshops = await db.select()
      .from(workshops)
      .orderBy(desc(workshops.date));
    return NextResponse.json(allWorkshops);
  } catch (error: unknown) {
    console.error('Workshops GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id } = session;
    const isSuperuser = ['EH-2024001', 'EH-2024002', 'EH-2024003'].includes(student_id);

    if (!isSuperuser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, date } = body;

    if (!title || !description || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await db.insert(workshops).values({
      title,
      description,
      date: new Date(date),
      created_by: student_id
    });

    return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Workshops POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
