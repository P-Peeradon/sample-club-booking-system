'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Club } from '@/lib/types';
import type { Locale } from '@/lib/app-config';
import type { Dictionary } from \'@/lib/dictionaries\';

export default function ClubCard({
  club,
  isMember,
  isSelected,
  locale,
  dict,
}: {
  club: Club;
  isMember: boolean;
  isSelected: boolean;
  locale?: Locale;
  dict?: Dictionary;
}) {
  const handleJoinLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if ((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
      // Tauri IPC
      await invoke('toggle_club_membership', { clubId: club.id })
      console.log('Tauri IPC: toggle membership');
    } else {
      console.log('Web mock: toggle membership');
    }
  };

  return (
    <div
      className={`p-5 bg-white rounded-2xl border-3 transition-all relative ${
        isSelected
          ? 'border-elmore-sky bg-[#f7fbff] shadow-[4px_4px_0px_0px_var(--elmore-sky)] scale-[1.01]'
          : 'border-elmore-dark shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] hover:-translate-y-0.5'
      }`}
    >
      {/* Club Header */}
      <div className="flex justify-between items-start gap-3 flex-col fiji:flex-row usa:flex-row china:flex-row">
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
        
        <form onSubmit={handleJoinLeave}>
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
}
