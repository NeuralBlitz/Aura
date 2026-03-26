import React, { useState, useEffect } from 'react';
import { Maximize2, Minus, X, Activity, Cpu } from 'lucide-react';

interface ModuleLayoutProps {
  title: string;
  subtitle?: string;
  status?: string;
  icon: React.ElementType;
  color?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

const ModuleLayout: React.FC<ModuleLayoutProps> = ({ 
  title, 
  subtitle,
  status = 'ONLINE',
  icon: Icon, 
  color = 'blue', 
  onClose, 
  children 
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const colorMap: Record<string, { bg: string, text: string, border: string, glow: string }> = {
    blue: { bg: 'from-blue-900/20 to-transparent', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
    purple: { bg: 'from-purple-900/20 to-transparent', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
    emerald: { bg: 'from-emerald-900/20 to-transparent', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
    amber: { bg: 'from-amber-900/20 to-transparent', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' },
    red: { bg: 'from-red-900/20 to-transparent', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' },
    cyan: { bg: 'from-cyan-900/20 to-transparent', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]' },
    pink: { bg: 'from-pink-900/20 to-transparent', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]' },
    neutral: { bg: 'from-neutral-800/20 to-transparent', text: 'text-neutral-400', border: 'border-neutral-500/30', glow: 'shadow-[0_0_15px_rgba(163,163,163,0.5)]' },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className={`flex flex-col ${isMaximized ? 'fixed inset-0 z-50' : 'h-full w-full'} bg-black/40 backdrop-blur-3xl animate-fade-in relative overflow-hidden font-sans border border-white/10 rounded-3xl shadow-2xl`}>
      {/* Background Grid & Scanline */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* OS Window Chrome */}
      <div className={`flex-none h-20 border-b ${theme.border} flex items-center justify-between px-6 select-none relative z-20 bg-black/60 backdrop-blur-2xl`}>
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl bg-black border ${theme.border} ${theme.glow} relative overflow-hidden group shadow-lg`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <Icon className={`w-6 h-6 ${theme.text} relative z-10`} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-black uppercase tracking-[0.5em] text-white">
                {title}
              </span>
              <div className={`px-3 py-1 rounded-full border ${theme.border} bg-black/40 flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${theme.text.replace('text-', 'bg-')} animate-pulse`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>{status}</span>
              </div>
            </div>
            {subtitle && (
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-[0.3em] mt-1">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        
        {/* Window Controls */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-4 mr-4 px-4 py-1 border-r border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
              <Cpu className="w-3 h-3" />
              <span>SYS.MEM: {Math.floor(Math.random() * 40 + 20)}%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
              <Activity className="w-3 h-3" />
              <span>NET.LAT: {Math.floor(Math.random() * 20 + 5)}ms</span>
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-neutral-500 hover:text-white transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Ambient Header Glow */}
      <div className={`absolute top-16 left-0 right-0 h-40 bg-gradient-to-b ${theme.bg} pointer-events-none z-10 opacity-40`} />

      {/* Module Content Area */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default ModuleLayout;
