import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Plus, X, Trash2 } from 'lucide-react';
import { Thread } from '../types';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentThreadId: string;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  currentThreadId,
  onSelectThread,
  onNewChat
}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'threads'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedThreads: Thread[] = [];
      snapshot.forEach((doc) => {
        loadedThreads.push({ id: doc.id, ...doc.data() } as Thread);
      });
      // Sort client-side to avoid requiring a composite index
      loadedThreads.sort((a, b) => b.updatedAt - a.updatedAt);
      setThreads(loadedThreads);
    }, (error) => {
      console.error("Error fetching threads:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'threads', threadId));
      // Also delete messages in this thread
      const messagesQ = query(collection(db, `threads/${threadId}/messages`));
      const messagesSnapshot = await getDocs(messagesQ);
      messagesSnapshot.forEach(async (messageDoc) => {
        await deleteDoc(messageDoc.ref);
      });
      if (currentThreadId === threadId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[95] md:hidden"
          onClick={onClose}
        />
      )}
      <div className={`fixed top-0 bottom-0 left-0 w-72 bg-[#0A0A0A] border-r border-white/10 z-[100] transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            History
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <button 
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filteredThreads.length === 0 ? (
            <div className="text-center p-6 opacity-50">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">No conversations</p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <div
                key={thread.id}
                onClick={() => {
                  onSelectThread(thread.id);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-xl transition-all group relative cursor-pointer flex items-center justify-between ${currentThreadId === thread.id ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-bold truncate">{thread.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[9px] font-mono opacity-50">
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </p>
                    {thread.modelType && (
                      <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-neutral-500 border border-white/5">
                        {thread.modelType.split('-')[0]}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteThread(e, thread.id)}
                  className="p-1.5 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar;
