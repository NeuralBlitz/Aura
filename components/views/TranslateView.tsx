
import React, { useState } from 'react';
import { Languages, ArrowRightLeft, RefreshCw, Volume2, Copy, Sparkles, Zap, History, Star, Mic } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface TranslationItem {
  id: string;
  original: string;
  translated: string;
  from: string;
  to: string;
  timestamp: number;
}

const TranslateView: React.FC = () => {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [fromLang, setFromLang] = useState('English');
  const [toLang, setToLang] = useState('Spanish');
  const [history, setHistory] = useState<TranslationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'translate' | 'history'>('translate');

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following from ${fromLang} to ${toLang}: "${text}"`,
      });
      const resText = response.text;
      setTranslated(resText);
      
      const newItem: TranslationItem = {
        id: Date.now().toString(),
        original: text,
        translated: resText,
        from: fromLang,
        to: toLang,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (e) {
      setTranslated("Neural error during translation.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex h-full bg-[#050505] font-sans overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-72 bg-black/50 border-r border-white/5 flex flex-col p-6 shrink-0">
         <div className="flex items-center gap-3 mb-8 text-pink-500">
            <Languages className="w-6 h-6" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Babel Matrix</h2>
         </div>
         
         <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
            <button onClick={() => setActiveTab('translate')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'translate' ? 'bg-pink-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>New</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'bg-pink-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>History</button>
         </div>

         {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
               {history.map(item => (
                  <div key={item.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-pink-500/30 transition-all cursor-pointer group" onClick={() => { setText(item.original); setTranslated(item.translated); setFromLang(item.from); setToLang(item.to); setActiveTab('translate'); }}>
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-black uppercase text-neutral-500">{item.from} → {item.to}</span>
                        <span className="text-[8px] font-mono text-neutral-600">{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className="text-xs text-white font-medium truncate">{item.original}</p>
                     <p className="text-xs text-pink-400 font-medium truncate mt-0.5">{item.translated}</p>
                  </div>
               ))}
               {history.length === 0 && <div className="text-center text-xs text-neutral-600 mt-10">No history yet.</div>}
            </div>
         )}
         
         {activeTab === 'translate' && (
            <div className="mt-auto p-4 bg-pink-900/10 rounded-2xl border border-pink-500/20 text-center">
               <Sparkles className="w-6 h-6 text-pink-500 mx-auto mb-2" />
               <p className="text-[10px] text-pink-200 font-medium">Neural Context Engine Active</p>
            </div>
         )}
      </div>

      {/* Main Area */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-y-auto">
         <div className="w-full max-w-4xl space-y-6">
            {/* Lang Selectors */}
            <div className="flex items-center justify-center gap-6 mb-8">
               <select value={fromLang} onChange={e => setFromLang(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-pink-500/50">
                  <option>English</option><option>Spanish</option><option>French</option><option>Japanese</option><option>German</option><option>Chinese</option>
               </select>
               <button onClick={() => { const temp = fromLang; setFromLang(toLang); setToLang(temp); }} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-neutral-400 hover:text-white">
                  <ArrowRightLeft className="w-4 h-4" />
               </button>
               <select value={toLang} onChange={e => setToLang(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-pink-500/50">
                  <option>Spanish</option><option>English</option><option>French</option><option>Japanese</option><option>German</option><option>Chinese</option>
               </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Input */}
               <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative h-80 bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 flex flex-col transition-all focus-within:border-pink-500/30">
                     <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-4">{fromLang}</span>
                     <textarea 
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Enter text..."
                        className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-xl font-medium text-white placeholder-neutral-700 leading-relaxed"
                     />
                     <div className="flex justify-end mt-4">
                        <button className="p-2 text-neutral-500 hover:text-white transition-colors"><Mic className="w-5 h-5" /></button>
                     </div>
                  </div>
               </div>

               {/* Output */}
               <div className="relative h-80 bg-black border border-white/10 rounded-[2.5rem] p-8 flex flex-col shadow-2xl">
                  <span className="text-[9px] font-black uppercase tracking-widest text-pink-500 mb-4">{toLang}</span>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                     {isTranslating ? (
                        <div className="flex items-center gap-3 text-pink-500/50 animate-pulse">
                           <RefreshCw className="w-5 h-5 animate-spin" />
                           <span className="text-sm font-bold">Translating...</span>
                        </div>
                     ) : (
                        <p className="text-xl font-medium text-pink-100 leading-relaxed whitespace-pre-wrap">{translated}</p>
                     )}
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                     <button onClick={() => navigator.clipboard.writeText(translated)} className="p-2 text-neutral-500 hover:text-white transition-colors"><Copy className="w-5 h-5" /></button>
                     <button className="p-2 text-neutral-500 hover:text-white transition-colors"><Volume2 className="w-5 h-5" /></button>
                  </div>
               </div>
            </div>

            <button 
               onClick={handleTranslate}
               disabled={isTranslating || !text.trim()}
               className="w-full py-6 bg-pink-600 hover:bg-pink-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-pink-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
               {isTranslating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
               Initialize Translation
            </button>
         </div>
      </div>
    </div>
  );
};

export default TranslateView;
