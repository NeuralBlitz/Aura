
import React, { useState } from 'react';
import { Layers, Wand2, Plus } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ModuleLayout from '../ui/ModuleLayout';

const LoomView: React.FC = () => {
  const [conceptA, setConceptA] = useState('');
  const [conceptB, setConceptB] = useState('');
  const [result, setResult] = useState('');
  const [weaving, setWeaving] = useState(false);

  const weave = async () => {
    if (!conceptA || !conceptB) return;
    setWeaving(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Synthesize a new, creative invention or concept by combining "${conceptA}" and "${conceptB}". Describe it in 2 sentences.`
      });
      setResult(response.text);
    } catch (e) {
      setResult("Weave failed.");
    } finally {
      setWeaving(false);
    }
  };

  return (
    <ModuleLayout
      title="Idea Loom"
      subtitle="Generative Synthesis"
      status="WEAVING"
      icon={Layers}
      color="orange"
    >
      <div className="h-full overflow-y-auto no-scrollbar p-6 w-full">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
             <div className="flex flex-col md:flex-row gap-6 items-center mb-10">
                <input 
                   value={conceptA}
                   onChange={e => setConceptA(e.target.value)}
                   placeholder="Concept A"
                   className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-center text-sm font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
                <div className="p-3 bg-white/5 rounded-full"><Plus className="w-4 h-4 text-neutral-500" /></div>
                <input 
                   value={conceptB}
                   onChange={e => setConceptB(e.target.value)}
                   placeholder="Concept B"
                   className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-center text-sm font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
             </div>

             {result && (
                <div className="mb-10 p-6 bg-orange-600/10 border border-orange-500/20 rounded-3xl animate-scale-in">
                   <p className="text-sm font-medium text-orange-100 leading-relaxed italic">"{result}"</p>
                </div>
             )}

             <button 
                onClick={weave}
                disabled={weaving || !conceptA || !conceptB}
                className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-500 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {weaving ? <Layers className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Weave Intersection
             </button>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default LoomView;
