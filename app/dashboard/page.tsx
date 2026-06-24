import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { clubs, clubMembers, users, students } from '@/lib/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { getStudentSession } from '@/lib/auth';
import { joinLeaveClub, logoutStudent } from '../actions';
import DarwinChatWidget from '@/components/DarwinChatWidget';
import DarwinInbox from '@/components/DarwinInbox';

interface Club {
  id: number;
  name: string;
  category: string;
  icon: string;
  description: string;
  member_count: number;
}

interface Member {
  id: number;
  name: string;
  student_id: string;
  year: number;
  room: string;
  email: string;
  avatar: string;
}

const AVATARS: { [id: string]: { emoji: string; bg: string } } = {
  gumball: { emoji: '🐱', bg: 'bg-[#4ba3e3]' },
  darwin: { emoji: '🐠', bg: 'bg-[#ff7e36]' },
  anais: { emoji: '🐰', bg: 'bg-[#ff76b4]' },
  penny: { emoji: '🦌', bg: 'bg-[#ffe15d]' },
  carrie: { emoji: '👻', bg: 'bg-indigo-300' },
  bobert: { emoji: '🤖', bg: 'bg-slate-400' },
  banana: { emoji: '🍌', bg: 'bg-[#ffe15d]' },
};

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

  // Helper to render user avatar circle
  const renderAvatar = (avatarId: string, sizeClass = 'w-12 h-12 text-2xl') => {
    const avatarInfo = AVATARS[avatarId] || { emoji: '👤', bg: 'bg-slate-200' };
    return (
      <div className={`${sizeClass} rounded-xl border-2 border-elmore-dark flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)] ${avatarInfo.bg}`}>
        {avatarInfo.emoji}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#e6f4fe] flex flex-col">
      {/* Top Banner Navigation */}
      <header className="bg-elmore-sky border-b-3 border-elmore-dark py-4 px-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏫</span>
          <div>
            <h1 className="text-2xl font-fredoka font-bold tracking-tight">Elmore High Hallway</h1>
            <p className="text-blue-100 text-xs font-semibold">Student Club Portal & Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="bg-white/10 px-3 py-1 rounded-lg text-sm font-semibold border border-white/20">
            🔔 Student View Only
          </span>
          <form action={logoutStudent}>
            <button
              type="submit"
              className="px-4 py-2 bg-elmore-pink text-white font-fredoka font-bold text-sm rounded-xl cartoon-shadow-btn hover:bg-opacity-95"
            >
              Log Out 🚪
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8 max-w-7xl">
        
        {/* Left Column: Student Profile & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Student ID Card (Profile) */}
          <div className="bg-white rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] overflow-hidden relative">
            {/* Header Strip */}
            <div className="bg-elmore-orange p-3 border-b-3 border-elmore-dark text-white text-center font-fredoka font-bold tracking-wider text-sm">
              ★ OFFICIAL STUDENT ID CARD ★
            </div>
            
            <div className="p-6 flex flex-col items-center">
              {/* Photo placeholder with Gumball style */}
              <div className="mb-4 relative">
                {renderAvatar(session.avatar, 'w-24 h-24 text-5xl')}
                <div className="absolute -bottom-2 -right-2 bg-elmore-green text-white text-xs px-2 py-0.5 rounded-full border border-elmore-dark font-bold uppercase rotate-6">
                  Active
                </div>
              </div>

              <h2 className="text-xl font-fredoka font-bold text-elmore-dark text-center">{session.full_name}</h2>
              <span className="text-xs text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full mt-1">
                {session.student_id}
              </span>

              <div className="w-full border-t border-dashed border-slate-200 my-4"></div>

              {/* Profile Details */}
              <div className="w-full text-sm font-semibold text-slate-600 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Class Grade:</span>
                  <span className="text-elmore-dark font-bold">{session.year}nd Year (Grade {session.year + 6})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Homeroom:</span>
                  <span className="text-elmore-dark font-bold">Room {session.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-elmore-dark font-bold truncate max-w-45">{session.email}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-slate-400">Clubs Joined:</span>
                  <span className="text-elmore-sky font-bold bg-elmore-sky/10 px-2 py-0.5 rounded-full border border-elmore-sky/20">
                    {userMemberships.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice Sticker */}
          <div className="bg-elmore-yellow p-5 rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)] sticker text-elmore-dark">
            <h3 className="font-fredoka font-bold text-lg mb-2">📌 Hallway Reminders</h3>
            <ul className="text-xs font-semibold list-disc list-inside flex flex-col gap-1.5 opacity-90">
              <li>Keep lockers shut tight to prevent ghosts escaping.</li>
              <li>Robots (Bobert) are not permitted to activate lasers.</li>
              <li>Please join clubs responsibly. Miss Simian is watching.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Bulletin Board of Clubs & Selected Roster */}
        <div className="lg:col-span-8 grid md:grid-cols-12 gap-8">
          
          {/* Clubs List Grid */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
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
                    <div 
                      key={club.id}
                      className={`p-5 bg-white rounded-2xl border-3 transition-all relative ${
                        isSelected 
                          ? 'border-elmore-sky bg-[#f7fbff] shadow-[4px_4px_0px_0px_var(--elmore-sky)] scale-[1.01]' 
                          : 'border-elmore-dark shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Club Header */}
                      <div className="flex justify-between items-start gap-3">
                        <Link 
                          href={`/dashboard?clubId=${club.id}`}
                          className="flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="w-12 h-12 shrink-0 bg-slate-100 rounded-xl border-2 border-elmore-dark flex items-center justify-center text-2xl shadow-[2px_2px_0px_rgba(30,41,59,1)] group-hover:-rotate-12 transition-transform overflow-hidden">
                            {club.icon.startsWith('/') ? (
                              <Image src={club.icon} alt={club.name} className="w-full h-full object-cover" width={48} height={48} />
                            ) : (
                              club.icon
                            )}
                          </div>
                          <div>
                            <h3 className="font-fredoka font-bold text-elmore-dark group-hover:text-elmore-sky transition-colors">
                              {club.name}
                            </h3>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {club.category}
                            </span>
                          </div>
                        </Link>
                        
                        <form action={joinLeaveClub}>
                          <input type="hidden" name="clubId" value={club.id} />
                          <button
                            type="submit"
                            className={`px-3 py-1.5 rounded-lg text-xs font-fredoka font-bold cartoon-shadow-btn ${
                              isMember 
                                ? 'bg-elmore-pink text-white hover:bg-opacity-90' 
                                : 'bg-elmore-yellow text-elmore-dark hover:bg-opacity-95'
                            }`}
                          >
                            {isMember ? 'Leave 🚪' : 'Join 🎒'}
                          </button>
                        </form>
                      </div>

                      {/* Club Body */}
                      <p className="text-slate-500 text-xs font-semibold mt-3 leading-relaxed">
                        {club.description}
                      </p>

                      {/* Club Footer */}
                      <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex justify-between items-center">
                        <Link 
                          href={`/dashboard?clubId=${club.id}`}
                          className="text-[10px] font-bold text-elmore-sky hover:underline"
                        >
                          View Member Roster →
                        </Link>
                        
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {club.member_count} active {club.member_count === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Roster Sidebar Column */}
          <div className="md:col-span-5">
            <div className="sticky top-6 flex flex-col gap-6">
              <h2 className="text-2xl font-fredoka font-bold text-elmore-dark">Club Roster</h2>
              
              {selectedClubDetails ? (
                <div className="bg-white rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)] overflow-hidden">
                  
                  {/* Roster Header */}
                  <div className="bg-elmore-dark p-4 text-white flex items-center gap-2">
                    <span className="text-2xl">{selectedClubDetails.icon}</span>
                    <div>
                      <h3 className="font-fredoka font-bold text-sm tracking-tight truncate max-w-40">
                        {selectedClubDetails.name}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-300">
                        Roster • {selectedClubMembers.length} {selectedClubMembers.length === 1 ? 'Student' : 'Students'}
                      </p>
                    </div>
                  </div>

                  {/* Roster List */}
                  <div className="p-4 flex flex-col gap-3 max-h-95 overflow-y-auto">
                    {selectedClubMembers.length === 0 ? (
                      <div className="py-6 text-center text-xs font-semibold text-slate-400">
                        No members yet! Be the first to join this club.
                      </div>
                    ) : (
                      selectedClubMembers.map((member) => (
                        <div 
                          key={member.id} 
                          className={`p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 transition-colors ${
                            member.id === session.uid ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200' : ''
                          }`}
                        >
                          {renderAvatar(member.avatar, 'w-10 h-10 text-xl')}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-elmore-dark truncate max-w-27.5">
                                {member.name}
                              </h4>
                              {member.id === session.uid && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-300 uppercase tracking-wide">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                              {member.student_id} • Year {member.year} • Room {member.room}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-100 border-3 border-dashed border-slate-300 rounded-2xl text-center shadow-[3px_3px_0px_rgba(0,0,0,0.05)] text-slate-400 flex flex-col items-center justify-center min-h-55">
                  <span className="text-4xl mb-3">🗂️</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Roster Locker
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 max-w-40">
                    Click on a club&apos;s title or details link to inspect the active member roster.
                  </p>
                </div>
              )}
            </div>
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
