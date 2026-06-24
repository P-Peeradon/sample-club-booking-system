import { db } from '@/lib/db';
import { clubs, clubMembers, students, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import ApproveClubButton from './ApproveClubButton';

export default async function PendingClubsList() {
  // Fetch pending clubs
  const pendingClubs = await db.select({
    id: clubs.club_id,
    name: clubs.name,
    category: clubs.category,
    icon: clubs.icon,
    description: clubs.desc,
  })
  .from(clubs)
  .where(eq(clubs.is_approved, false));

  if (pendingClubs.length === 0) {
    return null;
  }

  // To display who created it, we can fetch the president for each pending club.
  const presidents = await db.select({
    club_id: clubMembers.club_id,
    president_name: users.full_name,
  })
  .from(clubMembers)
  .innerJoin(students, eq(clubMembers.student_id, students.student_id))
  .innerJoin(users, eq(students.uid, users.uid))
  .where(eq(clubMembers.is_president, true));

  const presidentMap = presidents.reduce((acc, p) => {
    acc[p.club_id] = p.president_name;
    return acc;
  }, {} as Record<number, string>);

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center gap-3 bg-red-500 text-white p-3 rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)]">
        <span className="text-2xl">🚨</span>
        <h2 className="text-xl font-fredoka font-bold tracking-wide uppercase">Admin Action Required: Pending Clubs</h2>
      </div>

      <div className="flex flex-col gap-4">
        {pendingClubs.map((club) => (
          <div key={club.id} className="p-4 bg-white rounded-2xl border-3 border-elmore-dark shadow-[3px_3px_0px_rgba(30,41,59,1)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 flex-shrink-0 bg-slate-100 rounded-xl border-2 border-elmore-dark flex items-center justify-center text-2xl overflow-hidden">
                {club.icon.startsWith('/') ? (
                  <img src={club.icon} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  club.icon
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-fredoka font-bold text-lg text-elmore-dark">{club.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 rounded-full border border-slate-300">
                    {club.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mb-1 truncate max-w-sm">
                  {club.description}
                </p>
                <p className="text-xs font-bold text-blue-500">
                  Requested by: {presidentMap[club.id] || 'Unknown Student'}
                </p>
              </div>
            </div>
            
            <ApproveClubButton clubId={club.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
