
import React, { useEffect, useRef } from 'react';
import { Eye, Sparkles } from 'lucide-react';

const DreamStreamView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    let frameId: number;

    const animate = () => {
      t += 0.01;
      const width = canvas.width;
      const height = canvas.height;
      
      // Dreamy background clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Procedural abstract shapes
      for(let i = 0; i < 5; i++) {
        const x = width/2 + Math.cos(t * (i+1) * 0.5) * (width/3);
        const y = height/2 + Math.sin(t * (i+1) * 0.3) * (height/3);
        const size = Math.abs(Math.sin(t + i)) * 100 + 50;
        
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `hsla(${(t * 50 + i * 60) % 360}, 70%, 50%, 0.1)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      frameId = requestAnimationFrame(animate);
    };

    // Resize handling
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="pt-6 pb-48 px-6 max-w-4xl mx-auto animate-fade-in font-sans h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-[1.8rem] shadow-xl">
           <Eye className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">DreamStream</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Oneiric Visualization Engine</p>
        </div>
      </div>

      <div className="flex-1 glass-morphic border border-white/5 rounded-[3rem] relative overflow-hidden group shadow-2xl">
         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
         <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-full flex items-center gap-4">
               <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
               <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Rendering Subconscious...</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DreamStreamView;
