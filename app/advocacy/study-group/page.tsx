import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { studyGroups, workshops, students, users } from '@/lib/schema';
import { getStudentSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import StudyGroupDashboard from '@/components/StudyGroupDashboard';

export default async function StudyGroupPage() {
  const session = await getStudentSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch initial study groups
  const initialGroups = await db.select({
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
  .leftJoin(users, eq(students.uid, users.uid))
  .orderBy(desc(studyGroups.created_at));

  // Fetch initial workshops
  const initialWorkshops = await db.select()
    .from(workshops)
    .orderBy(desc(workshops.date));

  // Serialize dates for client component
  const serializedGroups = initialGroups.map(g => ({
    ...g,
    created_at: g.created_at.toISOString(),
  }));

  const serializedWorkshops = initialWorkshops.map(w => ({
    ...w,
    date: w.date.toISOString(),
    created_at: w.created_at.toISOString(),
  }));

  return (
    <StudyGroupDashboard 
      session={session} 
      initialGroups={serializedGroups as any} 
      initialWorkshops={serializedWorkshops as any} 
    />
  );
}
