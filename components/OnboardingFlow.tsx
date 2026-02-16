
import React, { useState } from 'react';
import { Sparkles, Terminal, Globe, Shield, ChevronRight, Check, Rocket, Cpu, Activity } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "The Neural Frontier",
      desc: "Welcome to Aura, your sovereign interface for the intelligence substrate. I am an agent designed to extend your cognitive reach through generative symbiosis.",
      icon: <Sparkles className="w-12 h-12 text-blue-500" />,
      color: "from-blue-600 to-indigo-500",
      hud: "LINK_STATUS: STABLE"
    },
    {
      title: "Substrate Forge",
      desc: "Code isn't just text here—it's execution. All logic, from canvas visualizations to high-fidelity simulations, runs in our integrated, secure sandbox.",
      icon: <Terminal className="w-12 h-12 text-purple-500" />,
      color: "from-purple-600 to-pink-500",
      hud: "FORGE_CORE: READY"
    },
    {
      title: "Causal Grounding",
      desc: "Search the global mesh with real-time grounding. Aura provides cited sources for every news cycle, technical query, and market trajectory.",
      icon: <Globe className="w-12 h-12 text-cyan-500" />,
      color: "from-cyan-600 to-emerald-500",
      hud: "MESH_SYNC: ACTIVE"
    },
    {
      title: "Temporal Archives",
      desc: "Your data stays on the edge. Local-first encryption and an integrated Identity Vault ensure your neural threads remain private and sovereign.",
      icon: <Shield className="w-12 h-12 text-red-500" />,
      color: "from-red-600 to-orange-500",
      hud: "ENCLAVE: SECURE"
    }
  ];

  const handleNext = () => {
    if (step === steps.length - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-[#050505] border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden relative group ring-1 ring-white/5">
        {/* Animated Background Glow */}
        <div 
          className={`absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br ${current.color} opacity-10 blur-[120px] transition-all duration-1000 ease-in-out`} 
        />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* HUD Badge */}
          <div className="mb-8 px-4 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="text-[9px] font-black tracking-[0.3em] text-neutral-500 uppercase">{current.hud}</span>
          </div>

          {/* Feature Icon with Aura */}
          <div className="relative mb-12">
            <div className={`absolute inset-0 bg-gradient-to-br ${current.color} opacity-20 blur-2xl rounded-full scale-150 animate-pulse`} />
            <div className="relative p-7 glass rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-3">
              {current.icon}
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <h2 className="text-3xl font-black text-white tracking-tighter leading-tight transition-all duration-500">
              {current.title}
            </h2>
            <p className="text-sm text-neutral-400 font-medium leading-relaxed px-4 opacity-80">
              {current.desc}
            </p>
          </div>

          {/* Indicators */}
          <div className="flex gap-3 mb-12">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-700 ${i === step ? 'w-10 bg-blue-600' : 'w-2 bg-neutral-800'}`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-[0_15px_40px_rgba(59,130,246,0.3)] active:scale-95 flex items-center justify-center gap-3 group/btn"
          >
            {step === steps.length - 1 ? (
              <><Rocket className="w-4 h-4 group-hover/btn:translate-y-[-2px] group-hover/btn:translate-x-[2px] transition-transform" /> Engage Neural Link</>
            ) : (
              <><ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /> Step Into Reality</>
            )}
          </button>

          {/* Bottom Metatdata */}
          <div className="mt-8 flex items-center gap-4 opacity-20">
             <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-tighter">Substrate_X</span>
             </div>
             <div className="w-1 h-1 bg-white/20 rounded-full" />
             <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-tighter">Live_Ingest</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
