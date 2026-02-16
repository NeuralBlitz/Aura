
import React, { useState } from 'react';
import { Radio, RefreshCw, Volume2, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const SignalView: React.FC = () => {
  const [content, setContent] = useState<string>('Tuning latent space frequency...');
  const [tuning, setTuning] = useState(false);

  const tune = async () => {
    setTuning(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a short, mind-blowing scientific fact, philosophical quote, or futuristic concept. Keep it under 2 sentences."
      });
      setContent(response.text);
    } catch (e) {
      setContent("Signal lost in the void.");
    } finally {
      setTuning(false);
    }
  };

  return (
    <div className="pt-6 pb-48 px-6 max-w-2xl mx-auto animate-fade-in font-sans h-full flex flex-col">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-cyan-600/10 border border-cyan-500/20 rounded-[1.8rem] shadow-xl">
           <Radio className="w-8 h-8 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">Signal Tuner</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Latent Space FM</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
         <div className="w-full bg-black/40 border border-white/10 rounded-[3rem] p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
               {[...Array(30)].map((_, i) => (
                  <div key={i} className="w-1 bg-cyan-500 rounded-full animate-pulse" style={{ height: Math.random() * 100 + '%', animationDelay: i * 0.05 + 's', animationDuration: '0.5s' }} />
               ))}
            </div>
            
            <div className="relative z-10">
               <Zap className="w-8 h-8 text-cyan-500 mx-auto mb-6" />
               <p className="text-lg font-medium text-white leading-relaxed italic">"{content}"</p>
            </div>
         </div>
      </div>

      <div className="flex gap-4 mt-8">
         <button onClick={tune} className="flex-1 py-6 bg-cyan-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-cyan-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
            <RefreshCw className={`w-5 h-5 ${tuning ? 'animate-spin' : ''}`} /> Scan Freq
         </button>
         <button className="px-8 py-6 bg-white/5 text-white rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-95">
            <Volume2 className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

export default SignalView;
