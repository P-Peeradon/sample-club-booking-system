import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from './db';
import { sessions, users, students } from './schema';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_COOKIE = 'elmore_session';

export interface StudentSession {
  uid: number;
  full_name: string;
  student_id: string;
  year: number;
  room: string;
  email: string;
  avatar: string;
}

export async function createSession(uid: number) {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day
  
  await db.insert(sessions).values({
    id: sessionId,
    uid,
    expires_at: expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  
  cookieStore.delete(SESSION_COOKIE);
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE);
  if (!tokenCookie) return null;

  try {
    const sessionId = tokenCookie.value;
    
    // Validate session in DB and join with user and student
    const result = await db.select({
      uid: users.uid,
      full_name: users.full_name,
      student_id: students.student_id,
      year: students.year,
      room: students.room,
      email: users.email,
      avatar: users.avatar
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.uid, users.uid))
    .innerJoin(students, eq(users.uid, students.uid))
    .where(and(
      eq(sessions.id, sessionId),
      gt(sessions.expires_at, new Date())
    ));

    if (result.length === 0) {
      return null;
    }

    return result[0] as StudentSession;
  } catch (error) {
    return null;
  }
}
