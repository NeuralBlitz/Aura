
import React from 'react';
import { Activity, Zap, Battery, Sun, Moon } from 'lucide-react';

const BioLinkView: React.FC = () => {
  const [bioData, setBioData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchBioData = async () => {
      try {
        const response = await fetch('/api/bio/sync');
        const data = await response.json();
        setBioData(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBioData();
  }, []);

  if (!bioData) return null;

  const { isDay, energyLevel, peakFocus, recharge, cycle } = bioData;

  return (
    <div className="pt-6 pb-48 px-6 max-w-2xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-[1.8rem] shadow-xl">
           <Activity className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">Bio-Link</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Circadian Sync</p>
        </div>
      </div>

      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
               {isDay ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-blue-400" />}
               <span className="text-sm font-black text-white">{cycle}</span>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
               Sync Active
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
               <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
               <span className="text-[10px] font-black uppercase text-neutral-500">Peak Focus</span>
               <p className="text-xl font-black text-white">{peakFocus}</p>
            </div>
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
               <Battery className="w-8 h-8 text-blue-500 mx-auto mb-2" />
               <span className="text-[10px] font-black uppercase text-neutral-500">Recharge</span>
               <p className="text-xl font-black text-white">{recharge}</p>
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
               <span>Current Energy</span>
               <span>{energyLevel}%</span>
            </div>
            <div className="h-3 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
               <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                  style={{ width: `${energyLevel}%` }} 
               />
            </div>
         </div>
      </div>
    </div>
  );
};

export default BioLinkView;
