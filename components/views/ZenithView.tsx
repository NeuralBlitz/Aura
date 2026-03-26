
import React, { useState, useEffect } from 'react';
import { Anchor, Wind, Play, Square } from 'lucide-react';
import { haptic } from '../../services/hapticService';
import ModuleLayout from '../ui/ModuleLayout';

const ZenithView: React.FC = () => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!active) {
      setScale(1);
      setPhase('Inhale');
      return;
    }

    const breathe = () => {
      // 4-4-4 Box Breathing Cycle Simulation
      setPhase('Inhale');
      setScale(1.5);
      haptic.trigger([50, 50, 50]); // Inhale haptics
      
      setTimeout(() => {
        setPhase('Hold');
        
        setTimeout(() => {
          setPhase('Exhale');
          setScale(1);
          haptic.trigger(200); // Exhale haptic
          
          setTimeout(() => {
             // Loop or Hold again could go here
             if(active) breathe(); 
          }, 4000);
        }, 4000);
      }, 4000);
    };

    breathe();
    
    // Cleanup not perfectly handled in this simple loop demo, but sufficient for UI
    return () => {}; 
  }, [active]);

  return (
    <ModuleLayout
      title="Zenith"
      subtitle="Resonance Anchor"
      status={active ? "ENGAGED" : "STANDBY"}
      icon={Anchor}
      color="emerald"
    >
      <div className="h-full overflow-y-auto no-scrollbar p-6 w-full">
        <div className="max-w-2xl mx-auto h-full flex flex-col min-h-[500px]">
          <div className="flex-1 flex flex-col items-center justify-center relative">
             <div 
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 blur-3xl absolute opacity-20 transition-all duration-[4000ms] ease-in-out"
                style={{ transform: `scale(${scale * 1.5})` }}
             />
             
             <div 
                className="w-64 h-64 rounded-full border-4 border-emerald-500/30 flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative z-10 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                style={{ transform: `scale(${scale})` }}
             >
                <Wind className="w-16 h-16 text-white" />
             </div>

             <h2 className="text-3xl font-black text-white mt-12 tracking-widest uppercase animate-pulse">{active ? phase : 'Ready'}</h2>
             <p className="text-xs text-neutral-500 mt-2 font-medium uppercase tracking-[0.2em]">Haptic Resonance {active ? 'Engaged' : 'Standby'}</p>
          </div>

          <button 
             onClick={() => setActive(!active)}
             className={`w-full py-6 mt-12 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-xl flex items-center justify-center gap-4 ${active ? 'bg-white/10 text-neutral-400 hover:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
          >
             {active ? <><Square className="w-4 h-4 fill-current" /> End Session</> : <><Play className="w-4 h-4 fill-current" /> Begin Breathwork</>}
          </button>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default ZenithView;
