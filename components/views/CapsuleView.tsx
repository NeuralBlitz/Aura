
import React, { useState } from 'react';
import { Hourglass, Lock, Clock, Calendar } from 'lucide-react';
import ModuleLayout from '../ui/ModuleLayout';

const CapsuleView: React.FC = () => {
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const handleLock = () => {
    if (!message || !unlockDate) return;
    setIsLocked(true);
  };

  return (
    <ModuleLayout title="Chrono Capsule" subtitle="Temporal Vault" status={isLocked ? "SEALED" : "OPEN"} icon={Hourglass} color="amber">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-amber-500 mb-6">
                 <Hourglass className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Vault</h2>
              </div>
              <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20">
                 <Lock className="w-4 h-4" /> Seal New
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all bg-amber-900/20 text-amber-400 border border-amber-500/20">
                 <div className="flex items-center gap-3"><Hourglass className="w-4 h-4" /><span className="text-xs font-bold">Active</span></div>
                 <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">1</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent">
                 <div className="flex items-center gap-3"><Lock className="w-4 h-4" /><span className="text-xs font-bold">Sealed</span></div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent">
                 <div className="flex items-center gap-3"><Clock className="w-4 h-4" /><span className="text-xs font-bold">History</span></div>
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <h1 className="text-sm font-black text-white uppercase tracking-widest">
               Temporal Vault
             </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="max-w-2xl mx-auto">
              <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-8 relative overflow-hidden">
                 {isLocked ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
                       <Lock className="w-16 h-16 text-amber-500 mb-6" />
                       <h3 className="text-2xl font-black text-white mb-2">Capsule Sealed</h3>
                       <p className="text-xs text-neutral-400 font-medium mb-8 uppercase tracking-widest">Unlock Date: {unlockDate}</p>
                       <button onClick={() => { setIsLocked(false); setMessage(''); }} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                          Create New
                       </button>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <textarea 
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="Message for the future..."
                          className="w-full h-48 bg-black/50 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                       />

                       <div className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl px-6 py-4">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <input 
                             type="date"
                             value={unlockDate}
                             onChange={e => setUnlockDate(e.target.value)}
                             className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none [color-scheme:dark]"
                          />
                       </div>

                       <button 
                          onClick={handleLock}
                          disabled={!message || !unlockDate}
                          className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                          <Clock className="w-4 h-4" /> Seal in Time
                       </button>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default CapsuleView;
