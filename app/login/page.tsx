'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { loginStudent } from '../actions';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginStudent(null, formData);
      if (result && !result.success) {
        setError(result.error || 'Login failed.');
      }
    });
  };

  return (
    <main className="min-h-screen py-12 px-4 flex items-center justify-center bg-linear-to-b from-[#e6f4fe] to-[#f0f7ff]">
      <div className="w-full max-w-md bg-white rounded-3xl cartoon-shadow-sky relative overflow-hidden">
        
        {/* Banner tape detail */}
        <div className="absolute -top-1 left-8 w-20 h-7 bg-elmore-yellow opacity-85 border-x-2 border-b-2 border-elmore-dark transform rotate-3"></div>
        <div className="absolute -top-1 right-10 w-24 h-8 bg-elmore-pink opacity-85 border-x-2 border-b-2 border-elmore-dark transform -rotate-6"></div>

        {/* Card Header */}
        <div className="p-6 md:p-8 border-b-3 border-elmore-dark bg-elmore-sky text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-fredoka font-bold tracking-tight">Access Lockers</h1>
            <p className="text-blue-100 text-sm font-semibold mt-1">Unlock your student club locker</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-white text-elmore-sky font-fredoka font-bold text-sm rounded-xl cartoon-shadow-btn hover:bg-zinc-50"
          >
            ← Gate
          </Link>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8 notebook-paper flex flex-col items-center">
          
          {/* Combination Lock Dial Graphic */}
          <div className="relative w-28 h-28 rounded-full bg-zinc-800 border-4 border-elmore-dark flex items-center justify-center shadow-[4px_4px_0px_rgba(30,41,59,0.15)] mb-6 select-none">
            {/* Outer dial ticks */}
            <div className="absolute inset-2 rounded-full border border-dashed border-zinc-500"></div>
            {/* Center dial knob */}
            <div className="w-16 h-16 rounded-full bg-zinc-700 border-2 border-elmore-dark flex items-center justify-center text-white font-fredoka font-bold text-lg cursor-pointer hover:rotate-45 transition-transform duration-300">
              <span className="text-zinc-400 font-normal text-xs absolute -top-1">0</span>
              <span className="text-zinc-400 font-normal text-xs absolute -right-0.5">10</span>
              <span className="text-zinc-400 font-normal text-xs absolute -bottom-1">20</span>
              <span className="text-zinc-400 font-normal text-xs absolute -left-0.5">30</span>
              🔒
            </div>
            {/* Lock indicator arrow */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-elmore-orange"></div>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 text-sm font-semibold shadow-[2px_2px_0px_rgba(239,68,68,0.2)]">
                💥 {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="emailOrId" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">Email or Student ID</label>
              <input
                id="emailOrId"
                name="emailOrId"
                type="text"
                required
                placeholder="EH-XXXX or student@elmore.edu"
                className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-sky text-base font-semibold shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">Locker Code (Password)</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter locker code key"
                className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-sky text-base font-semibold shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
              />
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-elmore-sky text-white font-fredoka font-bold text-xl rounded-2xl cartoon-shadow-btn hover:bg-opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? 'Unlocking Locker...' : 'Open Locker! 🔓'}
              </button>

              <p className="text-center text-sm font-semibold text-slate-500">
                New student?{' '}
                <Link href="/register" className="text-elmore-pink hover:underline font-bold">
                  Register at Office (Sign Up)
                </Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}
