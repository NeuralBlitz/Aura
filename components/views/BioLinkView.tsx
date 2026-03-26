
import React from 'react';
import { Activity, Zap, Battery, Sun, Moon } from 'lucide-react';
import ModuleLayout from '../ui/ModuleLayout';

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
    <ModuleLayout title="Bio-Link" subtitle="Circadian Sync" status="SYNC ACTIVE" icon={Activity} color="emerald">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-emerald-500 mb-6">
                 <Activity className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Vitals</h2>
              </div>
              <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20">
                 <Zap className="w-4 h-4" /> Optimize Sync
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all bg-emerald-900/20 text-emerald-400 border border-emerald-500/20">
                 <div className="flex items-center gap-3"><Activity className="w-4 h-4" /><span className="text-xs font-bold">Overview</span></div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent">
                 <div className="flex items-center gap-3"><Sun className="w-4 h-4" /><span className="text-xs font-bold">Circadian</span></div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent">
                 <div className="flex items-center gap-3"><Battery className="w-4 h-4" /><span className="text-xs font-bold">Energy</span></div>
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <h1 className="text-sm font-black text-white uppercase tracking-widest">
               Circadian Sync
             </h1>
             <div className="flex gap-2">
               <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  Sync Active
               </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="max-w-2xl mx-auto">
              <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                       {isDay ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-blue-400" />}
                       <span className="text-sm font-black text-white">{cycle}</span>
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
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default BioLinkView;
