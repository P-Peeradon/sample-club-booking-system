import React from 'react';
import { Workshop } from '@/lib/types';
import type { Locale } from '@/lib/app-config';
import type { Dictionary } from '@/lib/dictionaries';

export default function WorkshopCard({
  workshop,
  formatDate,
  dict,
  locale
}: {
  workshop: Workshop;
  formatDate: (dateString: string) => string;
  dict?: Dictionary;
  locale?: Locale;
}) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 shadow-sm flex flex-col gap-2">
      <h4 className="font-bold text-elmore-dark text-lg">{workshop.title}</h4>
      <div className="text-xs font-bold text-elmore-pink bg-elmore-pink/10 px-2 py-1 rounded self-start border border-elmore-pink/20">
        📅 {formatDate(workshop.date)}
      </div>
      <p className="text-sm font-semibold text-slate-600 leading-relaxed">{workshop.description}</p>
    </div>
  );
}
