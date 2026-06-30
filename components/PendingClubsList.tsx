'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ReviewClubButtons from './ReviewClubButtons';
import { invoke } from '@tauri-apps/api/core';

interface Club {
  id: number;
  name: string;
  category: string;
  icon: string;
  description: string;
}

export default function PendingClubsList() {
  const [pendingClubs, setPendingClubs] = useState<Club[]>([]);
  const [presidentMap, setPresidentMap] = useState<Record<number, string>>({});

  useEffect(() => {
    // For Tauri mock/fallback
    if ((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
      invoke<Club[]>('get_pending_clubs').then(setPendingClubs).catch(console.error);
    } else {
      setPendingClubs([
        { id: 99, name: 'Sample Pending Club', category: 'Social', icon: '❓', description: 'Just a mock pending club for UI testing.' }
      ]);
      setPresidentMap({ 99: 'Darwin Watterson' });
    }
  }, []);

  if (pendingClubs.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center gap-3 bg-red-500 text-white p-3 rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)]">
        <span className="text-2xl">🚨</span>
        <h2 className="text-xl font-fredoka font-bold tracking-wide uppercase">Admin Action Required: Pending Clubs</h2>
      </div>

      <div className="flex flex-col gap-4">
        {pendingClubs.map((club) => (
          <div key={club.id} className="p-4 bg-white rounded-2xl border-3 border-elmore-dark shadow-[3px_3px_0px_rgba(30,41,59,1)] flex flex-col fiji:flex-row usa:flex-row china:flex-row items-start fiji:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 w-full">
              <div className="w-14 h-14 shrink-0 bg-slate-100 rounded-xl border-2 border-elmore-dark flex items-center justify-center text-2xl overflow-hidden">
                {club.icon.startsWith('/') ? (
                  <Image src={club.icon} alt={club.name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  club.icon
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-elmore-dark leading-tight">{club.name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-500 w-fit">
                    {club.category}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium line-clamp-1">{club.description}</p>
                <div className="text-xs font-semibold text-slate-400 mt-1">
                  Proposed by: <span className="text-elmore-blue">{presidentMap[club.id] || 'Unknown'}</span>
                </div>
              </div>
            </div>
            
            <ReviewClubButtons clubId={club.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
