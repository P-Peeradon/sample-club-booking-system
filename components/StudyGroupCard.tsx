import React from 'react';
import type { Dictionary } from '@/lib/dictionaries';
import { StudyGroup } from '@/lib/types';

export default function StudyGroupCard({
  group,
  dict
}: {
  group: StudyGroup;
  dict: Dictionary;
}) {
  return (
    <div className="bg-white rounded-2xl border-4 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] p-4 flex flex-col gap-2">
      <h3 className="text-xl font-bold text-elmore-dark font-fredoka truncate">{group.name}</h3>
      <div className="flex justify-between text-sm font-bold text-slate-600">
        <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-300 truncate">📖 {group.subject}</span>
        <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-300">🚪 {group.classroom}</span>
      </div>
      <div className="mt-2 text-xs font-bold text-slate-400">{dict.study_groups.createdBy} {group.creator_name || group.created_by}</div>
    </div>
  );
}
