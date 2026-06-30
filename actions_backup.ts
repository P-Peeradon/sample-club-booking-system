'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { users, students, clubMembers, darwinChats } from '@/lib/schema';
import { eq, or, and, sql } from 'drizzle-orm';
import { createSession, deleteSession, getStudentSession } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  studentId: z.string().regex(/^EH-\d{4}\d{3}$/, 'Student ID must follow the EH-YYYYXXX format (e.g., EH-2024001)'),
  year: z.coerce.number().min(1).max(6),
  room: z.string().min(1, 'Room is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  avatar: z.string().min(1, 'Avatar is required'),
});

export async function registerStudent(prevState: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, studentId, year, room, email, password, avatar } = parsed.data;

  try {
    // Check if Email already exists
    const existingUser = await db.select({ uid: users.uid, email: users.email })
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return { success: false, error: 'Email already registered!' };
    }

    // Check if Student ID already exists
    const existingStudent = await db.select({ student_id: students.student_id })
      .from(students)
      .where(eq(students.student_id, studentId));

    if (existingStudent.length > 0) {
      return { success: false, error: 'Student ID already registered!' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const [result] = await db.insert(users).values({
      full_name: name,
      email,
      password: hashedPassword,
      avatar,
    });

    const newUserId = result.insertId;

    // Insert student into DB
    await db.insert(students).values({
      uid: newUserId,
      student_id: studentId,
      institute: 'Elmore High School',
      year,
      room,
    });

    // Create session and set cookie
    await createSession(newUserId);
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error occurred during registration.' };
  }

  // Redirect to dashboard upon successful registration
  redirect('/dashboard');
}

const loginSchema = z.object({
  emailOrId: z.string().min(1, 'Student ID/Email is required'),
  password: z.string().min(1, 'Locker Code is required'),
});

export async function loginStudent(prevState: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, error: 'Both Student ID/Email and Locker Code (Password) are required!' };
  }

  const { emailOrId, password } = parsed.data;

  try {
    // Find user by email or student ID
    const foundUsers = await db.select({ uid: users.uid, password: users.password })
      .from(users)
      .leftJoin(students, eq(users.uid, students.uid))
      .where(or(eq(users.email, emailOrId), eq(students.student_id, emailOrId)));

    if (foundUsers.length === 0) {
      return { success: false, error: 'Invalid Student ID/Email or Locker Code!' };
    }

    const user = foundUsers[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Invalid Student ID/Email or Locker Code!' };
    }

    // Create session
    await createSession(user.uid);
  } catch (error: unknown) {
    console.error('Login error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error occurred during login.' };
  }

  // Redirect to dashboard upon successful login
  redirect('/dashboard');
}

export async function logoutStudent() {
  await deleteSession();
  redirect('/login');
}

export async function toggleClubMembership(clubId: number) {
  const session = await getStudentSession();
  if (!session) {
    return { success: false, error: 'Unauthorized session. Please log in.' };
  }

  try {
    // Check if student is already a member of this club
    const memberships = await db.select({ student_id: clubMembers.student_id })
      .from(clubMembers)
      .where(and(eq(clubMembers.student_id, session.student_id), eq(clubMembers.club_id, clubId)));

    if (memberships.length > 0) {
      // Leave club
      await db.delete(clubMembers)
        .where(and(eq(clubMembers.student_id, session.student_id), eq(clubMembers.club_id, clubId)));
    } else {
      // Join club
      await db.insert(clubMembers).values({
        student_id: session.student_id,
        club_id: clubId,
      });
    }

    // Revalidate dashboard path to refresh server components data
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Club toggling error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error occurred.' };
  }
}

export async function joinLeaveClub(formData: FormData) {
  const clubIdStr = formData.get('clubId') as string;
  if (clubIdStr) {
    await toggleClubMembership(parseInt(clubIdStr));
  }
}

export async function sendDarwinMessage(formData: FormData) {
  const session = await getStudentSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  const message = formData.get('message') as string;
  const studentIdForChat = formData.get('studentId') as string;
  const isAnonymousStr = formData.get('isAnonymous') as string;
  const isAnonymous = isAnonymousStr === 'true' ? 1 : 0;
  
  if (!message || message.trim() === '') {
    return { success: false, error: 'Message cannot be empty' };
  }

  // Determine sender role
  // If the logged in user is Darwin (EH-2024002) or Gumball (EH-2024001) and they are replying
  let sender: 'Student' | 'Darwin' | 'Gumball' = 'Student';
  let targetStudentId = session.student_id;

  if (session.student_id === 'EH-2024002') {
    sender = 'Darwin';
    if (studentIdForChat) targetStudentId = studentIdForChat;
  } else if (session.student_id === 'EH-2024001') {
    sender = 'Gumball';
    if (studentIdForChat) targetStudentId = studentIdForChat;
  }

  try {
    await db.insert(darwinChats).values({
      student_id: targetStudentId,
      sender: sender,
      is_anonymous: (sender === 'Student') ? isAnonymous : 0, // Staff can't be anonymous
      message: message.trim()
    });
    return { success: true };
  } catch (err: unknown) {
    console.error('Chat error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown chat error' };
  }
}

export async function getDarwinChatHistory(studentId?: string) {
  const session = await getStudentSession();
  if (!session) return [];

  let targetStudentId = session.student_id;
  
  if ((session.student_id === 'EH-2024002' || session.student_id === 'EH-2024001') && studentId) {
    targetStudentId = studentId;
  }

  try {
    const history = await db.select()
      .from(darwinChats)
      .where(eq(darwinChats.student_id, targetStudentId))
      .orderBy(darwinChats.created_at);
      
    return history;
  } catch (err) {
    console.error('Fetch chat error:', err);
    return [];
  }
}

export async function getDarwinInboxList() {
  const session = await getStudentSession();
  if (!session || (session.student_id !== 'EH-2024002' && session.student_id !== 'EH-2024001')) return [];

  try {
    const uniqueChats = await db.select({
      student_id: darwinChats.student_id,
      name: users.full_name,
      avatar: users.avatar,
      is_anonymous: sql<number>`MAX(${darwinChats.is_anonymous})`.mapWith(Number)
    })
    .from(darwinChats)
    .innerJoin(students, eq(darwinChats.student_id, students.student_id))
    .innerJoin(users, eq(students.uid, users.uid))
    .groupBy(darwinChats.student_id, users.full_name, users.avatar);

    return uniqueChats;
  } catch (err) {
    console.error('Fetch inbox error:', err);
    return [];
  }
}
