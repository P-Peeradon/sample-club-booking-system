import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { clubs, clubMembers, users, students } from '@/lib/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { getStudentSession } from '@/lib/auth';
import { logoutStudent } from '@/app/actions';
import DarwinChatWidget from '@/components/DarwinChatWidget';
import DarwinInbox from '@/components/DarwinInbox';
import PendingClubsList from '@/components/PendingClubsList';
import GlobalSettingsSwitcher from '@/components/GlobalSettingsSwitcher';
import { getDictionary } from '@/lib/dictionaries';
import { headers } from 'next/headers';
import { Club, Member } from '@/lib/types';
import StudentProfileCard from '@/components/StudentProfileCard';
import ClubCard from '@/components/ClubCard';
import ClubRoster from '@/components/ClubRoster';

export default async function Dashboard(props: {
  searchParams: Promise<{ clubId?: string }>;
}) {
  // 1. Authenticate user
  const session = await getStudentSession();
  if (!session) {
    redirect('/login');
  }

  // 2. Await async searchParams (Next.js 16 breaking change)
  const searchParams = await props.searchParams;
  const selectedClubId = searchParams.clubId ? parseInt(searchParams.clubId) : null;

  const headerList = await headers();
  const locale = (headerList.get('x-locale') || 'en') as any;
  const timezone = (headerList.get('x-timezone') || 'America/Los_Angeles') as any;
  const pathname = headerList.get('x-pathname') || '/dashboard';
  const dict = await getDictionary(locale);

  let clubsData: Club[] = [];
  let userMemberships: number[] = [];
  let selectedClubMembers: Member[] = [];
  let selectedClubDetails: Club | null = null;
  let dbError = false;

  try {
    // Fetch all clubs and their member count
    const fetchedClubs = await db.select({
      id: clubs.club_id,
      name: clubs.name,
      category: clubs.category,
      icon: clubs.icon,
      description: clubs.desc,
      member_count: sql<number>`count(${clubMembers.student_id})`.mapWith(Number)
    })
    .from(clubs)
    .leftJoin(clubMembers, eq(clubs.club_id, clubMembers.club_id))
    .where(eq(clubs.is_approved, true))
    .groupBy(clubs.club_id)
    .orderBy(desc(clubs.created_at));
    
    clubsData = fetchedClubs as unknown as Club[];

    // Fetch current student's joined club IDs
    const memberships = await db.select({ club_id: clubMembers.club_id })
      .from(clubMembers)
      .where(eq(clubMembers.student_id, session.student_id));
      
    userMemberships = memberships.map((m) => m.club_id);

    // Fetch members for the selected club if applicable
    if (selectedClubId) {
      const fetchedMembers = await db.select({
        id: users.uid,
        name: users.full_name,
        student_id: students.student_id,
        year: students.year,
        room: students.room,
        email: users.email,
        avatar: users.avatar
      })
      .from(users)
      .innerJoin(students, eq(users.uid, students.uid))
      .innerJoin(clubMembers, eq(students.student_id, clubMembers.student_id))
      .where(eq(clubMembers.club_id, selectedClubId))
      .orderBy(clubMembers.joined_at);
      
      selectedClubMembers = fetchedMembers as unknown as Member[];

      // Fetch select club details
      const clubDetailsList = clubsData.filter(c => c.id === selectedClubId);
      if (clubDetailsList.length > 0) {
        selectedClubDetails = clubDetailsList[0];
      }
    }
  } catch (error: unknown) {
    const err = error as Error & { code?: string, errno?: number, sqlState?: string, sqlMessage?: string };
    console.error("DASHBOARD DB ERROR details:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    dbError = true;
  }

  return (
    <main className="min-h-screen bg-[#e6f4fe] flex flex-col">
      {/* Top Banner Navigation */}
      <header className="bg-elmore-sky border-b-3 border-elmore-dark py-4 px-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏫</span>
          <div>
            <h1 className="text-2xl font-fredoka font-bold tracking-tight">{dict.dashboard.title}</h1>
            <p className="text-blue-100 text-xs font-semibold">Student Club Portal & Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GlobalSettingsSwitcher dict={dict} currentLocale={locale} currentTimezone={timezone} currentPathname={pathname} />
          <form action={logoutStudent}>
            <button
              type="submit"
              className="bg-white/10 hover:bg-white/20 border-2 border-elmore-dark px-4 py-2 rounded-xl text-sm font-bold shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-colors text-white"
            >
              {dict.common.logout}
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 fiji:grid-cols-1 usa:grid-cols-12 lg:grid-cols-12 gap-8 usa:gap-8 china:gap-12 max-w-7xl">
        
        {/* Left Column: Student Profile & Stats */}
        <div className="usa:col-span-5 lg:col-span-4 china:col-span-4 flex flex-col gap-8">
          
          {/* Student ID Card (Profile) */}
          <StudentProfileCard 
            session={session} 
            membershipsCount={userMemberships.length} 
            dict={dict} 
          />

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] p-4">
            <h3 className="font-fredoka font-bold text-elmore-dark mb-3">{dict.dashboard.campusServices}</h3>
            <a href={`/${locale}/advocacy`} className="flex items-center gap-3 p-3 bg-elmore-yellow/20 rounded-xl border-2 border-elmore-yellow hover:bg-elmore-yellow hover:text-elmore-dark transition-colors font-bold text-sm cartoon-shadow-btn">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-elmore-dark">{dict.dashboard.advocacyTitle}</div>
                <div className="text-xs text-slate-500 font-normal">{dict.dashboard.advocacyDesc}</div>
              </div>
            </a>
          </div>

          {/* Darwin Inbox Component */}
          <div className="bg-elmore-yellow p-5 rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)] sticker text-elmore-dark">
            <h3 className="font-fredoka font-bold text-lg mb-2">{dict.dashboard.hallwayReminders}</h3>
            <ul className="text-xs font-semibold list-disc list-inside flex flex-col gap-1.5 opacity-90">
              <li>Keep lockers shut tight to prevent ghosts escaping.</li>
              <li>Robots (Bobert) are not permitted to activate lasers.</li>
              <li>Please join clubs responsibly. Miss Simian is watching.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Bulletin Board of Clubs & Selected Roster */}
        <div className="usa:col-span-7 lg:col-span-8 china:col-span-8 grid md:grid-cols-12 gap-8 china:gap-10">
          
          {/* Clubs List Grid */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {(session.student_id === 'EH-2024001' || session.student_id === 'EH-2024002') && (
              <PendingClubsList />
            )}

            <div className="flex justify-between items-center flex-col sm:flex-row gap-4 fiji:flex-row usa:flex-row china:flex-row">
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-2xl font-fredoka font-bold text-elmore-dark">Clubs Directory</h2>
                <Link href="/dashboard/clubs/new" className="text-sm bg-orange-400 text-white px-3 py-1.5 rounded-xl font-bold border-2 border-elmore-dark shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-orange-500 hover:translate-y-0.5 active:shadow-none transition-all">
                  Start a New Club! ✨
                </Link>
              </div>
              <span className="text-xs bg-elmore-sky-light text-elmore-sky border border-elmore-sky/20 px-2.5 py-1 rounded-full font-bold">
                {clubsData.length} Clubs Available
              </span>
            </div>

            {dbError ? (
              <div className="p-6 bg-red-50 border-3 border-red-500 rounded-2xl text-red-700 text-sm font-semibold text-center shadow-[4px_4px_0px_rgba(239,68,68,0.25)]">
                <span className="text-lg block mb-2">💥 Database Connection Lost!</span>
                Check your local database configuration and ensure the tables exist.
              </div>
            ) : clubsData.length === 0 ? (
              <div className="p-8 bg-white border-3 border-dashed border-slate-300 rounded-2xl text-slate-400 text-sm font-semibold text-center">
                No clubs found. Run the seed script to populate them!
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {clubsData.map((club) => {
                  const isMember = userMemberships.includes(club.id);
                  const isSelected = selectedClubId === club.id;
                  
                  return (
                    <ClubCard 
                      key={club.id} 
                      club={club} 
                      isMember={isMember} 
                      isSelected={isSelected} 
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Roster Sidebar Column */}
          <div className="md:col-span-5">
            <ClubRoster 
              selectedClubDetails={selectedClubDetails} 
              selectedClubMembers={selectedClubMembers} 
              sessionUid={session.uid as any} 
            />
          </div>

        </div>
      </div>

      {/* Darwin & Gumball Wellbeing Inbox */}
      {(session.student_id === 'EH-2024001' || session.student_id === 'EH-2024002') && (
        <div className="container mx-auto px-4 pb-12 max-w-7xl">
          <DarwinInbox />
        </div>
      )}

      {/* Floating Chat Widget for Students */}
      {session.student_id !== 'EH-2024001' && session.student_id !== 'EH-2024002' && (
        <DarwinChatWidget />
      )}
    </main>
  );
}
