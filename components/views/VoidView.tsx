
import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

const VoidView: React.FC = () => {
  const [text, setText] = useState('');
  const [isShredding, setIsShredding] = useState(false);

  const handleAction = () => {
    setIsShredding(true);
    setTimeout(() => {
      setText('');
      setIsShredding(false);
    }, 2000);
  };

  return (
    <div className="pt-6 pb-48 px-6 max-w-2xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-neutral-800/50 border border-white/10 rounded-[1.8rem] shadow-xl">
           <Trash2 className="w-8 h-8 text-neutral-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">Void Bin</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Entropy Shredder</p>
        </div>
      </div>

      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-8 relative overflow-hidden">
         {isShredding && (
            <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center">
               <div className="text-center">
                  <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Overwriting Sectors...</p>
               </div>
            </div>
         )}

         <div className="relative z-10 space-y-6">
            <textarea 
               value={text}
               onChange={e => setText(e.target.value)}
               placeholder="Type sensitive data to irreversibly destroy..."
               className="w-full h-64 bg-black/50 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 transition-all resize-none"
            />

            <button 
               onClick={handleAction}
               disabled={!text || isShredding}
               className="w-full py-5 bg-neutral-800 hover:bg-red-900/80 text-neutral-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
               <AlertTriangle className="w-4 h-4" /> Disintegrate
            </button>
         </div>
      </div>
    </div>
  );
};

export default VoidView;
