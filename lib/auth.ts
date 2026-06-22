import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-elmore-high-locker-key';
const SESSION_COOKIE = 'elmore_session';

export interface StudentSession {
  id: number;
  name: string;
  student_id: string;
  year: number;
  room: string;
  email: string;
  avatar: string;
}

export async function createSession(userId: number, studentId: string) {
  const token = jwt.sign({ userId, studentId }, JWT_SECRET, { expiresIn: '1d' });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE);
  if (!tokenCookie) return null;

  try {
    const payload = jwt.verify(tokenCookie.value, JWT_SECRET) as { userId: number; studentId: string };
    
    // Fetch full user details from MySQL
    const users = await query<any[]>(
      'SELECT id, name, student_id, year, room, email, avatar FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!users || users.length === 0) {
      return null;
    }

    return users[0] as StudentSession;
  } catch (error) {
    return null;
  }
}
