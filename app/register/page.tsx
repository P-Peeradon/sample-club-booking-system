'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { registerStudent } from '../actions';

const AVATARS = [
  { id: 'gumball', name: 'Gumball', emoji: '🐱', bg: 'bg-[#4ba3e3]', text: 'text-white', desc: 'The blue cat with questionable plans' },
  { id: 'darwin', name: 'Darwin', emoji: '🐠', bg: 'bg-[#ff7e36]', text: 'text-white', desc: 'The golden fish who grew legs' },
  { id: 'anais', name: 'Anais', emoji: '🐰', bg: 'bg-[#ff76b4]', text: 'text-white', desc: 'The pink genius bunny sister' },
  { id: 'penny', name: 'Penny', emoji: '🦌', bg: 'bg-[#ffe15d]', text: 'text-elmore-dark', desc: 'The shape-shifting fairy peanut' },
  { id: 'carrie', name: 'Carrie', emoji: '👻', bg: 'bg-indigo-300', text: 'text-indigo-950', desc: 'The punk-rock emo ghost girl' },
  { id: 'bobert', name: 'Bobert', emoji: '🤖', bg: 'bg-slate-400', text: 'text-white', desc: 'The high-tech school robot companion' },
  { id: 'banana', name: 'Banana Joe', emoji: '🍌', bg: 'bg-[#ffe15d]', text: 'text-elmore-dark', desc: 'The school comedian banana' },
];

export default function Register() {
  const [selectedAvatar, setSelectedAvatar] = useState('gumball');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('avatar', selectedAvatar);

    // Client-side validations
    const studentId = formData.get('studentId') as string;
    const studentIdRegex = /^EH-\d{7}$/;
    if (!studentIdRegex.test(studentId)) {
      setError('Student ID must follow the EH-XXXXXXX format (e.g., EH-0000001)');
      return;
    }

    const year = parseInt(formData.get('year') as string);
    if (isNaN(year) || year < 1 || year > 6) {
      setError('School Year must be between 1 and 6');
      return;
    }

    startTransition(async () => {
      const result = await registerStudent(null, formData);
      if (result && !result.success) {
        setError(result.error || 'Registration failed.');
      }
    });
  };

  return (
    <main className="min-h-screen py-12 px-4 flex items-center justify-center bg-linear-to-b from-[#e6f4fe] to-[#f0f7ff]">
      <div className="w-full max-w-4xl bg-white rounded-3xl cartoon-shadow-pink relative overflow-hidden">
        
        {/* Banner tape detail */}
        <div className="absolute -top-1 left-10 w-24 h-8 bg-elmore-yellow opacity-85 border-x-2 border-b-2 border-elmore-dark transform rotate-3"></div>
        <div className="absolute -top-1 right-12 w-20 h-7 bg-elmore-sky opacity-85 border-x-2 border-b-2 border-elmore-dark transform -rotate-6"></div>

        {/* Card Header */}
        <div className="p-6 md:p-8 border-b-3 border-elmore-dark bg-elmore-pink text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-fredoka font-bold tracking-tight">Student Enrollment</h1>
            <p className="text-pink-100 text-sm font-semibold mt-1">Register for the Elmore High School Student Portal</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-white text-elmore-pink font-fredoka font-bold text-sm rounded-xl cartoon-shadow-btn hover:bg-zinc-50"
          >
            ← Back
          </Link>
        </div>

        {/* Notebook-Style Form Content */}
        <form onSubmit={handleSubmit} className="p-6 md:p-10 notebook-paper grid md:grid-cols-12 gap-8">
          
          {/* Form Fields Column */}
          <div className="md:col-span-7 flex flex-col gap-5">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 text-sm font-semibold shadow-[2px_2px_0px_rgba(239,68,68,0.2)]">
                💥 {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Richard Watterson"
                className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-pink text-base font-semibold shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="studentId" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">Student ID</label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  placeholder="EH-2024001"
                  className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-pink text-base font-semibold uppercase shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="year" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">School Year</label>
                <select
                  id="year"
                  name="year"
                  required
                  className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-pink text-base font-semibold shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
                >
                  <option value="1">1st Year (Anais)</option>
                  <option value="2" defaultValue={2}>2nd Year (Gumball)</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                  <option value="6">6th Year</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="room" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">Homeroom</label>
                <input
                  id="room"
                  name="room"
                  type="text"
                  required
                  placeholder="e.g. 12B"
                  className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-pink text-base font-semibold shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="student@elmore.edu"
                  className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-pink text-base font-semibold shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-bold text-elmore-dark uppercase tracking-wider">Locker Code (Password)</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter secret locker key"
                className="w-full px-4 py-3 border-2 border-elmore-dark rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-elmore-pink text-base font-semibold shadow-[2px_2px_0px_rgba(30,41,59,0.1)]"
              />
            </div>
          </div>

          {/* Avatar Selection Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-sm font-bold text-elmore-dark uppercase tracking-wider block mb-3">Choose Your Avatar</span>
              
              <div className="grid grid-cols-4 gap-3 mb-6">
                {AVATARS.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedAvatar(char.id)}
                    className={`h-16 w-16 rounded-xl flex items-center justify-center text-3xl transition-all border-2 border-elmore-dark relative ${char.bg} ${
                      selectedAvatar === char.id 
                        ? 'scale-110 ring-4 ring-elmore-pink shadow-[3px_3px_0px_0px_rgba(30,41,59,1)]' 
                        : 'opacity-70 hover:opacity-100 hover:scale-105 shadow-[1px_1px_0px_0px_rgba(30,41,59,1)]'
                    }`}
                    title={char.name}
                  >
                    {char.emoji}
                    {selectedAvatar === char.id && (
                      <span className="absolute -top-2 -right-2 bg-elmore-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border border-elmore-dark font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Character Bio Bubble */}
              <div className="p-4 bg-elmore-sky-light border-2 border-elmore-dark rounded-2xl relative shadow-[3px_3px_0px_0px_rgba(30,41,59,0.1)]">
                <div className="absolute top-4 -left-2 w-4 h-4 bg-elmore-sky-light border-l-2 border-b-2 border-elmore-dark transform rotate-45"></div>
                
                <h4 className="font-fredoka font-bold text-elmore-sky text-lg">
                  {AVATARS.find(a => a.id === selectedAvatar)?.name}
                </h4>
                <p className="text-slate-600 text-sm font-semibold mt-1">
                  {AVATARS.find(a => a.id === selectedAvatar)?.desc}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-elmore-pink text-white font-fredoka font-bold text-xl rounded-2xl cartoon-shadow-btn hover:bg-opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? 'Enrolling in Elmore...' : 'Enroll Student! 🎒'}
              </button>

              <p className="text-center text-sm font-semibold text-slate-500">
                Already enrolled?{' '}
                <Link href="/login" className="text-elmore-sky hover:underline font-bold">
                  Open Locker (Log In)
                </Link>
              </p>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
