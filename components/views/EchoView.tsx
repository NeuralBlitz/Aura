
import React, { useState } from 'react';
import { BrainCircuit, Sparkles, RefreshCcw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ModuleLayout from '../ui/ModuleLayout';

const EchoView: React.FC = () => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the psychological tone and personality traits of this text. Be concise, using 3-4 bullet points: "${input}"`
      });
      setAnalysis(response.text);
    } catch (e) {
      setAnalysis("Neural link failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Echo Mirror"
      subtitle="Psychometric Radar"
      status="ANALYZING"
      icon={BrainCircuit}
      color="pink"
    >
      <div className="max-w-2xl mx-auto p-8 h-full overflow-y-auto no-scrollbar w-full">
        <div className="space-y-6">
           <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste text sample for analysis..."
              className="w-full h-32 bg-neutral-900/50 border border-white/10 rounded-[2.5rem] p-6 text-sm font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-pink-500/50 transition-all resize-none"
           />
           
           <button 
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="w-full py-4 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-pink-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analyze Reflection
           </button>

           {analysis && (
              <div className="glass-morphic bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 animate-slide-up">
                 <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-4">Psychometric Output</h3>
                 <div className="prose prose-invert prose-sm">
                    <p className="text-neutral-300 font-medium leading-relaxed whitespace-pre-wrap">{analysis}</p>
                 </div>
              </div>
           )}
        </div>
      </div>
    </ModuleLayout>
  );
};

export default EchoView;
