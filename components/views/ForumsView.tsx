
import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, MessageSquare, Heart, Share2, Search, 
  Plus, Sparkles, Hammer, RefreshCw, Radio, ChevronLeft, Pin,
  Flame, Zap, Activity, X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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

  const fetchLiveThreads = async () => {
    setIsRefreshing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a futuristic AI community forum thread. Return ONLY JSON: { title: string, user: string, content: string, tag: 'Alchemy'|'Fabrication'|'General' }",
        config: { responseMimeType: 'application/json' }
      });
      
      const data = JSON.parse(response.text.trim());
      const newThread: Thread = {
        id: Date.now().toString(),
        user: data.user,
        title: data.title,
        content: data.content,
        tag: data.tag,
        comments: [],
        likes: Math.floor(Math.random() * 20),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user}`,
        time: 'Just now',
        isNew: true
      };

      setThreads(prev => [newThread, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim()) return;
    const post: Thread = {
      id: Date.now().toString(),
      user: "You",
      title: newPostTitle,
      content: newPostContent,
      tag: "General",
      comments: [],
      likes: 0,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=User",
      time: "Just now",
      isNew: true
    };
    setThreads(prev => [post, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setIsCreating(false);
  };

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) newLiked.delete(id); else newLiked.add(id);
    setLikedPosts(newLiked);
    setThreads(prev => prev.map(t => t.id === id ? { ...t, likes: newLiked.has(id) ? t.likes + 1 : t.likes - 1 } : t));
  };

  const filteredThreads = threads.filter(t => (activeCategory === 'All' || t.tag === activeCategory) && t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Thread Detail View
  if (selectedThread) {
    return (
      <div className="pt-4 pb-32 px-4 max-w-3xl mx-auto animate-fade-in font-sans">
        <button 
          onClick={() => setSelectedThread(null)}
          className="flex items-center gap-2 text-neutral-500 hover:text-white mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Hub</span>
        </button>

        <div className="metallic-card blue rounded-[3rem] p-10 mb-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img src={selectedThread.avatar} alt="Avatar" className="w-14 h-14 rounded-2xl bg-black border border-white/10" />
              <div>
                <h4 className="font-black text-sm text-white">{selectedThread.user}</h4>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{selectedThread.time}</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
               {selectedThread.tag}
            </div>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-6">{selectedThread.title}</h1>
          <p className="text-sm text-neutral-300 leading-relaxed font-medium mb-10">{selectedThread.content}</p>

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
             <div className="py-20 text-center opacity-30">
                <Radio className="w-12 h-12 mx-auto mb-4 animate-pulse text-blue-500" />
                <p className="text-xs font-black uppercase tracking-widest text-blue-300">No signals detected</p>
             </div>
           ) : (
             selectedThread.comments.map(comment => (
               <div key={comment.id} className="metallic-card bg-neutral-900/40 rounded-[2rem] p-6 animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <img src={comment.avatar} alt="Reply" className="w-8 h-8 rounded-xl bg-black" />
                        <span className="text-xs font-black text-neutral-300">{comment.user}</span>
                     </div>
                     <span className="text-[9px] font-bold text-neutral-500">{comment.time}</span>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed font-medium mb-4">{comment.text}</p>
               </div>
             ))
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-24 px-4 min-h-full animate-fade-in max-w-4xl mx-auto relative font-sans">
      {/* Community Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
          <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] shadow-xl">
             <Users className="w-10 h-10 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">Community Hub</h1>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1">Global Neural Mesh</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLiveThreads} className="p-5 bg-neutral-900 border border-white/10 rounded-[2rem] text-indigo-500 hover:bg-neutral-800 active:scale-90 transition-all shadow-lg">
            <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsCreating(true)} className="p-5 bg-indigo-600 text-white rounded-[2rem] shadow-xl active:scale-95 transition-all hover:bg-indigo-500">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Scan discussion mesh..." 
          className="w-full bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] py-5 pl-16 pr-6 text-sm font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-xl"
        />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 mb-10">
         <div className="metallic-card blue p-6 rounded-[2.5rem] flex items-center justify-between">
            <div>
               <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Active Nodes</span>
               <div className="text-2xl font-black text-white italic">14,203</div>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
         </div>
         <div className="metallic-card purple p-6 rounded-[2.5rem] flex items-center justify-between">
            <div>
               <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Daily Threads</span>
               <div className="text-2xl font-black text-white italic">842</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
         </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
        <button 
          onClick={() => setActiveCategory('All')}
          className={`px-8 py-3 rounded-2xl whitespace-nowrap border transition-all active:scale-95 ${activeCategory === 'All' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-neutral-900/40 text-neutral-500 border-white/5'}`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Global Feed</span>
        </button>
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap border transition-all active:scale-95 ${activeCategory === cat.name ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-900/40 text-neutral-500 border-white/5'}`}
          >
             <cat.icon className={`w-4 h-4 ${activeCategory === cat.name ? 'text-white' : cat.color}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Main Feed */}
      <div className="space-y-6">
        {filteredThreads.map((thread) => (
          <div 
            key={thread.id} 
            onClick={() => setSelectedThread(thread)}
            className={`group relative metallic-card bg-neutral-950/40 rounded-[3rem] p-8 cursor-pointer animate-slide-up ${thread.isPinned ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'blue'}`}
          >
            {thread.isPinned && (
              <div className="absolute -top-3 -right-3 p-3 bg-amber-500 text-black rounded-2xl shadow-lg border-4 border-[#050505]">
                <Pin className="w-4 h-4 fill-current" />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <img src={thread.avatar} className="w-10 h-10 rounded-2xl bg-black border border-white/10 group-hover:scale-110 transition-transform" />
                 <div>
                   <span className="text-[11px] font-black text-neutral-300 block flex items-center gap-2">
                     {thread.user}
                     {thread.isNew && <span className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-full animate-pulse tracking-widest uppercase">Live</span>}
                   </span>
                   <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-tighter">{thread.time}</span>
                 </div>
               </div>
               <span className="px-4 py-1.5 bg-black/40 text-neutral-500 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-white/5">
                 {thread.tag}
               </span>
            </div>
            
            <h2 className="text-xl font-black text-white leading-snug group-hover:text-blue-400 transition-colors tracking-tight mb-4">
              {thread.title}
            </h2>
            <p className="text-sm text-neutral-500 font-medium line-clamp-2 leading-relaxed mb-8">
              {thread.content}
            </p>

            <div className="flex items-center gap-6 pt-6 border-t border-white/5">
               <div className={`flex items-center gap-2 ${likedPosts.has(thread.id) ? 'text-red-500' : 'text-neutral-500'}`}>
                 <Heart className={`w-4 h-4 ${likedPosts.has(thread.id) ? 'fill-current' : ''}`} />
                 <span className="text-[10px] font-black tracking-widest">{thread.likes}</span>
               </div>
               <div className="flex items-center gap-2 text-neutral-500">
                 <MessageSquare className="w-4 h-4" />
                 <span className="text-[10px] font-black tracking-widest">{thread.comments.length}</span>
               </div>
               <div className="flex items-center gap-2 text-neutral-600 ml-auto">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Hot</span>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="metallic-card blue rounded-[3rem] w-full max-w-xl p-10 animate-scale-in relative">
            <button onClick={() => setIsCreating(false)} className="absolute top-8 right-8 p-3 bg-black/20 rounded-full text-neutral-400 hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-black text-white tracking-tight mb-8">Signal Broadcast</h2>
            <div className="space-y-6">
                 <input autoFocus value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Topic Summary..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50" />
                 <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Full content..." rows={4} className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-5 text-white font-medium text-sm outline-none focus:border-blue-500/50 resize-none" />
                 <button onClick={handleCreatePost} disabled={!newPostTitle.trim()} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-xl">Initiate Broadcast</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumsView;
