import React from 'react';
import { Workshop } from '@/lib/types';

export default function WorkshopCard({
  workshop,
  formatDate
}: {
  workshop: Workshop;
  formatDate: (dateString: string) => string;
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
