
import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import ModuleLayout from '../ui/ModuleLayout';

const CipherView: React.FC = () => {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');

  const handleAction = () => {
    // Simple XOR mock encryption for visual demonstration
    const output = btoa(text).split('').reverse().join('');
    setResult(output);
  };

  return (
    <ModuleLayout
      title="Cipher-X"
      subtitle="Neural Steganography"
      icon={Lock}
      color="red"
    >
      <div className="max-w-2xl mx-auto p-8 h-full overflow-y-auto no-scrollbar">
        <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <ShieldCheck className="w-64 h-64 text-red-500" />
           </div>

           <div className="relative z-10 space-y-6">
              <textarea 
                 value={text}
                 onChange={e => setText(e.target.value)}
                 placeholder="Enter hidden message..."
                 className="w-full h-40 bg-black/50 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 transition-all resize-none"
              />

              <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 focus-within:border-red-500/50 transition-all">
                 <Key className="w-4 h-4 text-red-500" />
                 <input 
                    type="text"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    placeholder="Encryption Key (Optional)"
                    className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none placeholder-neutral-600"
                 />
              </div>

              <button 
                 onClick={handleAction}
                 className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                 Encrypt Payload <ArrowRight className="w-4 h-4" />
              </button>

              {result && (
                 <div className="p-6 bg-black/60 rounded-3xl border border-red-500/20 font-mono text-xs text-red-400 break-all animate-slide-up">
                    {result}
                 </div>
              )}
           </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default CipherView;
