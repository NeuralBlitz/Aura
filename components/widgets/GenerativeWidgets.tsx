
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Square, TrendingUp, TrendingDown, Minus, Activity, Sliders, Sparkles, Target,
  GraduationCap, RefreshCcw, ChevronRight, Brain, Presentation, Maximize2
} from 'lucide-react';
import { Widget } from '../../types';

// --- Quiz Widget ---
interface QuizData {
  title: string;
  questions: { id: string; question: string; options: string[]; answer: string }[];
}

const QuizWidget: React.FC<{ data: QuizData }> = ({ data }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === data.questions[activeIdx].answer) setScore(s => s + 1);
  };

  const next = () => {
    if (activeIdx < data.questions.length - 1) {
      setActiveIdx(i => i + 1);
      setSelected(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) return (
    <div className="glass bg-blue-600/10 border border-blue-500/30 rounded-[3rem] p-10 text-center animate-scale-in">
       <GraduationCap className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-bounce" />
       <h3 className="text-2xl font-black text-white mb-2">Neural Link Synchronized</h3>
       <p className="text-sm text-neutral-400 font-medium mb-8">Intelligence verified at {Math.round((score/data.questions.length)*100)}% coherence.</p>
       <button onClick={() => { setActiveIdx(0); setScore(0); setIsFinished(false); }} className="px-10 py-4 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-blue-600/20">Restart Protocol</button>
    </div>
  );

  const q = data.questions[activeIdx];
  return (
    <div className="glass bg-neutral-900/60 border border-white/10 rounded-[3rem] p-10 my-6 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Knowledge Verify</span>
         </div>
         <span className="text-[10px] font-black text-white bg-white/5 px-4 py-1.5 rounded-full border border-white/10">{activeIdx + 1} / {data.questions.length}</span>
      </div>
      
      <h2 className="text-xl font-black text-white mb-10 leading-tight">{q.question}</h2>
      
      <div className="space-y-3">
        {q.options.map(opt => (
          <button 
            key={opt}
            onClick={() => handleSelect(opt)}
            className={`w-full p-6 rounded-2xl text-left font-bold text-sm transition-all border ${
              selected === opt ? (opt === q.answer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400') :
              (selected && opt === q.answer ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10')
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected && (
        <button onClick={next} className="w-full mt-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 animate-fade-in shadow-xl shadow-blue-600/20">
          Continue Path <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// --- Slide/Presentation Widget ---
const SlideWidget: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="glass bg-black border border-white/5 rounded-[2.5rem] p-8 my-6 shadow-2xl relative overflow-hidden group">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <Presentation className="w-6 h-6 text-blue-500" />
             </div>
             <div>
                <h3 className="text-sm font-black text-white tracking-tight">{data.title}</h3>
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{data.slides.length} Substrate Layers</p>
             </div>
          </div>
          <button className="p-3 bg-white/5 rounded-2xl text-neutral-500 hover:text-white transition-all active:scale-90">
             <Maximize2 className="w-5 h-5" />
          </button>
       </div>
       <div className="bg-neutral-900/40 rounded-[2rem] border border-white/5 aspect-video flex flex-col items-center justify-center p-12 text-center group-hover:scale-[1.01] transition-transform">
          <h4 className="text-2xl font-black text-white mb-4 tracking-tighter leading-tight">{data.slides[0].heading}</h4>
          <p className="text-sm text-neutral-400 font-medium leading-relaxed">{data.slides[0].content}</p>
       </div>
       <div className="mt-8 flex justify-center gap-2">
          {data.slides.map((_: any, i: number) => (
             <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === 0 ? 'bg-blue-500 w-6' : 'bg-neutral-800'}`} />
          ))}
       </div>
    </div>
  );
};

// --- Original Widgets ---
interface ChecklistItem { id: string; label: string; checked: boolean; }
interface ChecklistData { title: string; items: ChecklistItem[]; }
const ChecklistWidget: React.FC<{ data: ChecklistData }> = ({ data }) => {
  const [items, setItems] = useState(data.items);
  const toggleItem = (id: string) => { setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)); };
  const progress = items.length > 0 ? Math.round((items.filter(i => i.checked).length / items.length) * 100) : 0;
  return (
    <div className="glass bg-neutral-900/50 border border-white/10 rounded-[2rem] p-6 shadow-2xl my-6 font-sans overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-3"><CheckSquare className="w-4 h-4 text-blue-500" />{data.title}</h3>
        <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{progress}%</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full mb-6 overflow-hidden mx-2">
        <div className="h-full bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <button key={item.id} onClick={() => toggleItem(item.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left border ${item.checked ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/5 border-transparent hover:border-white/10'}`}>
            <div className={`transition-colors ${item.checked ? 'text-blue-500' : 'text-neutral-500'}`}>{item.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</div>
            <span className={`text-sm font-bold ${item.checked ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Dispatcher ---
export const WidgetDispatcher: React.FC<{ widget: Widget }> = ({ widget }) => {
  switch (widget.type) {
    case 'checklist': return <ChecklistWidget data={widget.data} />;
    case 'quiz': return <QuizWidget data={widget.data} />;
    case 'slide': return <SlideWidget data={widget.data} />;
    default: return null;
  }
};
