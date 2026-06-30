import React from 'react';
import Image from 'next/image';
import ReviewClubButtons from './ReviewClubButtons';
import { Club } from '@/lib/types';
import type { Locale } from '@/lib/app-config';
import type { Dictionary } from '@/lib/dictionaries';

export default function PendingClubCard({
  club,
  presidentName,
  dict,
  locale
}: {
  club: Club;
  presidentName: string;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="p-4 bg-white rounded-2xl border-3 border-elmore-dark shadow-[3px_3px_0px_rgba(30,41,59,1)] flex flex-col fiji:flex-row usa:flex-row china:flex-row items-start fiji:items-center justify-between gap-4">
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
            {dict.club.proposedBy}: <span className="text-elmore-blue">{presidentName}</span>
          </div>
        </div>
      </div>
      
      <div className="w-full fiji:w-auto usa:w-auto china:w-auto pt-4 fiji:pt-0 usa:pt-0 china:pt-0 border-t-2 border-slate-100 fiji:border-0 usa:border-0 china:border-0">
        <ReviewClubButtons clubId={club.id} />
      </div>
    </div>
  );
}
