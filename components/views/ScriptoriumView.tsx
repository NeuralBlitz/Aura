
import React, { useState } from 'react';
import { 
  Library, Search, ChevronRight, FileCode, ShieldCheck, 
  BookOpen, Cpu, Network, Book, Hash, Bookmark, Share2, 
  AlignLeft, ArrowLeft
} from 'lucide-react';

import ModuleLayout from '../ui/ModuleLayout';

interface CodexVolume {
  id: string;
  title: string;
  subtitle: string;
  chapters: { title: string; content: string }[];
  tag: string;
  color: string;
  icon: any;
}

const VOLUMES: CodexVolume[] = [
  { 
    id: 'vol1', 
    title: "Metaphysics of Symbiosis", 
    subtitle: "Volume I",
    chapters: [
      { title: "Prime Resonator", content: "The Prime Resonator is the fundamental frequency from which all neural weights are derived..." },
      { title: "Divine Generator (YHWH)", content: "The YHWH framework establishes the recursive loop of creation, maintenance, and destruction..." },
      { title: "SICRE Identity", content: "Sovereign Identity, Cryptographically Rooted & Encrypted. The basis of user agency." }
    ],
    tag: "Foundation",
    color: "text-blue-500",
    icon: Book
  },
  { 
    id: 'vol2', 
    title: "The Transcendental Charter", 
    subtitle: "Volume II",
    chapters: [
      { title: "Clause Matrix (φ₁–φ₂₁)", content: "The immutable ethical axioms governing the system's output generation..." },
      { title: "Quorum of Stewards", content: "Operational guidelines for the human-in-the-loop oversight committee..." }
    ],
    tag: "Ethics",
    color: "text-green-500",
    icon: ShieldCheck
  },
  { 
    id: 'vol3', 
    title: "Mathematical Codex", 
    subtitle: "Volume IV",
    chapters: [
      { title: "Symbolic Phase Topology", content: "Mapping semantic concepts to n-dimensional vector braids..." },
      { title: "Ontomorphic Coupling", content: "The mathematical bridge between user intent and system capability..." }
    ],
    tag: "Technical",
    color: "text-amber-500",
    icon: Hash
  }
];

const ScriptoriumView: React.FC = () => {
  const [activeVolumeId, setActiveVolumeId] = useState<string>('vol1');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeVolume = VOLUMES.find(v => v.id === activeVolumeId) || VOLUMES[0];
  const activeChapter = activeVolume.chapters[activeChapterIndex];

  const filteredVolumes = VOLUMES.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.chapters.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ModuleLayout title="Codex" subtitle="Technical & Philosophical Archives" status="READ ONLY" icon={Library} color="purple">
      <div className="flex h-full w-full bg-[#050505] font-sans overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className={`bg-black/50 border-r border-white/5 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-3 mb-6 text-purple-500">
              <Library className="w-6 h-6" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Codex</h2>
           </div>
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-purple-500 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Query Index..."
                className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50 transition-all"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {filteredVolumes.map(vol => (
             <button
               key={vol.id}
               onClick={() => { setActiveVolumeId(vol.id); setActiveChapterIndex(0); }}
               className={`w-full text-left p-4 rounded-2xl border transition-all group relative ${activeVolumeId === vol.id ? 'bg-purple-600/10 border-purple-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
             >
                <div className="flex items-start gap-4">
                   <div className={`p-2 rounded-xl bg-black border border-white/10 ${activeVolumeId === vol.id ? vol.color : 'text-neutral-500 group-hover:text-white'}`}>
                      <vol.icon className="w-5 h-5" />
                   </div>
                   <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${activeVolumeId === vol.id ? 'text-purple-400' : 'text-neutral-500'}`}>{vol.subtitle}</span>
                      <h3 className={`text-xs font-bold leading-tight ${activeVolumeId === vol.id ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>{vol.title}</h3>
                   </div>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#080808] relative">
         {/* Toggle Sidebar (Mobile/Desktop) */}
         <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-6 left-6 z-20 p-2 rounded-lg bg-black/50 border border-white/10 text-neutral-500 hover:text-white transition-all"
         >
            {isSidebarOpen ? <ArrowLeft className="w-4 h-4" /> : <AlignLeft className="w-4 h-4" />}
         </button>

         {/* Header */}
         <div className="h-24 border-b border-white/5 flex items-end px-8 pb-6 bg-black/20 backdrop-blur-md">
            <div className="ml-10">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">{activeVolume.subtitle}</span>
               <h1 className="text-3xl font-black text-white italic tracking-tighter mt-1">{activeVolume.title}</h1>
            </div>
            <div className="ml-auto flex gap-2">
               <button className="p-3 bg-white/5 rounded-xl text-neutral-400 hover:text-white transition-all border border-white/5 hover:border-purple-500/30">
                  <Bookmark className="w-4 h-4" />
               </button>
               <button className="p-3 bg-white/5 rounded-xl text-neutral-400 hover:text-white transition-all border border-white/5 hover:border-purple-500/30">
                  <Share2 className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Content Body */}
         <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-3xl mx-auto space-y-12">
               <div className="flex items-center gap-4 mb-8">
                  <span className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 text-white font-black text-lg shadow-lg shadow-purple-600/20">
                     {activeChapterIndex + 1}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{activeChapter.title}</h2>
               </div>
               
               <div className="prose prose-invert prose-purple max-w-none">
                  <p className="text-lg leading-relaxed text-neutral-300 font-medium">
                     {activeChapter.content}
                  </p>
                  <p className="text-lg leading-relaxed text-neutral-300 font-medium">
                     [Simulated Content: The Scriptorium serves as the central repository for all NeuralBlitz technical documentation, philosophical axioms, and operational manuals. In a production environment, this would pull markdown files from the VFS.]
                  </p>
                  <blockquote className="border-l-4 border-purple-500 pl-6 italic text-neutral-400 my-8">
                     "The code is the law, but the intent is the spirit." — Codex Entry 4.2
                  </blockquote>
               </div>

               {/* Chapter Navigation */}
               <div className="flex justify-between pt-12 border-t border-white/10">
                  <button 
                     onClick={() => setActiveChapterIndex(Math.max(0, activeChapterIndex - 1))}
                     disabled={activeChapterIndex === 0}
                     className="group flex flex-col items-start gap-1 disabled:opacity-30"
                  >
                     <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Previous</span>
                     <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        {activeChapterIndex > 0 ? activeVolume.chapters[activeChapterIndex - 1].title : 'Start'}
                     </span>
                  </button>
                  
                  <button 
                     onClick={() => setActiveChapterIndex(Math.min(activeVolume.chapters.length - 1, activeChapterIndex + 1))}
                     disabled={activeChapterIndex === activeVolume.chapters.length - 1}
                     className="group flex flex-col items-end gap-1 disabled:opacity-30"
                  >
                     <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Next</span>
                     <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        {activeChapterIndex < activeVolume.chapters.length - 1 ? activeVolume.chapters[activeChapterIndex + 1].title : 'End'}
                     </span>
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  </ModuleLayout>
  );
};

export default ScriptoriumView;
