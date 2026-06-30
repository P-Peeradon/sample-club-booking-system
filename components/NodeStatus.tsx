'use client';

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function NodeStatus() {
  const [nodeStatus, setNodeStatus] = useState<string>('Initializing node...');
  const [peers, setPeers] = useState<string[]>([]);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Basic check to see if we're running inside Tauri
    if ((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
      setIsTauri(true);
      startDistributedNode();
    } else {
      setNodeStatus('Running in web mode. Distributed node inactive.');
    }
  }, []);

  const startDistributedNode = async () => {
    try {
      const status = await invoke<string>('start_node');
      setNodeStatus(status);
      
      // Poll for active peers every 5 seconds
      setInterval(async () => {
        try {
          const activePeers = await invoke<string[]>('get_active_peers');
          setPeers(activePeers);
        } catch (e) {
          console.error("Failed to fetch peers:", e);
        }
      }, 5000);
    } catch (error) {
      setNodeStatus(`Failed to start node: ${error}`);
    }
  };

  return (
    <div className="bg-elmore-dark text-white p-4 rounded-xl border-4 border-slate-700 shadow-[4px_4px_0px_rgba(30,41,59,0.5)] font-fredoka mt-8">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
        Distributed Node Status
      </h3>
      <p className="text-sm text-slate-300 font-sans mb-4">{nodeStatus}</p>
      
      {isTauri && (
        <div className="bg-slate-800 rounded-lg p-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Connected Peers</h4>
          {peers.length === 0 ? (
            <p className="text-xs text-slate-500 font-sans">No other tablets found on local network.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {peers.map((peer, i) => (
                <li key={i} className="text-sm text-green-300 font-sans flex items-center gap-2">
                  <span className="text-lg">📡</span> {peer}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
