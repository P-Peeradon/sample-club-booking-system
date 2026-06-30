'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { invoke } from '@tauri-apps/api/core';

interface ChatMessage {
  message_id: number;
  sender: 'Student' | 'Darwin' | 'Gumball';
  message: string;
  created_at: Date;
  is_anonymous: number;
}

export default function DarwinChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // We hardcode the student ID for this demo
  const currentStudentId = 'EH-2024001';
  const [isTauri] = useState(() => typeof window !== 'undefined' && !!(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    if (isTauri) {
      const history = await invoke<ChatMessage[]>('get_darwin_chat_history', { studentId: currentStudentId });
      setMessages(history);
    } else {
      setMessages([{
        message_id: 1,
        sender: 'Darwin',
        message: 'Hello! I am Darwin, your friendly AI support. How can I help you today?',
        created_at: new Date(),
        is_anonymous: 0
      }]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      message_id: Date.now(),
      sender: 'Student',
      message: input,
      created_at: new Date(),
      is_anonymous: isAnonymous ? 1 : 0
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    if (isTauri) {
      await invoke('send_darwin_message', { studentId: currentStudentId, message: input, isAnonymous });
      await loadMessages();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-fredoka">
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            loadMessages();
          }}
          className="w-16 h-16 bg-orange-400 text-white rounded-full flex items-center justify-center text-3xl cartoon-shadow-btn hover:scale-105 transition-transform overflow-hidden"
          title="Talk to Darwin"
        >
          <Image src="/darwin.png" alt="Darwin" width={64} height={64} className="w-full h-full object-contain p-1" />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-112 bg-white rounded-2xl border-4 border-elmore-dark flex flex-col shadow-[8px_8px_0px_rgba(30,41,59,1)] overflow-hidden">
          {/* Header */}
          <div className="bg-orange-400 p-4 border-b-4 border-elmore-dark flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Image src="/darwin.png" alt="Darwin" width={32} height={32} className="w-8 h-8 object-contain" />
              <div>
                <h3 className="font-bold text-lg leading-tight">Talk to Darwin</h3>
                <p className="text-[10px] font-semibold opacity-90">Wellbeing Support</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#fff9f0] flex flex-col gap-3">
            {loading && messages.length === 0 ? (
              <p className="text-center text-sm text-slate-400 mt-4">Loading messages...</p>
            ) : messages.length === 0 ? (
              <div className="text-center mt-6">
                <p className="text-4xl mb-2">👋</p>
                <p className="text-sm font-semibold text-slate-500">
                  Hi! I&apos;m Darwin. How are you feeling today? You can share anything here safely.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.message_id} 
                  className={`max-w-[85%] p-3 rounded-2xl border-2 border-elmore-dark text-sm font-medium shadow-[2px_2px_0px_rgba(30,41,59,1)] ${
                    msg.sender === 'Student' 
                      ? 'bg-elmore-sky text-white rounded-br-sm self-end' 
                      : msg.sender === 'Gumball' 
                        ? 'bg-blue-300 text-white rounded-bl-sm self-start'
                        : 'bg-white text-elmore-dark rounded-bl-sm self-start'
                  }`}
                >
                  {msg.sender !== 'Student' && (
                    <div className="text-[10px] font-bold opacity-70 mb-1 flex items-center gap-1">
                      {msg.sender === 'Darwin' ? (
                        <><Image src="/darwin.png" alt="Darwin" width={12} height={12} className="w-3 h-3 object-contain" /> Darwin</>
                      ) : (
                        <><Image src="/gumball.png" alt="Gumball" width={12} height={12} className="w-3 h-3 object-contain" /> Gumball</>
                      )}
                    </div>
                  )}
                  <p>{msg.message}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t-4 border-elmore-dark flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="anon" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="anon" className="text-xs font-semibold text-slate-500 cursor-pointer">
                Send Anonymously
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-100 border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-elmore-dark focus:outline-none focus:border-elmore-sky focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-orange-400 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold border-2 border-elmore-dark shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-400"
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
