
import React from 'react';
import { ReasoningStep } from '../types';
import { BrainCircuit, ChevronRight, Activity, Zap, CheckCircle2 } from 'lucide-react';

interface ThinkingXRayProps {
  steps: ReasoningStep[];
}

const ThinkingXRay: React.FC<ThinkingXRayProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full my-8 bg-blue-600/[0.03] border border-blue-500/20 rounded-[2.5rem] p-8 overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 shadow-lg">
             <BrainCircuit className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">Reasoning X-Ray</h3>
            <p className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest">Live Causal Trace</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/10">
           <Activity className="w-3 h-3 text-blue-400" />
           <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{steps.length} Nodes</span>
        </div>
      </div>

      <div className="space-y-6 relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/10 to-transparent" />

        {steps.map((step, idx) => (
          <div key={step.id} className="relative pl-12 group animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className={`absolute left-4.5 top-1.5 w-3 h-3 rounded-full border-2 transition-all duration-500 z-10 
              ${step.status === 'complete' ? 'bg-blue-500 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-black border-blue-500/30 animate-pulse'}
            `} />
            
            <div className="glass bg-white/[0.02] border border-white/5 group-hover:border-blue-500/30 rounded-2xl p-5 transition-all group-hover:translate-x-1">
               <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Step_{idx + 1}</span>
                  <h4 className="text-xs font-black text-white/90 uppercase tracking-tight">{step.title}</h4>
                  {step.status === 'complete' && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
               </div>
               <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                 {step.content}
               </p>
               
               {idx < steps.length - 1 && (
                 <div className="mt-4 flex items-center gap-2 opacity-20">
                    <Zap className="w-2 h-2 text-blue-500" />
                    <div className="h-px flex-1 bg-blue-500/20" />
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5 text-center">
         <p className="text-[8px] font-black text-neutral-800 uppercase tracking-[0.4em]">Inference Depth: Unified_Substrate_Logos</p>
      </div>
    </div>
  );
};

export default ThinkingXRay;
