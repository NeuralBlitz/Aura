
import React, { useState } from 'react';
import { Hourglass, Lock, Clock, Calendar } from 'lucide-react';

const CapsuleView: React.FC = () => {
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const handleLock = () => {
    if (!message || !unlockDate) return;
    setIsLocked(true);
  };

  return (
    <div className="pt-6 pb-48 px-6 max-w-2xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-amber-600/10 border border-amber-500/20 rounded-[1.8rem] shadow-xl">
           <Hourglass className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">Chrono Capsule</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Temporal Vault</p>
        </div>
      </div>

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
  );
};

export default CapsuleView;
