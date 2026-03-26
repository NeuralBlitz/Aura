
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Square, RefreshCcw, Coffee, Zap, Activity, Brain, Clock, ShieldAlert } from 'lucide-react';
import { haptic, HapticPattern } from '../../services/hapticService';
import ModuleLayout from '../ui/ModuleLayout';

const FocusView: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [totalSessions, setTotalSessions] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    haptic.trigger(HapticPattern.SUCCESS);
    if (mode === 'focus') {
      setTotalSessions(s => s + 1);
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      setMode('focus');
      setTimeLeft(25 * 60);
    }
    alert(`${mode === 'focus' ? 'Session Complete' : 'Break Over'}. Syncing logic mesh...`);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    haptic.trigger(HapticPattern.UI_INTERACT);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ModuleLayout
      title="Focus Substrate"
      subtitle="Cognitive Linearity"
      status={isActive ? "ACTIVE" : "STANDBY"}
      icon={Timer}
      color={isActive ? "orange" : "blue"}
    >
      <div className="max-w-2xl mx-auto p-8 h-full overflow-y-auto no-scrollbar text-center w-full">
        <div className="relative mb-20 group">
           <div className={`absolute inset-0 blur-[150px] opacity-10 transition-colors duration-1000 ${isActive ? 'bg-orange-500' : 'bg-blue-500'}`} />
           
           <div className="relative inline-block">
              <div className="absolute -inset-8 bg-white/[0.02] border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
              <div className={`relative w-72 h-72 rounded-full glass-morphic flex flex-col items-center justify-center border-2 transition-all duration-700 ${isActive ? 'border-orange-500/40 shadow-[0_0_80px_rgba(249,115,22,0.15)] scale-105' : 'border-white/10 shadow-2xl'}`}>
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-4">{mode} Substrate</span>
                 <h1 className="text-7xl font-black text-white tracking-tighter tabular-nums italic">
                   {formatTime(timeLeft)}
                 </h1>
                 <div className="mt-6 flex items-center gap-2">
                    <Activity className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500 animate-pulse' : 'text-neutral-700'}`} />
                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{isActive ? 'Causal Flow Active' : 'System Standby'}</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-center gap-6 mb-16">
           <button 
             onClick={toggleTimer}
             className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all active:scale-90 shadow-2xl ${isActive ? 'bg-white/5 text-white border border-white/10' : 'bg-blue-600 text-white shadow-blue-600/30'}`}
           >
             {isActive ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
           </button>
           <button 
             onClick={resetTimer}
             className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white/5 text-neutral-500 border border-white/5 transition-all hover:text-white active:scale-90"
           >
             <RefreshCcw className="w-8 h-8" />
           </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="glass-morphic bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                 <Brain className="w-5 h-5 text-purple-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Focus Density</span>
              </div>
              <p className="text-2xl font-black text-white italic">{totalSessions}</p>
              <p className="text-[9px] text-neutral-600 font-bold uppercase mt-1">Sessions Synced</p>
           </div>
           <div className="glass-morphic bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                 <Clock className="w-5 h-5 text-blue-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Temporal Cap</span>
              </div>
              <p className="text-2xl font-black text-white italic">25<span className="text-sm font-bold text-neutral-700">m</span></p>
              <p className="text-[9px] text-neutral-600 font-bold uppercase mt-1">Logic Standard</p>
           </div>
        </div>

        <div className="mt-12 p-6 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 flex items-center gap-5 group">
           <ShieldAlert className="w-10 h-10 text-orange-500/40 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] text-neutral-500 font-medium leading-relaxed text-left">
              Focus Substrate locks notification interrupts and enforces cognitive linearity. Deep work cycles are verified via the Veritas v4.2 causal trace.
           </p>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default FocusView;
