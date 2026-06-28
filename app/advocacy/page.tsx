import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { advocacyRequests, students, users } from '@/lib/schema';
import { getStudentSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import AdvocacyDashboard from '@/components/AdvocacyDashboard';

export default async function AdvocacyPage() {
  const session = await getStudentSession();
  if (!session) {
    redirect('/login');
  }

  const isAdmin = ['EH-2024001', 'EH-2024002', 'EH-2024003'].includes(session.student_id);

  let initialRequests = [];

  if (isAdmin) {
    initialRequests = await db.select({
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
  } else {
    initialRequests = await db.select()
      .from(advocacyRequests)
      .where(eq(advocacyRequests.student_id, session.student_id))
      .orderBy(desc(advocacyRequests.created_at));
  }

  // Convert dates to strings for passing to client component
  const serializedRequests = initialRequests.map(r => ({
    ...r,
    created_at: r.created_at.toISOString(),
  }));

  return <AdvocacyDashboard session={session} initialRequests={serializedRequests as any} />;
}
