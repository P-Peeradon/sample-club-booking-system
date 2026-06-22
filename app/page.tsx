import Link from 'next/link';
import { db } from '@/lib/db';
import { students, clubs } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { getStudentSession } from '@/lib/auth';

export default async function Home() {
  const session = await getStudentSession();

  let stats = { students: 0, clubs: 0 };
  let dbPending = false;

  try {
    const studentCount = await db.select({ count: sql<number>`count(*)` }).from(students);
    const clubCount = await db.select({ count: sql<number>`count(*)` }).from(clubs);
    stats.students = studentCount[0]?.count || 0;
    stats.clubs = clubCount[0]?.count || 0;
  } catch (error) {
    // If database tables do not exist yet, show fallback stats and a configuration tip
    dbPending = true;
    stats = { students: 7, clubs: 6 };
  }

  return (
    <main className="flex-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#e6f4fe] via-[#f0f7ff] to-white pb-12">
      
      {/* Decorative Floating Cartoon Clouds */}
      <div className="absolute top-10 left-10 w-32 h-16 opacity-80 animate-float-slow pointer-events-none select-none">
        <svg viewBox="0 0 100 50" fill="#ffffff" className="w-full h-full filter drop-shadow-[2px_2px_0px_rgba(30,41,59,0.15)]">
          <path d="M 20 40 A 15 15 0 0 1 35 20 A 20 20 0 0 1 70 15 A 15 15 0 0 1 85 35 A 10 10 0 0 1 80 45 L 20 45 Z" />
        </svg>
      </div>

      <div className="absolute top-24 right-16 w-40 h-20 opacity-80 animate-float-medium pointer-events-none select-none">
        <svg viewBox="0 0 100 50" fill="#ffffff" className="w-full h-full filter drop-shadow-[2px_2px_0px_rgba(30,41,59,0.15)]">
          <path d="M 20 40 A 15 15 0 0 1 35 20 A 20 20 0 0 1 70 15 A 15 15 0 0 1 85 35 A 10 10 0 0 1 80 45 L 20 45 Z" />
        </svg>
      </div>

      {/* Hero Section Header */}
      <div className="container mx-auto px-4 pt-16 text-center max-w-4xl">
        <div className="inline-block bg-elmore-yellow text-elmore-dark font-fredoka font-bold text-sm md:text-base px-6 py-2 rounded-full cartoon-border uppercase tracking-wider sticker mb-6">
          🏫 Elmore High School
        </div>
        
        <h1 className="text-4xl md:text-7xl font-fredoka font-bold tracking-tight text-elmore-dark mb-4 filter drop-shadow-[4px_4px_0px_rgba(75,163,227,0.3)]">
          CLUB BULLETIN BOARD
        </h1>
        
        <p className="text-base md:text-xl text-slate-600 max-w-xl mx-auto font-medium mb-12">
          Enroll as a student, access your locker, sign up for crazy school clubs, and see who else is in the team!
        </p>

        {dbPending && (
          <div className="max-w-md mx-auto mb-10 p-4 bg-amber-100 border-2 border-amber-500 rounded-xl text-amber-800 text-sm font-semibold flex flex-col items-center gap-2 shadow-[3px_3px_0px_rgba(180,83,9,0.2)]">
            <span className="text-base">⚠️ Database Setup Pending!</span>
            <p className="text-center font-normal text-amber-700">
              Please enter your correct MySQL password in <code className="bg-amber-200 px-1 py-0.5 rounded">.env.local</code> and run the seeding command:
              <br />
              <code className="block bg-amber-950 text-amber-100 px-2 py-1 mt-2 rounded font-mono select-all">bun run scripts/seed.ts</code>
            </p>
          </div>
        )}

        {/* Dynamic School Bulletin Board */}
        <div className="max-w-2xl mx-auto bg-elmore-board p-6 rounded-2xl border-4 border-elmore-dark shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] text-white relative mb-16">
          {/* Wood board frame pin icons */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          
          <div className="font-fredoka border-b-2 border-dashed border-green-700/60 pb-3 mb-6 flex justify-around text-center">
            <div>
              <p className="text-xs uppercase text-green-300 tracking-widest font-bold mb-1">Enrolled Students</p>
              <p className="text-3xl md:text-5xl font-bold text-elmore-yellow drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                {stats.students}
              </p>
            </div>
            
            <div className="border-l border-green-700/60"></div>
            
            <div>
              <p className="text-xs uppercase text-green-300 tracking-widest font-bold mb-1">Active School Clubs</p>
              <p className="text-3xl md:text-5xl font-bold text-elmore-green drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                {stats.clubs}
              </p>
            </div>
          </div>
          
          <div className="text-sm md:text-base font-medium text-green-100 italic bg-green-900/40 py-2.5 px-4 rounded-xl border border-green-800">
            "Notice: Seeding contains character data for Gumball, Darwin, Penny, Carrie, Anais, Bobert, and Banana Joe. Principal Brown warns that chewing banana peels in the hallway is strictly prohibited."
          </div>
        </div>

        {/* Big Interactive Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Join / Register Card */}
          <div className="bg-white p-6 rounded-2xl cartoon-shadow-pink hover:-translate-y-1 transition-transform flex flex-col justify-between items-center text-center">
            <div>
              <div className="w-14 h-14 bg-elmore-pink/20 text-elmore-pink flex items-center justify-center rounded-xl font-fredoka text-3xl mb-4 mx-auto border-2 border-elmore-dark">
                📝
              </div>
              <h2 className="text-2xl font-fredoka font-bold text-elmore-dark mb-2">Enroll Student</h2>
              <p className="text-slate-500 text-sm font-medium mb-6">
                Register with your Student ID and choose your favorite cartoon avatar to access the clubs!
              </p>
            </div>
            
            <Link 
              href="/register" 
              className="w-full py-3 bg-elmore-pink text-white font-fredoka font-bold text-lg rounded-xl cartoon-shadow-btn hover:bg-opacity-90 block"
            >
              Start Enrollment
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white p-6 rounded-2xl cartoon-shadow-sky hover:-translate-y-1 transition-transform flex flex-col justify-between items-center text-center">
            <div>
              <div className="w-14 h-14 bg-elmore-sky/20 text-elmore-sky flex items-center justify-center rounded-xl font-fredoka text-3xl mb-4 mx-auto border-2 border-elmore-dark">
                🔑
              </div>
              <h2 className="text-2xl font-fredoka font-bold text-elmore-dark mb-2">Access Lockers</h2>
              <p className="text-slate-500 text-sm font-medium mb-6">
                Already registered? Use your Email or Student ID and Locker Code (Password) to log back in.
              </p>
            </div>
            
            {session ? (
              <Link 
                href="/dashboard" 
                className="w-full py-3 bg-elmore-sky text-white font-fredoka font-bold text-lg rounded-xl cartoon-shadow-btn hover:bg-opacity-90 block"
              >
                Go to Hallway (Dashboard)
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="w-full py-3 bg-elmore-sky text-white font-fredoka font-bold text-lg rounded-xl cartoon-shadow-btn hover:bg-opacity-90 block"
              >
                Enter Locker Room
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm font-semibold text-slate-400">
        <p>© 2026 Elmore High School. Powered by Watterson Technology Co.</p>
        <p className="text-xs text-slate-300 mt-1">Inspired by Cartoon Network's "The Amazing World of Gumball"</p>
      </footer>
    </main>
  );
}
