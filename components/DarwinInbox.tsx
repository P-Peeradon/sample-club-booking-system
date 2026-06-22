'use client';

import { useState, useEffect, useRef } from 'react';
import { getDarwinInboxList, getDarwinChatHistory, sendDarwinMessage } from '@/app/actions';

interface InboxItem {
  student_id: string;
  name: string;
  avatar: string;
  is_anonymous: number;
}

interface ChatMessage {
  message_id: number;
  sender: 'Student' | 'Darwin' | 'Gumball';
  message: string;
  created_at: Date;
  is_anonymous: number;
}

const AVATARS: { [id: string]: string } = {
  gumball: '🐱',
  darwin: '🐠',
  anais: '🐰',
  penny: '🦌',
  carrie: '👻',
  bobert: '🤖',
  banana: '🍌',
};

export default function DarwinInbox() {
  const [inboxList, setInboxList] = useState<InboxItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<InboxItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (studentId: string) => {
    setLoading(true);
    const history = await getDarwinChatHistory(studentId);
    setMessages(history as unknown as ChatMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    getDarwinInboxList().then((list) => {
      if (!ignore) {
        setInboxList(list as unknown as InboxItem[]);
      }
    });
    return () => { ignore = true; };
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedStudent) return;

    const formData = new FormData();
    formData.append('message', input);
    formData.append('studentId', selectedStudent.student_id);

    setInput('');
    await sendDarwinMessage(formData);
    await loadMessages(selectedStudent.student_id);
  };

  return (
    <div className="bg-white rounded-2xl border-4 border-elmore-dark shadow-[8px_8px_0px_rgba(30,41,59,1)] overflow-hidden font-fredoka flex h-150 mt-8 max-w-5xl mx-auto">
      {/* Sidebar Inbox List */}
      <div className="w-1/3 bg-orange-100 border-r-4 border-elmore-dark flex flex-col">
        <div className="p-4 bg-orange-400 border-b-4 border-elmore-dark text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🐠</span> Wellbeing Inbox
          </h2>
          <p className="text-xs font-semibold opacity-90">Support your schoolmates!</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
          {inboxList.length === 0 ? (
            <div className="text-center p-4 text-sm font-semibold text-orange-800/60">
              No messages yet. Everyone is happy!
            </div>
          ) : (
            inboxList.map((item) => {
              const isAnon = item.is_anonymous === 1;
              const displayName = isAnon ? 'Anonymous Student' : item.name;
              const displayAvatar = isAnon ? '👤' : (AVATARS[item.avatar] || '👤');
              const isSelected = selectedStudent?.student_id === item.student_id;

              return (
                <button
                  key={item.student_id}
                  onClick={() => {
                    setSelectedStudent(item);
                    loadMessages(item.student_id);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left w-full ${
                    isSelected 
                      ? 'bg-orange-300 border-elmore-dark shadow-[2px_2px_0px_rgba(30,41,59,1)]' 
                      : 'bg-white border-transparent hover:border-orange-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-white rounded-lg border-2 border-elmore-dark flex items-center justify-center text-xl">
                    {displayAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-elmore-dark truncate text-sm">
                      {displayName}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold truncate">
                      {isAnon ? 'Identity Hidden' : item.student_id}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 bg-[#fff9f0] flex flex-col relative">
        {selectedStudent ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b-4 border-elmore-dark flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl border-2 border-elmore-dark flex items-center justify-center text-2xl">
                {selectedStudent.is_anonymous === 1 ? '👤' : (AVATARS[selectedStudent.avatar] || '👤')}
              </div>
              <div>
                <h3 className="font-bold text-lg text-elmore-dark">
                  {selectedStudent.is_anonymous === 1 ? 'Anonymous Student' : selectedStudent.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedStudent.is_anonymous === 1 ? 'Identity Hidden' : selectedStudent.student_id}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {loading && messages.length === 0 ? (
                <p className="text-center text-sm text-slate-400">Loading messages...</p>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.message_id} 
                    className={`max-w-[75%] p-3 rounded-2xl border-2 border-elmore-dark text-sm font-medium shadow-[3px_3px_0px_rgba(30,41,59,1)] ${
                      msg.sender !== 'Student' 
                        ? (msg.sender === 'Darwin' ? 'bg-orange-400 text-white rounded-br-sm self-end' : 'bg-blue-400 text-white rounded-br-sm self-end')
                        : 'bg-white text-elmore-dark rounded-bl-sm self-start'
                    }`}
                  >
                    {msg.sender === 'Student' && (
                      <div className="text-[10px] font-bold opacity-50 mb-1">
                        {msg.is_anonymous === 1 ? 'Anonymous' : selectedStudent.name}
                      </div>
                    )}
                    <p>{msg.message}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t-4 border-elmore-dark flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your reply to support them..."
                className="flex-1 bg-slate-100 border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-elmore-dark focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-orange-400 text-white px-6 rounded-xl flex items-center justify-center font-bold text-lg border-2 border-elmore-dark shadow-[3px_3px_0px_rgba(30,41,59,1)] hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-400 transition-all active:translate-y-1 active:shadow-none"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <span className="text-6xl mb-4">💌</span>
            <h3 className="text-xl font-bold text-slate-500 mb-2">Select a Conversation</h3>
            <p className="text-sm font-semibold max-w-sm">
              Click on a student in the inbox list to read their message and offer your support. Remember to be empathetic!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
