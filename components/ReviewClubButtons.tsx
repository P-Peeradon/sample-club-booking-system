'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { invoke } from '@tauri-apps/api/core';

export default function ReviewClubButtons({ clubId }: { clubId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      if ((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
        await invoke('approve_club', { clubId });
        console.log('Tauri IPC: approved club', clubId);
      } else {
        console.log('Web mock: approve club');
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to approve the club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      if ((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
        await invoke('reject_club', { clubId, reason: rejectReason });
        console.log('Tauri IPC: rejected club', clubId);
      } else {
        console.log('Web mock: reject club');
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to reject the club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (rejectMode) {
    return (
      <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border-2 border-dashed border-red-300">
        <label className="text-xs font-bold text-slate-500">Reason for rejection (optional):</label>
        <input 
          type="text" 
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Too scary!"
          className="text-sm px-2 py-1 rounded-lg border-2 border-slate-300 focus:outline-none focus:border-red-400"
          disabled={loading}
        />
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 px-2 py-1 bg-red-500 text-white font-bold text-xs rounded-lg shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-red-600 hover:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? '...' : 'Confirm Reject'}
          </button>
          <button
            onClick={() => setRejectMode(false)}
            disabled={loading}
            className="px-2 py-1 bg-slate-300 text-slate-700 font-bold text-xs rounded-lg shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-slate-400 hover:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white font-fredoka font-bold text-sm rounded-xl border-2 border-elmore-dark shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-green-600 hover:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
      >
        Approve ✅
      </button>
      <button
        onClick={() => setRejectMode(true)}
        disabled={loading}
        className="px-4 py-1 bg-red-100 text-red-600 font-fredoka font-bold text-xs rounded-xl border-2 border-red-200 hover:bg-red-200 hover:border-red-300 transition-all disabled:opacity-50"
      >
        Reject ❌
      </button>
    </div>
  );
}
