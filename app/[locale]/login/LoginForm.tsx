'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/lib/dictionaries';
import { invoke } from '@tauri-apps/api/core';

export default function LoginForm({ locale, dict }: { locale: string, dict: Dictionary }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get('studentId') as string;
    const password = formData.get('password') as string;

    try {
      if ((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
        // await invoke('login_student', { studentId, password });
        console.log('Tauri IPC: login');
      } else {
        // Mock web login
        if (studentId !== 'EH-2024001' || password !== 'password123') {
          throw new Error('Invalid credentials (try EH-2024001 / password123)');
        }
        console.log('Web mock: login successful');
      }
      window.location.href = `/${locale}/dashboard`;
    } catch (err: unknown) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md fiji:max-w-md usa:max-w-lg china:max-w-xl bg-white rounded-3xl cartoon-shadow-sky relative overflow-hidden mt-8">
      
      {/* Banner tape detail */}
      <div className="absolute -top-1 left-8 w-20 h-7 bg-elmore-yellow opacity-85 border-x-2 border-b-2 border-elmore-dark transform rotate-3"></div>
      <div className="absolute -top-1 right-10 w-24 h-8 bg-elmore-pink opacity-85 border-x-2 border-b-2 border-elmore-dark transform -rotate-6"></div>

      {/* Card Header */}
      <div className="p-6 md:p-8 border-b-3 border-elmore-dark bg-elmore-sky text-white flex justify-between items-center mt-2">
        <div>
          <h1 className="text-3xl font-fredoka font-bold tracking-tight">Access Lockers</h1>
          <p className="text-blue-100 text-sm font-semibold mt-1">Unlock your student club locker</p>
        </div>
        <Link 
          href={`/${locale}`}
          className="px-4 py-2 bg-white text-elmore-sky font-fredoka font-bold text-sm rounded-xl cartoon-shadow-btn hover:bg-zinc-50"
        >
          ← Gate
        </Link>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8 notebook-paper flex flex-col items-center">
        
        {/* Combination Lock Dial Graphic */}
        <div className="relative w-28 h-28 rounded-full bg-zinc-800 border-4 border-elmore-dark flex items-center justify-center shadow-[4px_4px_0px_rgba(30,41,59,0.15)] mb-6 select-none">
          <div className="absolute inset-2 rounded-full border border-dashed border-zinc-500"></div>
          <div className="w-16 h-16 rounded-full bg-zinc-700 border-2 border-elmore-dark flex items-center justify-center text-white font-fredoka font-bold text-lg cursor-pointer hover:rotate-45 transition-transform duration-300">
            <span className="text-zinc-400 font-normal text-xs absolute -top-1">0</span>
            <span className="text-zinc-400 font-normal text-xs absolute -right-0.5">10</span>
            <span className="text-zinc-400 font-normal text-xs absolute -bottom-1">20</span>
            <span className="text-zinc-400 font-normal text-xs absolute -left-0.5">30</span>
            🔒
          </div>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-elmore-orange"></div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 text-elmore-dark w-full">
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-bold border-2 border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm" htmlFor="studentId">Email or Student ID</label>
            <input 
              id="studentId"
              name="studentId" 
              type="text" 
              required 
              placeholder="e.g. EH-2024001"
              className="bg-white border-3 border-elmore-dark rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-elmore-sky focus:ring-4 focus:ring-elmore-sky/20 transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm" htmlFor="password">Locker Code (Password)</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="bg-white border-3 border-elmore-dark rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-elmore-sky focus:ring-4 focus:ring-elmore-sky/20 transition-all placeholder:text-slate-300"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-elmore-pink text-white font-fredoka font-bold text-xl py-3 rounded-xl border-3 border-elmore-dark shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:bg-opacity-90 hover:translate-y-1 active:shadow-none transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:shadow-[4px_4px_0px_rgba(30,41,59,1)]"
          >
            {loading ? 'Unlocking Locker...' : 'Open Locker! 🔓'}
          </button>

          <p className="text-center text-sm font-bold text-slate-500 mt-4">
            New student? <Link href={`/${locale}/register`} className="text-elmore-blue hover:underline">Register at Office (Sign Up)</Link>
          </p>
        </form>

      </div>
    </div>
  );
}
