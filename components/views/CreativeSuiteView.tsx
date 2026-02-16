
import React, { useState } from 'react';
import { Radio, Edit3, Layers, RefreshCw, Volume2, Wand2 } from 'lucide-react';

const CreativeSuiteView: React.FC<{ activeTab: 'signal' | 'style' | 'loom' }> = ({ activeTab }) => {
  const [tab, setTab] = useState(activeTab);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');

  return (
    <div className="pt-6 pb-48 px-6 max-w-3xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center justify-center gap-4 mb-10">
         {[{id: 'signal', icon: Radio, label: 'Signal'}, {id: 'style', icon: Edit3, label: 'Style'}, {id: 'loom', icon: Layers, label: 'Loom'}].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex flex-col items-center gap-2 p-4 rounded-3xl w-28 transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-neutral-900/50 text-neutral-500 hover:bg-neutral-800'}`}
            >
               <t.icon className="w-6 h-6" />
               <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
            </button>
         ))}
      </div>

      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-10 min-h-[400px]">
         {tab === 'signal' && (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in space-y-8">
               <div className="relative w-full h-32 bg-black/50 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50">
                     {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-1 bg-cyan-500 rounded-full animate-pulse" style={{ height: Math.random() * 80 + '%', animationDelay: i * 0.1 + 's' }} />
                     ))}
                  </div>
                  <h2 className="relative z-10 text-2xl font-black text-white italic tracking-tighter">Latent Space FM</h2>
               </div>
               <div className="flex gap-4">
                  <button className="p-4 bg-white/5 rounded-full text-white hover:bg-cyan-600 hover:scale-110 transition-all"><RefreshCw className="w-6 h-6" /></button>
                  <button className="p-6 bg-cyan-600 rounded-full text-white shadow-xl shadow-cyan-600/30 hover:scale-105 transition-all"><Volume2 className="w-8 h-8" /></button>
               </div>
               <p className="text-xs text-cyan-500 font-mono">Tuning frequency: 492.23 Hz...</p>
            </div>
         )}

         {tab === 'style' && (
            <div className="space-y-6 animate-fade-in">
               <div className="grid grid-cols-2 gap-4 mb-4">
                  {['Cyberpunk', 'Academic', 'Corporate', 'Shakespearean'].map(s => (
                     <button key={s} className="py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 text-neutral-400 hover:text-white transition-all">{s}</button>
                  ))}
               </div>
               <textarea placeholder="Input text to rewrite..." className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none" />
               <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Process Protocol</button>
            </div>
         )}

         {tab === 'loom' && (
            <div className="space-y-6 animate-fade-in text-center">
               <Layers className="w-12 h-12 text-orange-500 mx-auto" />
               <div className="flex gap-4 items-center">
                  <input value={inputA} onChange={e => setInputA(e.target.value)} placeholder="Concept A" className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-4 text-center text-sm font-bold text-white focus:outline-none" />
                  <span className="text-2xl font-black text-white">+</span>
                  <input value={inputB} onChange={e => setInputB(e.target.value)} placeholder="Concept B" className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-4 text-center text-sm font-bold text-white focus:outline-none" />
               </div>
               <button className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3">
                  <Wand2 className="w-4 h-4" /> Weave Intersection
               </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default CreativeSuiteView;
