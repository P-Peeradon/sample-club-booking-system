import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { clubs, clubMembers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as any;
    const iconFile = formData.get('icon') as File | null;

    if (!name || !description || !category || !iconFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // File validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(iconFile.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PNG, JPG, and GIF are allowed.' }, { status: 400 });
    }

    // 512 MB limit (512 * 1024 * 1024 bytes)
    const MAX_SIZE = 512 * 1024 * 1024;
    if (iconFile.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must not exceed 512MB.' }, { status: 400 });
    }

    // Save the file
    const bytes = await iconFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe unique filename
    const ext = iconFile.name.split('.').pop();
    const filename = `club_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const path = join(process.cwd(), 'public', 'club_logo', filename);

    // Check if a club with this name already exists
    const existingClubs = await db.select().from(clubs).where(eq(clubs.name, name));
    if (existingClubs.length > 0) {
      if (existingClubs[0].is_rejected) {
        return NextResponse.json({ error: 'This club name has previously been rejected by the Student Union and cannot be reused.' }, { status: 403 });
      } else {
        return NextResponse.json({ error: 'A club with this name already exists.' }, { status: 400 });
      }
    }

    // Save to DB
    // 1. Insert club (is_approved defaults to false, is_rejected defaults to false)
    const [result]: any = await db.insert(clubs).values({
      name,
      desc: description,
      category,
      icon: `/club_logo/${filename}`,
      is_approved: false
    });

    const newClubId = result.insertId;

    // 2. Insert member as president
    await db.insert(clubMembers).values({
      club_id: newClubId,
      student_id: session.student_id,
      is_president: true
    });

    return NextResponse.json({ message: 'Club request accepted pending approval.' }, { status: 202 });

  } catch (error: any) {
    console.error('Club creation error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'A club with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
