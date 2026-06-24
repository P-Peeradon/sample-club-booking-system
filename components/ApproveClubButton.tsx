'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApproveClubButton({ clubId }: { clubId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clubs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ club_id: clubId }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve club');
      }

      // Refresh the page to update the lists
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to approve the club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="px-4 py-2 bg-green-500 text-white font-fredoka font-bold text-sm rounded-xl border-2 border-elmore-dark shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-green-600 hover:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
    >
      {loading ? 'Approving...' : 'Approve ✅'}
    </button>
  );
}
