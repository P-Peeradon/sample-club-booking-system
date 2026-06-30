'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { invoke } from '@tauri-apps/api/core';
import StudentProfileCard from '@/components/StudentProfileCard';
import ClubCard from '@/components/ClubCard';
import ClubRoster from '@/components/ClubRoster';
import NodeStatus from '@/components/NodeStatus';
import DarwinChatWidget from '@/components/DarwinChatWidget';
import DarwinInbox from '@/components/DarwinInbox';
import PendingClubsList from '@/components/PendingClubsList';
import GlobalSettingsSwitcher from '@/components/GlobalSettingsSwitcher';
import { Club, Member } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import type { Locale } from '@/lib/app-config';

export default function DashboardClient({ dict, locale, pathname }: { dict: any, locale: Locale, pathname: string }) {
  const searchParams = useSearchParams();
  const selectedClubId = searchParams.get('clubId') ? parseInt(searchParams.get('clubId')!) : null;

  const [session, setSession] = useState<any>(null);
  const [clubsData, setClubsData] = useState<Club[]>([]);
  const [userMemberships, setUserMemberships] = useState<number[]>([]);
  const [selectedClubMembers, setSelectedClubMembers] = useState<Member[]>([]);
  const [selectedClubDetails, setSelectedClubDetails] = useState<Club | null>(null);
  const [dbError, setDbError] = useState(false);
  const [isTauri, setIsTauri] = useState(false);
  
  const timezone = 'America/Los_Angeles';

  useEffect(() => {
    if ((window as any).__TAURI_INTERNALS__) {
      setIsTauri(true);
      fetchDashboardData();
    } else {
      // Provide dummy data for web mode or when Tauri backend isn't running
      setSession({ student_id: 'EH-2024001', full_name: 'Gumball Watterson', avatar: 'gumball_blue_cat' });
      setClubsData([{ id: 1, name: 'Video Game Club', category: 'Education', icon: '🎮', description: 'Gaming', member_count: 5 }]);
      setUserMemberships([1]);
    }
  }, [selectedClubId]);

  const fetchDashboardData = async () => {
    try {
      // In a real Tauri app, session state is managed globally or fetched from local storage
      // Mocking Gumball's session for this spoke test
      const currentSession = { student_id: 'EH-2024001', full_name: 'Gumball Watterson', avatar: 'gumball_blue_cat' };
      setSession(currentSession);

      // We haven't implemented these Tauri commands in db.rs yet for brevity in this task step,
      // but this is how the client structure fetches them via Tauri IPC
      // const fetchedClubs = await invoke<Club[]>('get_clubs');
      // setClubsData(fetchedClubs);

      // const memberships = await invoke<number[]>('get_memberships', { studentId: currentSession.student_id });
      // setUserMemberships(memberships);

      // if (selectedClubId) {
      //   const members = await invoke<Member[]>('get_club_members', { clubId: selectedClubId });
      //   setSelectedClubMembers(members);
      // }
      
      // Fallback mock data to prove the UI works as a client component
      setClubsData([{ id: 1, name: 'Tauri Rust Club', category: 'Education', icon: '🦀', description: 'Distributed computing', member_count: 42 }]);
      setUserMemberships([1]);
      
      if (selectedClubId === 1) {
        setSelectedClubDetails({ id: 1, name: 'Tauri Rust Club', category: 'Education', icon: '🦀', description: 'Distributed computing', member_count: 42 });
        setSelectedClubMembers([{ id: 1, name: 'Gumball', student_id: 'EH-2024001', year: 2024, room: 'A1', email: 'gum@elmore.edu', avatar: 'gumball_blue_cat' }]);
      }
      
    } catch (e) {
      console.error(e);
      setDbError(true);
    }
  };

  const logoutStudent = async () => {
    // Handle logout logic locally (e.g. clear Tauri state)
    window.location.href = `/${locale}/login`;
  };

  if (!session) return <div className="p-10 text-center font-fredoka text-xl">Loading dashboard...</div>;

  return (
    <main className="min-h-screen bg-[#e6f4fe] flex flex-col">
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
          <button
            onClick={logoutStudent}
            className="bg-white/10 hover:bg-white/20 border-2 border-elmore-dark px-4 py-2 rounded-xl text-sm font-bold shadow-[2px_2px_0px_rgba(30,41,59,1)] transition-colors text-white"
          >
            {dict.common.logout}
          </button>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 fiji:grid-cols-1 usa:grid-cols-12 lg:grid-cols-12 gap-8 usa:gap-8 china:gap-12 max-w-7xl">
        
        <div className="usa:col-span-5 lg:col-span-4 china:col-span-4 flex flex-col gap-8">
          
          <StudentProfileCard 
            session={session} 
            membershipsCount={userMemberships.length} 
            dict={dict} 
          />

          <div className="bg-white rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] p-4">
            <h3 className="font-fredoka font-bold text-elmore-dark mb-3">{dict.dashboard.campusServices}</h3>
            <Link href={`/${locale}/advocacy`} className="flex items-center gap-3 p-3 bg-elmore-yellow/20 rounded-xl border-2 border-elmore-yellow hover:bg-elmore-yellow hover:text-elmore-dark transition-colors font-bold text-sm cartoon-shadow-btn">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-elmore-dark">{dict.dashboard.advocacyTitle}</div>
                <div className="text-xs text-slate-500 font-normal">{dict.dashboard.advocacyDesc}</div>
              </div>
            </Link>
          </div>

          <div className="bg-elmore-yellow p-5 rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)] sticker text-elmore-dark">
            <h3 className="font-fredoka font-bold text-lg mb-2">{dict.dashboard.hallwayReminders}</h3>
            <ul className="text-xs font-semibold list-disc list-inside flex flex-col gap-1.5 opacity-90">
              <li>Keep lockers shut tight to prevent ghosts escaping.</li>
              <li>Robots (Bobert) are not permitted to activate lasers.</li>
              <li>Please join clubs responsibly. Miss Simian is watching.</li>
            </ul>
          </div>
          
          <NodeStatus />
        </div>

        <div className="usa:col-span-7 lg:col-span-8 china:col-span-8 grid md:grid-cols-12 gap-8 china:gap-10">
          
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {(session.student_id === 'EH-2024001' || session.student_id === 'EH-2024002') && (
              <PendingClubsList />
            )}

            <div className="flex justify-between items-center flex-col sm:flex-row gap-4 fiji:flex-row usa:flex-row china:flex-row">
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-2xl font-fredoka font-bold text-elmore-dark">Clubs Directory</h2>
                <Link href={`/${locale}/dashboard/clubs/new`} className="text-sm bg-orange-400 text-white px-3 py-1.5 rounded-xl font-bold border-2 border-elmore-dark shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-orange-500 hover:translate-y-0.5 active:shadow-none transition-all">
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
                {clubsData.map(club => {
                  const isMember = userMemberships.includes(club.id);
                  const isSelected = selectedClubId === club.id;
                  
                  return (
                    <ClubCard 
                      key={club.id}
                      club={club}
                      isMember={isMember}
                      isSelected={isSelected}
                      locale={locale}
                      dict={dict}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-5 h-full relative">
            <div className="sticky top-8 fiji:top-8 usa:top-8 china:top-12 flex flex-col gap-6">
              <DarwinChatWidget />

              <ClubRoster 
                selectedClubDetails={selectedClubDetails}
                selectedClubMembers={selectedClubMembers}
                sessionUid={session?.student_id}
              />
            </div>
          </div>

        </div>
      </div>
      
      <DarwinInbox />
    </main>
  );
}
