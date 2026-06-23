'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Education');
  const [iconFile, setIconFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!name || !description || !category || !iconFile) {
      setError('Please fill out all fields and select an icon.');
      setLoading(false);
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(iconFile.type)) {
      setError('Invalid file type. Only PNG, JPG, and GIF are allowed.');
      setLoading(false);
      return;
    }

    const MAX_SIZE = 512 * 1024 * 1024;
    if (iconFile.size > MAX_SIZE) {
      setError('File size must not exceed 512MB.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('icon', iconFile);

      const res = await fetch('/api/clubs', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit club request.');
      }

      if (res.status === 202) {
        setSuccess('🎉 Club request submitted! It is now waiting for approval by the Student Union.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        throw new Error('Unexpected response status: ' + res.status);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 font-fredoka p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="w-12 h-12 bg-white rounded-xl border-4 border-elmore-dark flex items-center justify-center text-2xl shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:bg-slate-50 hover:translate-y-1 transition-all active:shadow-none">
            ⬅️
          </Link>
          <div>
            <h1 className="text-4xl font-black text-elmore-dark tracking-wide uppercase stroke-black drop-shadow-md">
              Start a New Club
            </h1>
            <p className="text-lg font-bold text-slate-500">
              Submit your idea to the Elmore Student Union!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border-4 border-elmore-dark shadow-[8px_8px_0px_rgba(30,41,59,1)] flex flex-col gap-6">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-xl font-bold">
              ❌ {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-2 border-green-500 text-green-700 p-4 rounded-xl font-bold">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-bold text-xl text-elmore-dark">Club Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Paranormal Society"
              className="bg-slate-100 border-4 border-elmore-dark rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:bg-white focus:border-blue-400 transition-colors"
              disabled={loading}
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-xl text-elmore-dark">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-100 border-4 border-elmore-dark rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:bg-white focus:border-blue-400 transition-colors cursor-pointer"
              disabled={loading}
            >
              <option value="Education">Education</option>
              <option value="Treehouse">Treehouse</option>
              <option value="Sport">Sport</option>
              <option value="Music">Music</option>
              <option value="Politics">Politics</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-xl text-elmore-dark">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you do in this club?"
              rows={4}
              className="bg-slate-100 border-4 border-elmore-dark rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:bg-white focus:border-blue-400 transition-colors resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-xl text-elmore-dark">Club Logo (Icon)</label>
            <p className="text-sm font-semibold text-slate-500 mb-2">Upload an image file (.png, .jpg, .gif). Max size 512MB.</p>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/gif"
              onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              className="bg-slate-100 border-4 border-elmore-dark rounded-xl p-4 text-lg font-semibold cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-elmore-dark file:text-sm file:font-bold file:bg-orange-400 file:text-white hover:file:bg-orange-500 transition-all"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-blue-500 text-white border-4 border-elmore-dark rounded-xl py-4 text-2xl font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:bg-blue-600 hover:translate-y-1 transition-all active:shadow-none disabled:opacity-50 disabled:hover:bg-blue-500 disabled:hover:translate-y-0 disabled:shadow-[4px_4px_0px_rgba(30,41,59,1)]"
          >
            {loading ? 'Submitting...' : 'Submit to Student Union!'}
          </button>
        </form>
      </div>
    </main>
  );
}
