
import React, { useState } from 'react';
import { Edit3, ArrowRight, Wand2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const StyleView: React.FC = () => {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('Cyberpunk');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = ['Cyberpunk', 'Academic', 'Corporate', 'Shakespearean', 'Pirate', 'Gen Z'];

  const rewrite = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite the following text in a ${style} style/tone: "${text}"`
      });
      setOutput(response.text);
    } catch (e) {
      setOutput("Protocol Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 pb-48 px-6 max-w-3xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-[1.8rem] shadow-xl">
           <Edit3 className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">Style Matrix</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Protocol Droid</p>
        </div>
      </div>

      <div className="space-y-6">
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {styles.map(s => (
               <button 
                  key={s} 
                  onClick={() => setStyle(s)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${style === s ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-neutral-900/50 border-white/5 text-neutral-500 hover:text-white'}`}
               >
                  {s}
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <textarea 
               value={text}
               onChange={e => setText(e.target.value)}
               placeholder="Input text..."
               className="w-full h-64 bg-black/40 border border-white/10 rounded-[2.5rem] p-6 text-sm font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
            />
            <div className="w-full h-64 bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar relative">
               {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Wand2 className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
               ) : (
                  <p className="text-sm font-medium text-blue-100 whitespace-pre-wrap">{output || "Output buffer empty..."}</p>
               )}
            </div>
         </div>

         <button 
            onClick={rewrite}
            disabled={loading || !text}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
         >
            Process Rewrite <ArrowRight className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};

export default StyleView;
