
import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, MessageSquare, Heart, Share2, Search, 
  Plus, Sparkles, Hammer, RefreshCw, Radio, ChevronLeft, Pin,
  Flame, Zap, Activity, X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ModuleLayout from '../ui/ModuleLayout';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

interface Thread {
  id: string;
  user: string;
  title: string;
  content: string;
  tag: string;
  comments: Comment[];
  likes: number;
  avatar: string;
  time: string;
  isPinned?: boolean;
  isNew?: boolean;
}

const INITIAL_THREADS: Thread[] = [
  { 
    id: 'p1', 
    user: "Aura_System", 
    title: "Official: Substrate v4.5 Deployment Notes", 
    content: "The latest update introduces a zero-latency causal loop in the Gemini 3 Flash weights. Please report any temporal drift encountered in the Forge.",
    tag: "System",
    comments: [
      { id: 'c1', user: 'Protocol_Watcher', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=watch', text: 'Stability looks good on the West Coast nodes.', time: '1h ago', likes: 12 }
    ],
    likes: 1240,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura",
    time: "2h ago",
    isPinned: true
  },
  { 
    id: '1', 
    user: "SynthExplorer", 
    title: "How to simulate 4D fluid dynamics in the Forge?", 
    content: "I'm trying to render a tesseract-based fluid simulation but the gravity constants keep collapsing. Any tips on SOPES integration?",
    tag: "Fabrication",
    comments: [],
    likes: 128,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=synth",
    time: "2h ago"
  }
];

const ForumsView: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const categories = [
    { name: "Alchemy", icon: Sparkles, color: "text-purple-400" },
    { name: "Fabrication", icon: Hammer, color: "text-blue-400" },
    { name: "General", icon: MessageSquare, color: "text-neutral-400" }
  ];

  const fetchThreads = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/store/forums');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
           setThreads(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchLiveThreads = async () => {
    setIsRefreshing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a futuristic AI community forum thread. Return ONLY JSON: { \"title\": \"string\", \"user\": \"string\", \"content\": \"string\", \"tag\": \"Alchemy\" }",
        config: { responseMimeType: 'application/json' }
      });
      
      const data = JSON.parse(response.text?.trim() || '{}');
      if (data.title) {
         const newThread: Thread = {
           id: Date.now().toString(),
           user: data.user || 'Anonymous',
           title: data.title,
           content: data.content || '',
           tag: data.tag || 'General',
           comments: [],
           likes: Math.floor(Math.random() * 20),
           avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user || 'anon'}`,
           time: 'Just now',
           isNew: true
         };

         try {
            await fetch('/api/store/forums', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newThread)
            });
         } catch (e) {
            // fallback if no backend
            setThreads(prev => [newThread, ...prev]);
         }
         
         fetchThreads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim()) return;
    const post: Thread = {
      id: Date.now().toString(),
      user: "You",
      title: newPostTitle,
      content: newPostContent,
      tag: activeCategory === 'All' ? 'General' : activeCategory,
      comments: [],
      likes: 0,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=User",
      time: "Just now",
      isNew: true
    };
    
    try {
       await fetch('/api/store/forums', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(post)
       });
    } catch (e) {
       setThreads(prev => [post, ...prev]);
    }

    fetchThreads();
    setNewPostTitle('');
    setNewPostContent('');
    setIsCreating(false);
  };

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) newLiked.delete(id); else newLiked.add(id);
    setLikedPosts(newLiked);
    setThreads(prev => prev.map(t => t.id === id ? { ...t, likes: newLiked.has(id) ? t.likes - 1 : t.likes + 1 } : t));
  };

  const filteredThreads = threads.filter(t => (activeCategory === 'All' || t.tag === activeCategory) && t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ModuleLayout title="Community Hub" subtitle="Global Mesh" status="LIVE" icon={Users} color="indigo">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans relative w-full">
        
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-indigo-500 mb-6">
                 <Users className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Global Mesh</h2>
              </div>
              <button 
                 onClick={() => setIsCreating(true)}
                 className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                 <Plus className="w-4 h-4" /> Broadcast Signal
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <div className="px-3 mb-2 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Channels</div>
              <button 
                 onClick={() => setActiveCategory('All')}
                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeCategory === 'All' ? 'bg-indigo-900/20 text-indigo-400 border border-indigo-500/20' : 'text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                 <div className="flex items-center gap-3">
                    <Radio className="w-4 h-4" />
                    <span className="text-xs font-bold truncate">Global Feed</span>
                 </div>
              </button>
              {categories.map(cat => (
                 <button 
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeCategory === cat.name ? 'bg-indigo-900/20 text-indigo-400 border border-indigo-500/20' : 'text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
                 >
                    <div className="flex items-center gap-3">
                       <cat.icon className="w-4 h-4" />
                       <span className="text-xs font-bold truncate">{cat.name}</span>
                    </div>
                 </button>
              ))}
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             {selectedThread ? (
                <button 
                  onClick={() => setSelectedThread(null)}
                  className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Back to Feed</span>
                </button>
             ) : (
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                   <div className="relative flex-1 group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Scan discussion mesh..." 
                       className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                     />
                   </div>
                   <button 
                     onClick={fetchLiveThreads} 
                     className="p-2 bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                     title="Fetch Live Signals"
                   >
                     <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                   </button>
                </div>
             )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
             <div className="max-w-3xl mx-auto">
                {selectedThread ? (
                   <div className="animate-slide-up">
                      <div className="glass-morphic bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 mb-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <img src={selectedThread.avatar} alt="Avatar" className="w-12 h-12 rounded-xl bg-black border border-white/10" />
                            <div>
                              <h4 className="font-black text-sm text-white">{selectedThread.user}</h4>
                              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{selectedThread.time}</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/10 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                             {selectedThread.tag}
                          </div>
                        </div>

                        <h1 className="text-2xl font-black text-white leading-tight mb-4">{selectedThread.title}</h1>
                        <p className="text-sm text-neutral-300 leading-relaxed font-medium mb-8">{selectedThread.content}</p>

                        <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                           <button 
                            onClick={() => toggleLike(selectedThread.id)}
                            className={`flex items-center gap-2 transition-colors ${likedPosts.has(selectedThread.id) ? 'text-red-500' : 'text-neutral-500 hover:text-red-400'}`}
                           >
                             <Heart className={`w-5 h-5 ${likedPosts.has(selectedThread.id) ? 'fill-current' : ''}`} />
                             <span className="text-xs font-black">{selectedThread.likes}</span>
                           </button>
                           <div className="flex items-center gap-2 text-neutral-500">
                             <MessageSquare className="w-5 h-5" />
                             <span className="text-xs font-black">{selectedThread.comments.length}</span>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                         {selectedThread.comments.length === 0 ? (
                           <div className="py-12 text-center opacity-50">
                              <Radio className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">No signals detected</p>
                           </div>
                         ) : (
                           selectedThread.comments.map(comment => (
                             <div key={comment.id} className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-3">
                                      <img src={comment.avatar} alt="Reply" className="w-6 h-6 rounded-lg bg-black" />
                                      <span className="text-xs font-black text-neutral-300">{comment.user}</span>
                                   </div>
                                   <span className="text-[9px] font-bold text-neutral-500">{comment.time}</span>
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed font-medium">{comment.text}</p>
                             </div>
                           ))
                         )}
                      </div>
                   </div>
                ) : (
                   <div className="space-y-4">
                     {filteredThreads.map((thread) => (
                       <div 
                         key={thread.id} 
                         onClick={() => setSelectedThread(thread)}
                         className={`group relative bg-black/40 border rounded-2xl p-6 cursor-pointer hover:bg-white/[0.02] transition-all ${thread.isPinned ? 'border-amber-500/30' : 'border-white/5'}`}
                       >
                         {thread.isPinned && (
                           <div className="absolute -top-2 -right-2 p-2 bg-amber-500 text-black rounded-xl shadow-lg">
                             <Pin className="w-3 h-3 fill-current" />
                           </div>
                         )}
                         
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <img src={thread.avatar} className="w-8 h-8 rounded-xl bg-black border border-white/10" />
                              <div>
                                <span className="text-[11px] font-black text-neutral-300 flex items-center gap-2">
                                  {thread.user}
                                  {thread.isNew && <span className="bg-indigo-600 text-white text-[8px] px-2 py-0.5 rounded-md animate-pulse tracking-widest uppercase">Live</span>}
                                </span>
                                <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-tighter">{thread.time}</span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-white/5 text-neutral-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-white/5">
                              {thread.tag}
                            </span>
                         </div>
                         
                         <h2 className="text-lg font-black text-white leading-snug group-hover:text-indigo-400 transition-colors tracking-tight mb-3">
                           {thread.title}
                         </h2>
                         <p className="text-xs text-neutral-500 font-medium line-clamp-2 leading-relaxed mb-6">
                           {thread.content}
                         </p>

                         <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                            <div className={`flex items-center gap-2 ${likedPosts.has(thread.id) ? 'text-red-500' : 'text-neutral-500'}`}>
                              <Heart className={`w-4 h-4 ${likedPosts.has(thread.id) ? 'fill-current' : ''}`} />
                              <span className="text-[10px] font-black tracking-widest">{thread.likes}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-500">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-[10px] font-black tracking-widest">{thread.comments.length}</span>
                            </div>
                            {thread.likes > 100 && (
                               <div className="flex items-center gap-1.5 text-orange-500 ml-auto">
                                  <Flame className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Hot</span>
                               </div>
                            )}
                         </div>
                       </div>
                     ))}
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Create Modal Overlay */}
        {isCreating && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-neutral-900 border border-white/10 rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl">
              <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-black text-white tracking-tight mb-6">Broadcast Signal</h2>
              <div className="space-y-4">
                   <input autoFocus value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Topic Summary..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-indigo-500/50 transition-colors" />
                   <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Full content..." rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium text-xs outline-none focus:border-indigo-500/50 resize-none transition-colors" />
                   <button onClick={handleCreatePost} disabled={!newPostTitle.trim()} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-lg disabled:opacity-50 disabled:hover:bg-indigo-600">Initiate Broadcast</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ModuleLayout>
  );
};

export default ForumsView;
