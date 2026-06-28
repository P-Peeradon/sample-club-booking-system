'use client';

import { useState } from 'react';
import Link from 'next/link';
import GlobalSettingsSwitcher from './GlobalSettingsSwitcher';
import type { Locale, Timezone } from '@/lib/app-config';

interface StudyGroup {
  id: number;
  name: string;
  subject: string;
  classroom: string;
  created_by: string;
  created_at: string;
  creator_name?: string;
}

interface Workshop {
  id: number;
  title: string;
  description: string;
  date: string;
  created_by: string;
  created_at: string;
}

export default function StudyGroupDashboard({
  session,
  initialGroups,
  initialWorkshops,
  dict,
  locale,
  timezone,
  pathname
}: {
  session: any;
  initialGroups: StudyGroup[];
  initialWorkshops: Workshop[];
  dict: any;
  locale: Locale;
  timezone: Timezone;
  pathname: string;
}) {
  const [groups, setGroups] = useState<StudyGroup[]>(initialGroups);
  const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops);
  const [search, setSearch] = useState('');
  
  const [groupForm, setGroupForm] = useState({ name: '', subject: '', classroom: '' });
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [workshopForm, setWorkshopForm] = useState({ title: '', description: '', date: '' });
  const [creatingWorkshop, setCreatingWorkshop] = useState(false);

  const isAdmin = ['EH-2024001', 'EH-2024002', 'EH-2024003'].includes(session.student_id);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/study-groups?search=${encodeURIComponent(search)}`);
    if (res.ok) {
      setGroups(await res.json());
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingGroup(true);
    const res = await fetch('/api/study-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupForm),
    });
    if (res.ok) {
      setGroupForm({ name: '', subject: '', classroom: '' });
      const groupsRes = await fetch('/api/study-groups');
      if (groupsRes.ok) setGroups(await groupsRes.json());
    }
    setCreatingGroup(false);
  };

  const createWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingWorkshop(true);
    const res = await fetch('/api/workshops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workshopForm),
    });
    if (res.ok) {
      setWorkshopForm({ title: '', description: '', date: '' });
      const wRes = await fetch('/api/workshops');
      if (wRes.ok) setWorkshops(await wRes.json());
    }
    setCreatingWorkshop(false);
  };

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
            <Link href={`/${locale}/advocacy`} className="text-white hover:text-elmore-yellow transition-colors">
              <span className="text-2xl font-bold">←</span>
            </Link>
            <h1 className="text-3xl font-fredoka font-extrabold text-white tracking-wide uppercase drop-shadow-md">
              {dict.study_groups.header}
            </h1>
          </div>
          <GlobalSettingsSwitcher dict={dict} currentLocale={locale} currentTimezone={timezone} currentPathname={pathname} />
        </div>
      </header>

      <main className="container mx-auto max-w-6xl py-8 px-4 grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Study Groups */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <div className="bg-white p-6 rounded-2xl border-4 border-elmore-dark shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]">
            <h2 className="text-2xl font-fredoka font-bold text-elmore-dark mb-4 border-b-2 border-dashed pb-2">{dict.study_groups.findGroup}</h2>
            <form onSubmit={handleSearch} className="flex gap-4">
              <input 
                type="text" 
                placeholder={dict.study_groups.searchPlaceholder}
                className="flex-1 p-3 bg-slate-100 rounded-xl border-2 border-slate-300 font-bold focus:border-elmore-blue focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="px-6 py-3 bg-elmore-sky text-white font-fredoka font-bold rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90">
                {dict.study_groups.btnSearch}
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {groups.length === 0 && (
              <div className="col-span-2 text-center p-8 bg-slate-200 rounded-2xl border-4 border-dashed border-slate-300 text-slate-500 font-bold">
                {dict.study_groups.noGroups}
              </div>
            )}
            {groups.map(g => (
              <div key={g.id} className="bg-white rounded-2xl border-4 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] p-4 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-elmore-dark font-fredoka truncate">{g.name}</h3>
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-300 truncate">📖 {g.subject}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-300">🚪 {g.classroom}</span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-400">{dict.study_groups.createdBy} {g.creator_name || g.created_by}</div>
              </div>
            ))}
          </div>

          {/* Create Group Form */}
          <div className="bg-elmore-yellow/20 p-6 rounded-2xl border-4 border-elmore-yellow border-dashed">
            <h3 className="text-xl font-fredoka font-bold text-elmore-dark mb-4">{dict.study_groups.startGroup}</h3>
            <form onSubmit={createGroup} className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input required type="text" placeholder={dict.study_groups.namePlaceholder} className="p-3 rounded-xl border-2 border-slate-300 font-bold" value={groupForm.name} onChange={(e) => setGroupForm({...groupForm, name: e.target.value})} />
                <input required type="text" placeholder={dict.study_groups.subjectPlaceholder} className="p-3 rounded-xl border-2 border-slate-300 font-bold" value={groupForm.subject} onChange={(e) => setGroupForm({...groupForm, subject: e.target.value})} />
              </div>
              <input required type="text" placeholder={dict.study_groups.classPlaceholder} className="p-3 rounded-xl border-2 border-slate-300 font-bold" value={groupForm.classroom} onChange={(e) => setGroupForm({...groupForm, classroom: e.target.value})} />
              <button disabled={creatingGroup} className="self-start px-6 py-3 bg-elmore-green text-white font-fredoka font-bold rounded-xl border-2 border-elmore-dark cartoon-shadow-btn hover:bg-opacity-90 disabled:opacity-50">
                {dict.study_groups.btnCreateGroup}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Workshops */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          <div className="bg-white rounded-2xl border-4 border-elmore-dark shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] overflow-hidden">
            <div className="bg-elmore-pink p-4 border-b-4 border-elmore-dark">
              <h2 className="text-xl font-fredoka font-bold text-white text-center tracking-wide">{dict.study_groups.workshopsTitle}</h2>
            </div>
            
            <div className="p-4 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
              {workshops.length === 0 && (
                <div className="text-center p-4 text-slate-500 font-bold text-sm border-2 border-dashed rounded-xl">{dict.study_groups.noWorkshops}</div>
              )}
              {workshops.map(w => (
                <div key={w.id} className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 shadow-sm flex flex-col gap-2">
                  <h4 className="font-bold text-elmore-dark text-lg">{w.title}</h4>
                  <div className="text-xs font-bold text-elmore-pink bg-elmore-pink/10 px-2 py-1 rounded self-start border border-elmore-pink/20">
                    📅 {formatDate(w.date)}
                  </div>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed">{w.description}</p>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-elmore-purple/10 p-5 rounded-2xl border-4 border-elmore-purple border-dashed">
              <h3 className="font-fredoka font-bold text-elmore-purple mb-3">{dict.study_groups.adminPost}</h3>
              <form onSubmit={createWorkshop} className="flex flex-col gap-3">
                <input required type="text" placeholder={dict.study_groups.wsTitlePlaceholder} className="p-2 rounded-xl border-2 border-elmore-purple/30 font-bold text-sm" value={workshopForm.title} onChange={(e) => setWorkshopForm({...workshopForm, title: e.target.value})} />
                <textarea required placeholder={dict.study_groups.wsDescPlaceholder} rows={3} className="p-2 rounded-xl border-2 border-elmore-purple/30 font-bold text-sm" value={workshopForm.description} onChange={(e) => setWorkshopForm({...workshopForm, description: e.target.value})} />
                <input required type="datetime-local" className="p-2 rounded-xl border-2 border-elmore-purple/30 font-bold text-sm" value={workshopForm.date} onChange={(e) => setWorkshopForm({...workshopForm, date: e.target.value})} />
                <button disabled={creatingWorkshop} className="mt-2 bg-elmore-purple text-white font-bold py-2 rounded-xl border-2 border-elmore-dark hover:bg-opacity-90 transition-colors">
                  {dict.study_groups.btnPostWorkshop}
                </button>
              </form>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
