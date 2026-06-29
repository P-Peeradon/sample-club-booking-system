import React from 'react';
import { Club, Member } from '@/lib/types';
import { renderAvatar } from './StudentProfileCard';

export default function ClubRoster({
  selectedClubDetails,
  selectedClubMembers,
  sessionUid,
}: {
  selectedClubDetails: Club | null;
  selectedClubMembers: Member[];
  sessionUid: string;
}) {
  return (
    <div className="sticky top-6 flex flex-col gap-6">
      <h2 className="text-2xl font-fredoka font-bold text-elmore-dark">Club Roster</h2>
      
      {selectedClubDetails ? (
        <div className="bg-white rounded-2xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)] overflow-hidden">
          
          {/* Roster Header */}
          <div className="bg-elmore-dark p-4 text-white flex items-center gap-2">
            <span className="text-2xl">{selectedClubDetails.icon}</span>
            <div>
              <h3 className="font-fredoka font-bold text-sm tracking-tight truncate max-w-40">
                {selectedClubDetails.name}
              </h3>
              <p className="text-[10px] font-semibold text-slate-300">
                Roster • {selectedClubMembers.length} {selectedClubMembers.length === 1 ? 'Student' : 'Students'}
              </p>
            </div>
          </div>

          {/* Roster List */}
          <div className="p-4 flex flex-col gap-3 max-h-95 overflow-y-auto">
            {selectedClubMembers.length === 0 ? (
              <div className="py-6 text-center text-xs font-semibold text-slate-400">
                No members yet! Be the first to join this club.
              </div>
            ) : (
              selectedClubMembers.map((member) => (
                <div 
                  key={member.id} 
                  className={`p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 transition-colors ${
                    member.id === (sessionUid as any) ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200' : ''
                  }`}
                >
                  {renderAvatar(member.avatar, 'w-10 h-10 text-xl')}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-elmore-dark truncate max-w-27.5">
                        {member.name}
                      </h4>
                      {member.id === (sessionUid as any) && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-300 uppercase tracking-wide">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                      {member.student_id} • Year {member.year} • Room {member.room}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-100 border-3 border-dashed border-slate-300 rounded-2xl text-center shadow-[3px_3px_0px_rgba(0,0,0,0.05)] text-slate-400 flex flex-col items-center justify-center min-h-55">
          <span className="text-4xl mb-3">🗂️</span>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Roster Locker
          </p>
          <p className="text-[11px] font-semibold text-slate-400 max-w-40">
            Click on a club's title or details link to inspect the active member roster.
          </p>
        </div>
      )}
    </div>
  );
}
