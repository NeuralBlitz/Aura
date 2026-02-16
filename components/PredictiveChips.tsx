
import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface PredictiveChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  isVisible: boolean;
}

const PredictiveChips: React.FC<PredictiveChipsProps> = ({ suggestions, onSelect, isVisible }) => {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 animate-fade-in">
      {suggestions.map((text, i) => (
        <button
          key={i}
          onClick={() => onSelect(text)}
          className="flex items-center gap-2 px-5 py-2.5 glass-morphic bg-blue-600/5 hover:bg-blue-600/20 border-blue-500/20 rounded-full whitespace-nowrap transition-all hover:scale-105 active:scale-95 group shadow-lg"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <Sparkles className="w-3 h-3 text-blue-500 group-hover:animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-white">
            {text}
          </span>
          <ArrowUpRight className="w-3 h-3 text-neutral-600 group-hover:text-blue-500 transition-colors" />
        </button>
      ))}
    </div>
  );
};

export default PredictiveChips;
