'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { invoke } from '@tauri-apps/api/core';
import GlobalSettingsSwitcher from './GlobalSettingsSwitcher';
import type { Locale, Timezone } from '@/lib/app-config';
import type { Dictionary } from '@/lib/dictionaries';
import { AdvocacyReq, Session } from '@/lib/types';



const WEB_FALLBACK_REQUESTS = [
  { 
    id: 1, 
    student_id: 'EH-2024001', 
    request_type: 'Problem', 
    title: 'Test Request', 
    description: 'Web mode fallback data', 
    status: 'Pending', 
    admin_response: null, 
    resolved_by: null, 
    revocation_reason: null, 
    created_at: new Date().toISOString() 
  }
];

export default function AdvocacyDashboard({
  dict,
  locale,
  timezone,
  pathname,
  isTauri: initialIsTauri
}: {
  dict: Dictionary;
  locale: Locale;
  timezone: Timezone;
  pathname: string;
  isTauri?: boolean;
}) {
  
  const [session] = useState<Session>(() => ({ student_id: 'EH-2024001', full_name: 'Gumball Watterson', avatar: 'gumball_blue_cat' }));
  const [requests, setRequests] = useState<AdvocacyReq[]>(WEB_FALLBACK_REQUESTS);
  const [form, setForm] = useState({ type: 'Problem', title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isTauri] = useState(() => typeof window !== 'undefined' && !!(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
  const [adminResponses, setAdminResponses] = useState<Record<number, string>>({});
  const [revocationReasons, setRevocationReasons] = useState<Record<number, string>>({});

  const fetchRequestsTauri = useCallback(async () => {
    try {
      const data = await invoke<AdvocacyReq[]>('get_advocacy_requests', { studentId: session.student_id });
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  }, [session.student_id]);

  useEffect(() => {
    if (isTauri === null) return; // Wait until isTauri is determined

    if (isTauri) {
      fetchRequestsTauri();
    } else {
      setRequests(WEB_FALLBACK_REQUESTS);
    }
  }, [isTauri, fetchRequestsTauri]);

  if (!session) return <div className="p-10 text-center font-fredoka text-xl">Loading advocacy center...</div>;

  const isAnais = session.student_id === 'EH-2024003';
  const isGumballOrDarwin = session.student_id === 'EH-2024001' || session.student_id === 'EH-2024002';
  const isAdmin = isAnais || isGumballOrDarwin;

  const refreshRequests = async () => {
    if (isTauri) {
      await fetchRequestsTauri();
    } else {
      const res = await fetch(`/api/advocacy${isAdmin ? '?view=admin' : ''}`);
      if (res.ok) {
        setRequests(await res.json());
      }
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (isTauri) {
      await invoke('submit_advocacy_request', {
        studentId: session.student_id,
        requestType: form.type,
        title: form.title,
        description: form.description
      });
      setForm({ type: 'Problem', title: '', description: '' });
      await refreshRequests();
    } else {
      const res = await fetch('/api/advocacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_type: form.type, title: form.title, description: form.description }),
      });
      if (res.ok) {
        setForm({ type: 'Problem', title: '', description: '' });
        await refreshRequests();
      }
    }
    setSubmitting(false);
  };

  const handleAdminAction = async (id: number, action: string) => {
    const adminResponse = (action === 'Resolve' || action === 'Reject') ? (adminResponses[id] || '') : null;
    const revocationReason = action === 'Revoke' ? (revocationReasons[id] || '') : null;

    if (isTauri) {
      await invoke('resolve_advocacy_request', {
        requestId: id,
        adminId: session.student_id,
        action,
        adminResponse,
        revocationReason
      });
      await refreshRequests();
    } else {
      const payload: Record<string, unknown> = { request_id: id, action };
      if (adminResponse) payload.admin_response = adminResponse;
      if (revocationReason) payload.revocation_reason = revocationReason;

      const res = await fetch('/api/advocacy/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        await refreshRequests();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    }
  };

  // Helper for formatting date with timezone
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  };
  

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-elmore-blue border-b-4 border-elmore-dark p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/dashboard`} className="text-white hover:text-elmore-yellow transition-colors">
              <span className="text-2xl font-bold">←</span>
            </Link>
            <h1 className="text-3xl font-fredoka font-extrabold text-white tracking-wide uppercase drop-shadow-md">
              {dict.advocacy.header}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <GlobalSettingsSwitcher dict={dict} currentLocale={locale} currentTimezone={timezone} currentPathname={pathname} />
            <Link href={`/${locale}/advocacy/study-group`} className="px-4 py-2 bg-elmore-yellow text-elmore-dark font-bold font-fredoka rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90">
              {dict.advocacy.studyGroupsBtn}
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl py-8 px-4 flex flex-col gap-8">
        
        {/* Intro */}
        <div className="bg-white p-6 rounded-2xl border-4 border-elmore-dark shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] flex gap-6 items-center">
          <div className="text-7xl">🐰</div>
          <div>
            <h2 className="text-2xl font-fredoka font-bold text-elmore-dark mb-2">{dict.advocacy.welcomeTitle}</h2>
            <p className="text-slate-600 font-semibold leading-relaxed">
              {dict.advocacy.welcomeDesc}
            </p>
          </div>
        </div>

        {/* Student View (Form) */}
        {!isAdmin && (
          <div className="bg-white p-6 rounded-2xl border-4 border-elmore-dark shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]">
            <h3 className="text-xl font-fredoka font-bold text-elmore-dark mb-4 border-b-2 border-dashed pb-2">{dict.advocacy.submitRequest}</h3>
            <form onSubmit={submitRequest} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{dict.advocacy.typeLabel}</label>
                <select 
                  title="Select Request Type"
                  className="w-full p-3 bg-slate-100 rounded-xl border-2 border-slate-300 font-bold focus:border-elmore-blue focus:outline-none"
                  value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
                >
                  <option value="Problem">{dict.advocacy.typeProblem}</option>
                  <option value="Guidance">{dict.advocacy.typeGuidance}</option>
                  <option value="Study Group">{dict.advocacy.typeGroup}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{dict.advocacy.titleLabel}</label>
                <input 
                  type="text" required placeholder={dict.advocacy.titlePlaceholder}
                  className="w-full p-3 bg-slate-100 rounded-xl border-2 border-slate-300 font-bold focus:border-elmore-blue focus:outline-none"
                  value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{dict.advocacy.descLabel}</label>
                <textarea 
                  required placeholder={dict.advocacy.descPlaceholder} rows={4}
                  className="w-full p-3 bg-slate-100 rounded-xl border-2 border-slate-300 font-bold focus:border-elmore-blue focus:outline-none"
                  value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
              <button 
                disabled={submitting}
                className="self-end px-6 py-3 bg-elmore-green text-white font-fredoka font-bold rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90 disabled:opacity-50"
              >
                {submitting ? dict.advocacy.btnSubmitting : dict.advocacy.btnSubmit}
              </button>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div>
          <h3 className="text-2xl font-fredoka font-bold text-elmore-dark mb-6">
            {isAdmin ? dict.advocacy.allRequests : dict.advocacy.yourRequests}
          </h3>
          
          <div className="flex flex-col gap-6">
            {requests.length === 0 && (
              <div className="text-center p-8 bg-slate-200 rounded-2xl border-4 border-dashed border-slate-300 text-slate-500 font-bold">
                {dict.advocacy.noRequests}
              </div>
            )}
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-2xl border-4 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] overflow-hidden">
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
                      {dict.advocacy.requestedBy}: {req.student_name} ({req.student_id})
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
                        value={adminResponses[req.id] || ''}
                        onChange={(e) => setAdminResponses({...adminResponses, [req.id]: e.target.value})}
                      />
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => handleAdminAction(req.id, 'Reject')} className="px-4 py-2 bg-elmore-red text-white font-bold rounded-lg border-2 border-elmore-dark hover:bg-opacity-90">
                          {dict.advocacy.adminActionReject}
                        </button>
                        <button onClick={() => handleAdminAction(req.id, 'Resolve')} className="px-4 py-2 bg-elmore-green text-white font-bold rounded-lg border-2 border-elmore-dark hover:bg-opacity-90">
                          {dict.advocacy.adminActionResolve}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions for Gumball/Darwin */}
                  {isAdmin && isGumballOrDarwin && (req.status === 'Resolved' || req.status === 'Rejected') && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed flex flex-col gap-3">
                      <label className="text-xs font-bold text-orange-600">{dict.advocacy.vetoLabel}</label>
                      <textarea
                        placeholder={dict.advocacy.vetoPlaceholder}
                        className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-300 font-bold focus:border-orange-500 focus:outline-none"
                        value={revocationReasons[req.id] || ''}
                        onChange={(e) => setRevocationReasons({...revocationReasons, [req.id]: e.target.value})}
                      />
                      <button onClick={() => handleAdminAction(req.id, 'Revoke')} className="self-end px-4 py-2 bg-orange-500 text-white font-bold rounded-lg border-2 border-elmore-dark hover:bg-opacity-90">
                        {dict.advocacy.btnRevoke}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
