'use client';

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Club } from '@/lib/types';
import PendingClubCard from './PendingClubCard';
import type { Locale } from '@/lib/app-config';
import type { Dictionary } from '@/lib/dictionaries';

export default function PendingClubsList({ dict, locale }: { dict: Dictionary, locale: Locale }) {
  const [isTauri] = useState(() => typeof window !== 'undefined' && !!(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
  const [pendingClubs, setPendingClubs] = useState<Club[]>(() => {
    return (typeof window !== 'undefined' && !!(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
      ? []
      : [{ id: 99, name: 'Sample Pending Club', category: 'Social', icon: '❓', description: 'Just a mock pending club for UI testing.', member_count: 0 }];
  });
  const [presidentMap, setPresidentMap] = useState<Record<number, string>>({ 99: 'Darwin Watterson' });

  useEffect(() => {
    // For Tauri mock/fallback
    if (isTauri) {
      invoke<Club[]>('get_pending_clubs').then(setPendingClubs).catch(console.error);
    }
  }, [isTauri]);

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
          <PendingClubCard key={club.id} club={club} presidentName={presidentMap[club.id] || 'Unknown'} dict={dict} locale={locale} />
        ))}
      </div>
    </div>
  );
}
