'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { users, clubMembers } from '@/lib/schema';
import { eq, or, and } from 'drizzle-orm';
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

export async function registerStudent(prevState: any, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, studentId, year, room, email, password, avatar } = parsed.data;

  try {
    // Check if Student ID or Email already exists
    const existingUser = await db.select({ id: users.id, student_id: users.student_id, email: users.email })
      .from(users)
      .where(or(eq(users.student_id, studentId), eq(users.email, email)));

    if (existingUser.length > 0) {
      if (existingUser[0].student_id === studentId) {
        return { success: false, error: 'Student ID already registered!' };
      }
      return { success: false, error: 'Email already registered!' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const [result] = await db.insert(users).values({
      name,
      student_id: studentId,
      year,
      room,
      email,
      password: hashedPassword,
      avatar,
    });

    const newUserId = result.insertId;

    // Create session and set cookie
    await createSession(newUserId, studentId);
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Database error occurred during registration.' };
  }

  // Redirect to dashboard upon successful registration
  redirect('/dashboard');
}

const loginSchema = z.object({
  emailOrId: z.string().min(1, 'Student ID/Email is required'),
  password: z.string().min(1, 'Locker Code is required'),
});

export async function loginStudent(prevState: any, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, error: 'Both Student ID/Email and Locker Code (Password) are required!' };
  }

  const { emailOrId, password } = parsed.data;

  try {
    // Find user by email or student ID
    const foundUsers = await db.select({ id: users.id, student_id: users.student_id, password: users.password })
      .from(users)
      .where(or(eq(users.email, emailOrId), eq(users.student_id, emailOrId)));

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
    await createSession(user.id, user.student_id);
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Database error occurred during login.' };
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
    // Check if user is already a member of this club
    const memberships = await db.select({ user_id: clubMembers.user_id })
      .from(clubMembers)
      .where(and(eq(clubMembers.user_id, session.id), eq(clubMembers.club_id, clubId)));

    if (memberships.length > 0) {
      // Leave club
      await db.delete(clubMembers)
        .where(and(eq(clubMembers.user_id, session.id), eq(clubMembers.club_id, clubId)));
    } else {
      // Join club
      await db.insert(clubMembers).values({
        user_id: session.id,
        club_id: clubId,
      });
    }

    // Revalidate dashboard path to refresh server components data
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Club toggling error:', error);
    return { success: false, error: error.message || 'Database error occurred.' };
  }
}

export async function joinLeaveClub(formData: FormData) {
  const clubIdStr = formData.get('clubId') as string;
  if (clubIdStr) {
    await toggleClubMembership(parseInt(clubIdStr));
  }
}


