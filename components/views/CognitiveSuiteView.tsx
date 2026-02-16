
import React, { useState } from 'react';
import { Activity, BrainCircuit, Anchor, Battery, Zap, Wind } from 'lucide-react';

const CognitiveSuiteView: React.FC<{ activeTab: 'biolink' | 'echo' | 'zenith' }> = ({ activeTab }) => {
  const [tab, setTab] = useState(activeTab);

  return (
    <div className="pt-6 pb-48 px-6 max-w-3xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center justify-center gap-4 mb-10">
         {[{id: 'biolink', icon: Activity, label: 'Bio-Link'}, {id: 'echo', icon: BrainCircuit, label: 'Echo'}, {id: 'zenith', icon: Anchor, label: 'Zenith'}].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex flex-col items-center gap-2 p-4 rounded-3xl w-28 transition-all ${tab === t.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-neutral-900/50 text-neutral-500 hover:bg-neutral-800'}`}
            >
               <t.icon className="w-6 h-6" />
               <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
            </button>
         ))}
      </div>

      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-10 min-h-[400px] relative">
         {tab === 'biolink' && (
            <div className="space-y-8 animate-fade-in">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white italic">Circadian Sync</h2>
                  <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Optimal</div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
                     <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                     <span className="text-[10px] font-black uppercase text-neutral-500">Peak Energy</span>
                     <p className="text-xl font-black text-white">10:00 AM</p>
                  </div>
                  <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
                     <Battery className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                     <span className="text-[10px] font-black uppercase text-neutral-500">Rest Window</span>
                     <p className="text-xl font-black text-white">03:00 PM</p>
                  </div>
               </div>
               <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 w-[70%]" />
               </div>
               <p className="text-xs text-neutral-500 text-center font-medium">Cognitive battery operating at 70% efficiency.</p>
            </div>
         )}

         {tab === 'echo' && (
            <div className="space-y-8 animate-fade-in text-center">
               <BrainCircuit className="w-16 h-16 text-pink-500 mx-auto animate-pulse" />
               <h2 className="text-2xl font-black text-white italic">Psychometric Radar</h2>
               <div className="relative w-64 h-64 mx-auto bg-neutral-900 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-75" />
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-50" />
                  <div className="w-32 h-32 bg-pink-500/20 blur-2xl rounded-full" />
                  <p className="relative z-10 text-xs font-black text-white">Openness: 85%</p>
               </div>
            </div>
         )}

         {tab === 'zenith' && (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in py-10">
               <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
                  <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] relative z-10">
                     <Wind className="w-12 h-12 text-white" />
                  </div>
               </div>
               <h2 className="text-xl font-black text-white mt-8 tracking-widest uppercase">Inhale</h2>
               <p className="text-xs text-neutral-500 mt-2 font-medium">Syncing haptic resonance...</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default CognitiveSuiteView;
