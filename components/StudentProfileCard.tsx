import React from 'react';

const AVATARS: { [id: string]: { emoji: string; bg: string } } = {
  gumball: { emoji: '🐱', bg: 'bg-[#4ba3e3]' },
  darwin: { emoji: '🐠', bg: 'bg-[#ff7e36]' },
  anais: { emoji: '🐰', bg: 'bg-[#ff76b4]' },
  penny: { emoji: '🦌', bg: 'bg-[#ffe15d]' },
  carrie: { emoji: '👻', bg: 'bg-indigo-300' },
  bobert: { emoji: '🤖', bg: 'bg-slate-400' },
  banana: { emoji: '🍌', bg: 'bg-[#ffe15d]' },
};

export const renderAvatar = (avatarId: string, sizeClass = 'w-12 h-12 text-2xl') => {
  const avatarInfo = AVATARS[avatarId] || { emoji: '👤', bg: 'bg-slate-200' };
  return (
    <div className={`${sizeClass} rounded-xl border-2 border-elmore-dark flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)] ${avatarInfo.bg}`}>
      {avatarInfo.emoji}
    </div>
  );
};

export default function StudentProfileCard({
  session,
  membershipsCount,
  dict,
}: {
  session: any;
  membershipsCount: number;
  dict: any;
}) {
  return (
    <div className="bg-white rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] overflow-hidden relative">
      {/* Header Strip */}
      <div className="bg-elmore-orange p-3 border-b-3 border-elmore-dark text-white text-center font-fredoka font-bold tracking-wider text-sm">
        {dict.dashboard.idCardTitle}
      </div>
      
      <div className="p-6 flex flex-col items-center">
        {/* Photo placeholder with Gumball style */}
        <div className="mb-4 relative">
          {renderAvatar(session.avatar, 'w-24 h-24 text-5xl')}
          <div className="absolute -bottom-2 -right-2 bg-elmore-green text-white text-xs px-2 py-0.5 rounded-full border border-elmore-dark font-bold uppercase rotate-6">
            {dict.dashboard.statusActive}
          </div>
        </div>

        <h2 className="text-xl font-fredoka font-bold text-elmore-dark text-center">{session.full_name}</h2>
        <span className="text-xs text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full mt-1">
          {session.student_id}
        </span>

        <div className="w-full border-t border-dashed border-slate-200 my-4"></div>

        {/* Profile Details */}
        <div className="w-full text-sm font-semibold text-slate-600 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-slate-400">{dict.dashboard.classGrade}</span>
            <span className="text-elmore-dark font-bold">{session.year}nd Year (Grade {session.year + 6})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{dict.dashboard.homeroom}</span>
            <span className="text-elmore-dark font-bold">Room {session.room}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{dict.dashboard.email}</span>
            <span className="text-elmore-dark font-bold truncate max-w-45">{session.email}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-slate-400">{dict.dashboard.clubsJoined}</span>
            <span className="text-elmore-sky font-bold bg-elmore-sky/10 px-2 py-0.5 rounded-full border border-elmore-sky/20">
              {membershipsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
