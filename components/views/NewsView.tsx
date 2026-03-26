
import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Zap, Search, Globe, TrendingUp, RefreshCw, Sparkles, 
  ExternalLink, Clock, BarChart3, TrendingDown, Minus, Github, 
  Cpu, Workflow, Network, Layers, Database, Terminal, Filter, Bookmark, BookOpen, ChevronRight
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import DataVisualizer from '../DataVisualizer';
import ModuleLayout from '../ui/ModuleLayout';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  summary: string;
  time: string;
  url: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  body?: string; // Simulated full content
}

const NewsView: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'feed' | 'reader'>('feed');
  const [readingItem, setReadingItem] = useState<NewsItem | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<any[]>([]);

  const categories = ['All', 'AI & Tech', 'Crypto', 'Science', 'Global'];

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data);
      // Mock sentiment data
      setSentimentData(Array.from({length:7}, (_,i) => ({ day: `D-${7-i}`, value: 50 + Math.random()*40 })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = new Set(savedItems);
    if (newSaved.has(id)) newSaved.delete(id); else newSaved.add(id);
    setSavedItems(newSaved);
  };

  const openReader = (item: NewsItem) => {
    setReadingItem(item);
    setViewMode('reader');
  };

  const SidebarButton = ({ label, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest mb-1 ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
    >
      {label}
    </button>
  );

  return (
    <ModuleLayout title="Intel" subtitle="Neural Feed" status={isLoading ? "SYNCING" : "ONLINE"} icon={Newspaper} color="blue">
      <div className="flex h-full bg-black/20 overflow-hidden font-sans relative w-full">
        {/* Sidebar Navigation */}
        <div className="w-60 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 shrink-0">
           <div className="flex items-center gap-3 mb-10 text-blue-500">
              <Newspaper className="w-6 h-6" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Intel Command</h2>
           </div>

           <div className="mb-8">
              <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-3 px-2">Feed Source</span>
              {categories.map(cat => (
                 <SidebarButton key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
              ))}
           </div>

           <div>
              <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-3 px-2">Personal</span>
              <SidebarButton label={`Saved (${savedItems.size})`} active={activeCategory === 'Saved'} onClick={() => setActiveCategory('Saved')} />
           </div>
        </div>

        {/* Main Feed / Reader */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
           {/* Top Bar */}
           <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-4">
                 {viewMode === 'reader' && (
                    <button onClick={() => setViewMode('feed')} className="p-2 bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-all">
                       <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                 )}
                 <h1 className="text-sm font-black text-white uppercase tracking-widest">
                    {viewMode === 'reader' ? 'Reader Mode' : `${activeCategory} Feed`}
                 </h1>
              </div>
              <button onClick={fetchNews} className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 transition-all ${isLoading ? 'animate-spin' : ''}`}>
                 <RefreshCw className="w-4 h-4" />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {viewMode === 'reader' && readingItem ? (
                 <div className="max-w-3xl mx-auto animate-slide-up">
                    <div className="glass-morphic bg-neutral-900/40 border border-white/10 rounded-[3rem] p-12">
                       <div className="flex items-center gap-3 mb-6">
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">{readingItem.category}</span>
                          <span className="text-xs text-neutral-500 font-bold">{readingItem.time}</span>
                       </div>
                       <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tight italic">{readingItem.title}</h1>
                       <div className="prose prose-invert prose-lg max-w-none text-neutral-300 font-medium leading-relaxed">
                          <p>{readingItem.summary}</p>
                          <p>Simulated deep content: Analysis of the vector space indicates a strong correlation between the deployment of the {readingItem.title} node and global efficiency metrics. The substrate verifies this data with 99.8% coherence.</p>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="space-y-8">
                    {/* Sentiment Chart Widget */}
                    {activeCategory === 'All' && (
                       <div className="h-64 glass-morphic bg-blue-900/5 border border-blue-500/20 rounded-[2.5rem] p-6 mb-8">
                          <DataVisualizer config={{
                             type: 'area',
                             title: 'Sentiment Vector',
                             data: sentimentData,
                             xAxisKey: 'day',
                             yAxisKey: 'value',
                             colors: ['#3b82f6']
                          }} />
                       </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                       {news.filter(n => {
                          if (activeCategory === 'All') return true;
                          if (activeCategory === 'Saved') return savedItems.has(n.id);
                          return n.category.includes(activeCategory.split('&')[0].trim());
                       }).map((item, idx) => (
                          <div 
                             key={item.id}
                             onClick={() => openReader(item)}
                             className="group relative glass-morphic bg-neutral-900/40 hover:bg-neutral-800/60 border border-white/5 hover:border-blue-500/30 rounded-[2rem] p-6 cursor-pointer transition-all flex flex-col sm:flex-row gap-6 animate-slide-up"
                             style={{ animationDelay: `${idx * 50}ms` }}
                          >
                             <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">{item.source}</span>
                                   <button onClick={(e) => toggleSave(item.id, e)} className={`transition-colors ${savedItems.has(item.id) ? 'text-yellow-500' : 'text-neutral-600 hover:text-white'}`}>
                                      <Bookmark className={`w-4 h-4 ${savedItems.has(item.id) ? 'fill-current' : ''}`} />
                                   </button>
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                <p className="text-xs text-neutral-400 font-medium leading-relaxed line-clamp-2">{item.summary}</p>
                                
                                <div className="mt-4 flex items-center gap-4 pt-4 border-t border-white/5">
                                   <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                                      <Clock className="w-3 h-3" /> {item.time}
                                   </span>
                                   <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                      <TrendingUp className="w-3 h-3" /> Sentiment: {item.sentiment}
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default NewsView;
