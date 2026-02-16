
import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX, Wind, CloudRain, Zap, Radio, Headphones } from 'lucide-react';
import { executeTool } from '../../services/toolService';

const SonicView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sounds = [
    { id: 'rain', label: 'Heavy Rain', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'tech_hum', label: 'Server Room', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'white_noise', label: 'Pink Noise', icon: Radio, color: 'text-neutral-400', bg: 'bg-white/5' },
    { id: 'forest', label: 'Deep Forest', icon: Wind, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const toggleSound = (id: string) => {
    if (activeSound === id && isPlaying) {
      executeTool('sonic_link', { soundType: id, action: 'stop' });
      setIsPlaying(false);
      setActiveSound(null);
    } else {
      if (activeSound) executeTool('sonic_link', { soundType: activeSound, action: 'stop' });
      executeTool('sonic_link', { soundType: id, action: 'play' });
      setIsPlaying(true);
      setActiveSound(id);
    }
  };

  useEffect(() => {
    // Simple visualizer animation loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId: number;

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isPlaying) {
        const bars = 30;
        const width = canvas.width / bars;
        for (let i = 0; i < bars; i++) {
          const height = Math.random() * canvas.height * 0.8;
          ctx.fillStyle = activeSound === 'tech_hum' ? '#a855f7' : activeSound === 'rain' ? '#3b82f6' : '#10b981';
          ctx.globalAlpha = 0.5;
          ctx.fillRect(i * width, canvas.height - height, width - 2, height);
        }
      }
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, activeSound]);

  return (
    <div className="pt-6 pb-48 px-6 max-w-2xl mx-auto animate-fade-in font-sans text-center">
      <div className="mb-12">
         <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Headphones className="w-8 h-8 text-indigo-500" />
         </div>
         <h1 className="text-3xl font-black text-white tracking-tighter italic mb-2">Sonic Architecture</h1>
         <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em]">Neural Entrainment & Ambient Link</p>
      </div>

      <div className="relative w-full h-40 bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden mb-12 shadow-inner">
         <canvas ref={canvasRef} className="w-full h-full" width={600} height={160} />
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700">Audio Substrate Idle</span>}
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         {sounds.map(sound => (
           <button 
             key={sound.id}
             onClick={() => toggleSound(sound.id)}
             className={`p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 group active:scale-95 ${activeSound === sound.id ? 'bg-white/[0.05] border-white/20 shadow-xl' : 'bg-transparent border-white/5 hover:bg-white/[0.02]'}`}
           >
              <div className={`p-4 rounded-2xl ${sound.bg} group-hover:scale-110 transition-transform`}>
                 <sound.icon className={`w-6 h-6 ${sound.color}`} />
              </div>
              <div className="text-center">
                 <span className={`text-sm font-black block ${activeSound === sound.id ? 'text-white' : 'text-neutral-500'}`}>{sound.label}</span>
                 <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1">
                    {activeSound === sound.id ? 'Active Stream' : 'Connect'}
                 </span>
              </div>
           </button>
         ))}
      </div>
    </div>
  );
};

export default SonicView;
