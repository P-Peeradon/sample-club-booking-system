'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { invoke } from '@tauri-apps/api/core';
import GlobalSettingsSwitcher from '@/components/GlobalSettingsSwitcher';
import type { Locale } from '@/lib/app-config';
import type { Dictionary } from \'@/lib/dictionaries\';

export default function HomeClient({ dict, locale, pathname }: { dict: Dictionary, locale: Locale, pathname: string }) {
  const [stats, setStats] = useState({ students: 7, clubs: 6 });
  const [session, setSession] = useState<{ student_id: string; full_name: string; avatar: string; } | null>(null);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Check if running inside Tauri
    if ((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
      setIsTauri(true);
      fetchStats();
      checkSession();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const [students, clubs] = await invoke<[number, number]>('get_stats');
      setStats({ students, clubs });
    } catch (e) {
      console.error("Failed to fetch stats from Tauri:", e);
    }
  };

  const checkSession = async () => {
    // In Tauri, we'd fetch the active session from a local state or SQLite table
    // For now, assume null (logged out)
    setSession(null);
  };

  // We default timezone since we can't read headers in static export
  const timezone = 'America/Los_Angeles';

  return (
    <main className="flex-1 flex flex-col justify-between relative overflow-hidden bg-linear-to-b from-[#e6f4fe] via-[#f0f7ff] to-white pb-12">
      <div className="absolute top-4 right-4 z-50">
        <GlobalSettingsSwitcher dict={dict} currentLocale={locale} currentTimezone={timezone} currentPathname={pathname} />
      </div>
      
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

      <div className="container mx-auto px-4 pt-16 text-center max-w-4xl">
        <div className="inline-block bg-elmore-yellow text-elmore-dark font-fredoka font-bold text-sm md:text-base px-6 py-2 rounded-full cartoon-border uppercase tracking-wider sticker mb-6">
          {dict.home.schoolName}
        </div>
        
        <h1 className="text-4xl md:text-7xl font-fredoka font-bold tracking-tight text-elmore-dark mb-4 filter drop-shadow-[4px_4px_0px_rgba(75,163,227,0.3)]">
          {dict.home.heroTitle}
        </h1>
        
        <p className="text-base md:text-xl text-slate-600 max-w-xl mx-auto font-medium mb-12">
          {dict.home.heroDesc}
        </p>

        {!isTauri && (
          <div className="max-w-md mx-auto mb-10 p-4 bg-amber-100 border-2 border-amber-500 rounded-xl text-amber-800 text-sm font-semibold flex flex-col items-center gap-2 shadow-[3px_3px_0px_rgba(180,83,9,0.2)]">
            <span className="text-base">Web Mode Detected</span>
            <p className="text-center font-normal text-amber-700">
              The Tauri backend is not connected. Showing fallback data.
            </p>
          </div>
        )}

        <div className="max-w-2xl mx-auto bg-elmore-board p-6 rounded-2xl border-4 border-elmore-dark shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] text-white relative mb-16">
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-500"></div>
          
          <div className="font-fredoka border-b-2 border-dashed border-green-700/60 pb-3 mb-6 flex justify-around text-center fiji:flex-row fiji:justify-around usa:pb-4 china:pb-6">
            <div>
              <p className="text-xs uppercase text-green-300 tracking-widest font-bold mb-1">{dict.home.enrolledStudents}</p>
              <p className="text-3xl md:text-5xl font-bold text-elmore-yellow drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                {stats.students}
              </p>
            </div>
            
            <div className="border-l border-green-700/60"></div>
            
            <div>
              <p className="text-xs uppercase text-green-300 tracking-widest font-bold mb-1">{dict.home.activeClubs}</p>
              <p className="text-3xl md:text-5xl font-bold text-elmore-green drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                {stats.clubs}
              </p>
            </div>
          </div>
          
          <div className="text-sm md:text-base font-medium text-green-100 italic bg-green-900/40 py-2.5 px-4 rounded-xl border border-green-800">
            {dict.home.notice}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fiji:gap-6 usa:gap-8 china:gap-12 mt-12 mb-20 max-w-5xl mx-auto px-4">
          <div className="bg-white p-6 rounded-2xl cartoon-shadow-pink hover:-translate-y-1 transition-transform flex flex-col justify-between items-center text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-fredoka font-bold text-elmore-dark mb-2">{dict.home.newStudentTitle}</h2>
            <p className="text-sm font-semibold text-slate-500 mb-6">
              {dict.home.newStudentDesc}
            </p>
            <Link 
              href={`/${locale}/register`}
              className="w-full bg-elmore-pink text-white font-fredoka font-bold py-3 rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90 block"
            >
              {dict.home.enrollBtn}
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl cartoon-shadow-sky hover:-translate-y-1 transition-transform flex flex-col justify-between items-center text-center">
            <div className="text-5xl mb-4">🎒</div>
            <h2 className="text-xl font-fredoka font-bold text-elmore-dark mb-2">{dict.home.currentStudentTitle}</h2>
            <p className="text-sm font-semibold text-slate-500 mb-6">
              {dict.home.currentStudentDesc}
            </p>
            <Link 
              href={session ? `/${locale}/dashboard` : `/${locale}/login`}
              className="w-full bg-elmore-sky text-white font-fredoka font-bold py-3 rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90 block"
            >
              {session ? dict.home.hallwayBtn : dict.home.loginBtn}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
