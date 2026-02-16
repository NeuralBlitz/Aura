
import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Settings, Sparkles, Shield, Cpu, Activity, Zap, ShieldCheck, ShieldAlert, Wifi } from 'lucide-react';
import { ModelType, UserProfile, Theme } from '../types';
import { telemetryService, TelemetryData } from '../services/telemetryService';

interface TopBarProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  onNewChat: () => void;
  onOpenProfile: () => void;
  theme: Theme;
  userProfile: UserProfile;
}

const TopBar: React.FC<TopBarProps> = ({ 
  currentModel, 
  onModelChange, 
  onNewChat, 
  onOpenProfile, 
  userProfile 
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  useEffect(() => {
    return telemetryService.subscribe(setTelemetry);
  }, []);

  const modelInfo = {
    [ModelType.GEMINI_FLASH]: { name: 'Gemini 3 Flash', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    [ModelType.GEMINI_PRO]: { name: 'Gemini 3 Pro', icon: <Cpu className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    [ModelType.GEMINI_IMAGE]: { name: 'Imagine Engine', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    [ModelType.GEMINI_INTELLIGENCE]: { name: 'Aura Intelligence', icon: <Activity className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
  };

  const coherence = telemetry?.coherence || 100;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-[90] glass-morphic flex items-center justify-between px-6 pt-safe border-b border-white/5 transition-colors duration-1000">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenProfile}
          className="relative group active:scale-90 transition-transform shrink-0"
        >
          <div className={`absolute inset-0 blur-md opacity-20 group-hover:opacity-40 transition-all rounded-full ${coherence > 70 ? 'bg-blue-500' : 'bg-amber-500'}`} />
          <img src={userProfile.avatarUrl} alt="User" className="relative w-9 h-9 rounded-full object-cover border border-white/20 shadow-lg" />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all shadow-sm"
          >
            <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${modelInfo[currentModel].color}`}>
              {modelInfo[currentModel].name}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-600 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-3 w-64 glass-morphic rounded-3xl overflow-hidden shadow-2xl animate-scale-in p-2 ring-1 ring-white/10">
              {Object.values(ModelType).map((model) => (
                <button
                  key={model}
                  onClick={() => {
                    onModelChange(model);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all hover:bg-white/10 ${currentModel === model ? 'bg-white/5 text-white' : 'text-neutral-500'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-black border border-white/5 ${currentModel === model ? modelInfo[model].color : ''}`}>
                       {modelInfo[model].icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-black text-[10px] uppercase tracking-widest">{modelInfo[model].name}</span>
                      <span className="text-[8px] text-neutral-600 font-bold uppercase">v7.0 Engine</span>
                    </div>
                  </div>
                  {currentModel === model && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Coherence Indicator */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${coherence > 70 ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-amber-600/10 border-amber-500/20 text-amber-400'}`}>
           {coherence > 70 ? <Wifi className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
           <span className="text-[9px] font-black uppercase tracking-widest">{coherence}%</span>
        </div>

        <button 
          onClick={onNewChat}
          className="p-2.5 text-neutral-400 hover:text-white bg-white/5 border border-white/5 rounded-2xl transition-all active:scale-90 shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button 
          onClick={onOpenProfile}
          className="p-2.5 text-neutral-400 hover:text-white bg-white/5 border border-white/5 rounded-2xl transition-all active:scale-90 shadow-sm"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default TopBar;
