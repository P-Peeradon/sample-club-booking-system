'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { createSession, deleteSession, getStudentSession } from '@/lib/auth';

export async function registerStudent(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const studentId = formData.get('studentId') as string;
  const yearStr = formData.get('year') as string;
  const room = formData.get('room') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const avatar = formData.get('avatar') as string;

  // Basic validations
  if (!name || !studentId || !yearStr || !room || !email || !password || !avatar) {
    return { success: false, error: 'All fields are required!' };
  }

  const studentIdRegex = /^EH-\d{4}$/;
  if (!studentIdRegex.test(studentId)) {
    return { success: false, error: 'Student ID must follow the EH-XXXX format (e.g., EH-1234)' };
  }

  const year = parseInt(yearStr);
  if (isNaN(year) || year < 1 || year > 6) {
    return { success: false, error: 'Year must be a number between 1 and 6' };
  }

  try {
    // Check if Student ID already exists
    const existingId = await query<any[]>('SELECT id FROM users WHERE student_id = ?', [studentId]);
    if (existingId && existingId.length > 0) {
      return { success: false, error: 'Student ID already registered!' };
    }

    // Check if Email already exists
    const existingEmail = await query<any[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail && existingEmail.length > 0) {
      return { success: false, error: 'Email already registered!' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const result = await query<any>(
      'INSERT INTO users (name, student_id, year, room, email, password, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, studentId, year, room, email, hashedPassword, avatar]
    );

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

export async function loginStudent(prevState: any, formData: FormData) {
  const emailOrId = formData.get('emailOrId') as string;
  const password = formData.get('password') as string;

  if (!emailOrId || !password) {
    return { success: false, error: 'Both Student ID/Email and Locker Code (Password) are required!' };
  }

  try {
    // Find user by email or student ID
    const users = await query<any[]>(
      'SELECT id, student_id, password FROM users WHERE email = ? OR student_id = ?',
      [emailOrId, emailOrId]
    );

    if (!users || users.length === 0) {
      return { success: false, error: 'Invalid Student ID/Email or Locker Code!' };
    }

    const user = users[0];

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
    const memberships = await query<any[]>(
      'SELECT 1 FROM club_members WHERE user_id = ? AND club_id = ?',
      [session.id, clubId]
    );

    if (memberships && memberships.length > 0) {
      // Leave club
      await query('DELETE FROM club_members WHERE user_id = ? AND club_id = ?', [session.id, clubId]);
    } else {
      // Join club
      await query('INSERT INTO club_members (user_id, club_id) VALUES (?, ?)', [session.id, clubId]);
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

