
import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, LayoutGrid, BookOpen, FolderKanban, ShoppingBag, Zap, X, Command, Cpu, Brain } from 'lucide-react';
import { Tab } from '../types';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: Tab) => void;
  onExecute: (cmd: string) => void;
}

const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({ isOpen, onClose, onNavigate, onExecute }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const shortcuts = [
    { id: 'nexus', label: 'Launch Nexus OS', icon: LayoutGrid, tab: 'nexus' as Tab },
    { id: 'chat', label: 'New Neural Thread', icon: Zap, tab: 'home' as Tab },
    { id: 'projects', label: 'Open Project Boards', icon: FolderKanban, tab: 'projects' as Tab },
    { id: 'notes', label: 'Access Knowledge Codex', icon: BookOpen, tab: 'notes' as Tab },
    { id: 'forge', label: 'Engage Codex Forge', icon: Brain, tab: 'forge' as Tab },
    { id: 'live', label: 'Engage Aura Live', icon: Zap, tab: 'live' as Tab },
    { id: 'market', label: 'Explore Substrate Exchange', icon: ShoppingBag, tab: 'marketplace' as Tab },
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = shortcuts.filter(s => s.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden animate-scale-in ring-1 ring-white/5">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <Command className="w-5 h-5 text-blue-500" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Execute system command or navigate..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-neutral-700 font-bold"
          />
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10">
             <span className="text-[10px] font-black text-neutral-500 uppercase">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 no-scrollbar">
          <div className="px-4 py-2">
             <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em]">Direct Navigation</p>
          </div>
          {filtered.map((s) => (
            <button 
              key={s.id}
              onClick={() => { onNavigate(s.tab); onClose(); }}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-blue-600/10 hover:border-blue-500/20 border border-transparent transition-all group"
            >
              <div className="flex items-center gap-4">
                 <div className="p-2.5 rounded-xl bg-neutral-900 border border-white/5 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                    <s.icon className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-bold text-neutral-400 group-hover:text-white">{s.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-800 group-hover:text-blue-500" />
            </button>
          ))}

          {query.length > 2 && (
             <button 
              onClick={() => { onExecute(query); onClose(); }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest mt-4 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
             >
                <Cpu className="w-4 h-4" />
                Query Neural Substrate: "{query}"
             </button>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 opacity-30">
                 <Command className="w-3 h-3" />
                 <span className="text-[8px] font-black uppercase">K</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Aura OS Command Center v7.0</p>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black text-neutral-700 uppercase">Synchronized</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default GlobalCommandPalette;
