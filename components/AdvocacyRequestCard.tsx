import React from 'react';
import type { Dictionary } from '@/lib/dictionaries';
import { AdvocacyReq } from '@/lib/types';

export default function AdvocacyRequestCard({
  req,
  dict,
  isAdmin,
  isAnais,
  formatDate,
  onResolve,
  onReject,
  onRevoke
}: {
  req: AdvocacyReq;
  dict: Dictionary;
  isAdmin: boolean;
  isAnais: boolean;
  formatDate: (dateString: string) => string;
  onResolve: (id: number, response: string) => void;
  onReject: (id: number, response: string) => void;
  onRevoke: (id: number, reason: string) => void;
}) {
  const [response, setResponse] = React.useState('');
  const [revokeReason, setRevokeReason] = React.useState('');

  return (
    <div className="bg-white rounded-2xl border-4 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] overflow-hidden">
      <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex flex-col fiji:flex-row justify-between items-start fiji:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-elmore-dark text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            {req.request_type === 'Problem' ? dict.advocacy.typeProblem : req.request_type === 'Guidance' ? dict.advocacy.typeGuidance : dict.advocacy.typeGroup}
          </span>
          <h4 className="font-bold text-lg text-elmore-dark">{req.title}</h4>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`font-bold px-3 py-1 rounded-full border-2 text-sm ${
            req.status === 'Pending' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' :
            req.status === 'Resolved' ? 'bg-green-100 border-green-400 text-green-700' :
            req.status === 'Revoked' ? 'bg-orange-100 border-orange-400 text-orange-700' :
            'bg-red-100 border-red-400 text-red-700'
          }`}>
            {req.status === 'Pending' ? dict.advocacy.statusPending : req.status === 'Resolved' ? dict.advocacy.statusResolved : req.status === 'Rejected' ? dict.advocacy.statusRejected : dict.advocacy.statusRevoked}
          </div>
          <div className="text-xs text-slate-500 font-bold">{formatDate(req.created_at)}</div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-4">
        {isAdmin && (
          <div className="text-sm font-bold text-slate-500 border-b pb-2">
            {dict.advocacy.requestedBy}: {req.student_id}
          </div>
        )}
        
        <div className="text-slate-700 font-semibold">{req.description}</div>
        
        {/* Admin Response Area */}
        {(req.status === 'Resolved' || req.status === 'Rejected') && (
          <div className="bg-elmore-pink/10 p-4 rounded-xl border border-elmore-pink/30 mt-2">
            <div className="font-bold text-elmore-pink mb-1 flex items-center gap-2">
              {dict.advocacy.anaisResponse}
            </div>
            <div className="text-slate-700">{req.admin_response}</div>
          </div>
        )}

        {/* Revocation Area */}
        {req.status === 'Revoked' && (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-300 mt-2">
            <div className="font-bold text-orange-700 mb-1 flex items-center gap-2">
              {dict.advocacy.vetoTitle}
            </div>
            <div className="text-slate-700">{req.revocation_reason}</div>
            <div className="text-xs text-orange-500 font-bold mt-2">{dict.advocacy.revokedBy} {req.resolved_by}</div>
          </div>
        )}

        {/* Actions for Anais */}
        {isAdmin && isAnais && req.status === 'Pending' && (
          <div className="mt-4 pt-4 border-t-2 border-dashed flex flex-col gap-3">
            <textarea
              className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-300 font-bold focus:border-elmore-pink focus:outline-none"
              placeholder={dict.advocacy.anaisPlaceholder}
              rows={2}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
            <div className="flex gap-2 self-end">
              <button 
                onClick={() => onReject(req.id, response)}
                className="px-4 py-2 bg-red-400 text-white font-bold rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90"
              >
                {dict.advocacy.btnReject}
              </button>
              <button 
                onClick={() => onResolve(req.id, response)}
                className="px-4 py-2 bg-elmore-green text-white font-bold rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90"
              >
                {dict.advocacy.btnResolve}
              </button>
            </div>
          </div>
        )}

        {/* Veto Actions for Gumball/Darwin */}
        {isAdmin && !isAnais && req.status === 'Resolved' && (
          <div className="mt-4 pt-4 border-t-2 border-dashed flex flex-col gap-3">
            <textarea
              className="w-full p-3 bg-orange-50 rounded-xl border-2 border-orange-300 font-bold focus:border-orange-500 focus:outline-none text-orange-900"
              placeholder={dict.advocacy.vetoReasonPlaceholder}
              rows={2}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
            <button 
              onClick={() => onRevoke(req.id, revokeReason)}
              className="self-end px-4 py-2 bg-orange-500 text-white font-bold rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90"
            >
              {dict.advocacy.btnVeto}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
