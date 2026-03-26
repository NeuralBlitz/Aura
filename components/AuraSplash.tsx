
import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Activity, Globe, Lock, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuraSplashProps {
  onComplete: () => void;
}

const AuraSplash: React.FC<AuraSplashProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [glitchText, setGlitchText] = useState('AURA_CORE_STDBY');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 6-second total sequence
    const sequence = [
      { text: 'INIT_NEURAL_UPLINK', delay: 1200 },
      { text: 'SYNCING_GLOBAL_GRID', delay: 2400 },
      { text: 'CALIBRATING_AXIOMS', delay: 3800 },
      { text: 'AURA_LINK_ACTIVE', delay: 5000 },
      { text: 'HANDSHAKE_COMPLETE', delay: 5800 },
    ];

    sequence.forEach((item, i) => {
      setTimeout(() => {
        setGlitchText(item.text);
        setStage(i + 1);
      }, item.delay);
    });

    // Final Fade and Callback
    setTimeout(() => setStage(6), 6200);
    setTimeout(onComplete, 6800);

    // Constellation Particle Animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const particleCount = 40;
    
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2
        });
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist/100)})`;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === 6 ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Constellation Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Cyber Overlay: CRT Lines */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,3px_100%]" />

      {/* Central AI Nucleus */}
      <div className="relative w-80 h-80 flex items-center justify-center z-20">
        {/* Dynamic Energy Pulses */}
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full border border-blue-500/20"
            style={{
              width: '100%',
              height: '100%',
              animation: `pulse-expand 3s infinite ${i * 1}s ease-out`,
              opacity: stage > 0 ? 1 : 0
            }}
          />
        ))}

        {/* Orbitals */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full border border-blue-500/10 rounded-full animate-[spin_30s_linear_infinite]" />
          <div className="absolute w-[80%] h-[80%] border border-purple-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
          <div className="absolute w-[60%] h-[60%] border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
        </div>

        {/* Central Core */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[50px] animate-pulse" />
          <div className="relative w-24 h-24 glass rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.4)]">
             <Sparkles className={`w-10 h-10 text-white transition-all duration-700 ${stage >= 4 ? 'scale-125 text-cyan-300' : 'scale-100'}`} />
          </div>

          {/* Satellite Data Nodes */}
          {[0, 90, 180, 270].map((deg, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)]"
              style={{ 
                transform: `rotate(${deg + (stage * 45)}deg) translate(80px)`,
                transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Initialization HUD */}
      <div className="mt-16 text-center z-30 font-mono">
        <div className="relative inline-block mb-6">
           <div className="absolute -inset-1 bg-blue-500/20 blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative px-8 py-3 bg-black/40 ring-1 ring-white/10 rounded-full leading-none flex items-center space-x-3">
             <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
             <span className="text-[12px] font-black tracking-[0.5em] text-white uppercase italic">
               {glitchText}
             </span>
           </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-72 h-[3px] bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 transition-all duration-1000 ease-in-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              style={{ width: `${(stage / 5) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-8 px-4 opacity-30">
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${stage >= 1 ? 'text-blue-400' : 'text-neutral-700'}`}>
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[8px] font-black tracking-widest uppercase">Kernel</span>
            </div>
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${stage >= 2 ? 'text-blue-400' : 'text-neutral-700'}`}>
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[8px] font-black tracking-widest uppercase">Grid</span>
            </div>
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${stage >= 3 ? 'text-blue-400' : 'text-neutral-700'}`}>
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[8px] font-black tracking-widest uppercase">Axioms</span>
            </div>
            <div className={`flex flex-col items-center gap-1.5 transition-colors ${stage >= 4 ? 'text-blue-400' : 'text-neutral-700'}`}>
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[8px] font-black tracking-widest uppercase">Vault</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-expand {
          0% { transform: scale(0.6); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default AuraSplash;
