
import React, { useState } from 'react';
import { Lock, Trash2, Hourglass, ArrowRight, ShieldCheck, AlertTriangle, Key, Unlock } from 'lucide-react';

const SecuritySuiteView: React.FC<{ activeTab: 'cipher' | 'void' | 'capsule' }> = ({ activeTab }) => {
  const [tab, setTab] = useState(activeTab);
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');

  const handleAction = () => {
    if (tab === 'cipher') {
      setResult(btoa(text).split('').reverse().join('')); // Simple mock encryption
    } else if (tab === 'void') {
      setResult('DATA_SHREDDED_CRYPTOGRAPHICALLY');
      setTimeout(() => { setText(''); setResult(''); }, 2000);
    } else {
      setResult(`CAPSULE_LOCKED_UNTIL_${new Date(Date.now() + 86400000).toLocaleDateString()}`);
    }
  };

  return (
    <div className="pt-6 pb-48 px-6 max-w-3xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center justify-center gap-4 mb-10">
         {[{id: 'cipher', icon: Lock, label: 'Cipher-X'}, {id: 'void', icon: Trash2, label: 'Void Bin'}, {id: 'capsule', icon: Hourglass, label: 'Capsule'}].map(t => (
            <button 
              key={t.id}
              onClick={() => { setTab(t.id as any); setResult(''); setText(''); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-3xl w-28 transition-all ${tab === t.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-neutral-900/50 text-neutral-500 hover:bg-neutral-800'}`}
            >
               <t.icon className="w-6 h-6" />
               <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
            </button>
         ))}
      </div>

      <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-red-500" />
         </div>

         <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
               {tab === 'cipher' && <Key className="w-5 h-5 text-red-500" />}
               {tab === 'void' && <AlertTriangle className="w-5 h-5 text-red-500" />}
               {tab === 'capsule' && <ClockIcon className="w-5 h-5 text-red-500" />}
               <h2 className="text-xl font-black text-white tracking-tight">
                  {tab === 'cipher' ? 'Neural Steganography' : tab === 'void' ? 'Entropy Shredder' : 'Temporal Vault'}
               </h2>
            </div>

            <textarea 
               value={text}
               onChange={e => setText(e.target.value)}
               placeholder={tab === 'cipher' ? "Enter hidden message..." : tab === 'void' ? "Type sensitive data to destroy..." : "Message for the future..."}
               className="w-full h-40 bg-black/50 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 transition-all resize-none"
            />

            {tab === 'cipher' && (
               <input 
                  type="text"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="Encryption Key (Optional)"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-red-500/50"
               />
            )}

            <button 
               onClick={handleAction}
               className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
               {tab === 'cipher' ? 'Encrypt Payload' : tab === 'void' ? 'Disintegrate' : 'Seal Capsule'} <ArrowRight className="w-4 h-4" />
            </button>

            {result && (
               <div className="p-6 bg-black/60 rounded-3xl border border-red-500/20 font-mono text-xs text-red-400 break-all animate-slide-up">
                  {result}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default SecuritySuiteView;
