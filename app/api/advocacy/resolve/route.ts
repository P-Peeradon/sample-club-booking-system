import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { advocacyRequests } from '@/lib/schema';
import { getStudentSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id } = session;
    const isAnais = student_id === 'EH-2024003';
    const isGumballOrDarwin = student_id === 'EH-2024001' || student_id === 'EH-2024002';

    if (!isAnais && !isGumballOrDarwin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { request_id, action, admin_response, revocation_reason } = body;

    if (!request_id || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Fetch the request
    const existingReq = await db.select().from(advocacyRequests).where(eq(advocacyRequests.id, request_id));
    if (existingReq.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const reqData = existingReq[0];

    if (action === 'Revoke') {
      if (!isGumballOrDarwin) {
        return NextResponse.json({ error: 'Only Gumball and Darwin can revoke.' }, { status: 403 });
      }
      if (reqData.status === 'Pending' || reqData.status === 'Revoked') {
        return NextResponse.json({ error: 'Can only revoke resolved or rejected requests.' }, { status: 400 });
      }
      if (!revocation_reason) {
        return NextResponse.json({ error: 'Revocation reason is required.' }, { status: 400 });
      }

      await db.update(advocacyRequests)
        .set({
          status: 'Revoked',
          revocation_reason,
          resolved_by: student_id
        })
        .where(eq(advocacyRequests.id, request_id));

      return NextResponse.json({ success: true });
    }

    if (action === 'Resolve' || action === 'Reject') {
      if (!isAnais) {
        return NextResponse.json({ error: 'Only Anais can make the initial decision.' }, { status: 403 });
      }
      
      await db.update(advocacyRequests)
        .set({
          status: action === 'Resolve' ? 'Resolved' : 'Rejected',
          admin_response,
          resolved_by: student_id
        })
        .where(eq(advocacyRequests.id, request_id));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: unknown) {
    console.error('Advocacy Resolve POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
