
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, Plus, Settings, Sparkles, Shield, Cpu, Activity, 
  Zap, ShieldCheck, ShieldAlert, Wifi, MessageSquare, BookOpen, Laugh 
} from 'lucide-react';
import { ModelType, UserProfile, Theme } from '../types';
import { telemetryService, TelemetryData } from '../services/telemetryService';
import { haptic, HapticPattern } from '../services/hapticService';

interface TopBarProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  onNewChat: () => void;
  onOpenProfile: () => void;
  onOpenHistory: () => void;
  onOpenPrompts: () => void;
  theme: Theme;
  userProfile: UserProfile;
}

const TopBar: React.FC<TopBarProps> = ({ 
  currentModel, 
  onModelChange, 
  onNewChat, 
  onOpenProfile, 
  onOpenHistory,
  onOpenPrompts,
  userProfile 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  useEffect(() => {
    return telemetryService.subscribe(setTelemetry);
  }, []);

  const modelInfo = {
    [ModelType.GEMINI_FLASH]: { name: 'Gemini 3 Flash', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    [ModelType.GEMINI_PRO]: { name: 'Gemini 3 Pro', icon: <Cpu className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    [ModelType.GEMINI_IMAGE]: { name: 'Imagine Engine', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    [ModelType.GEMINI_INTELLIGENCE]: { name: 'Aura Intelligence', icon: <Activity className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    [ModelType.CREATIVE_WRITING]: { name: 'Creative Writer', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
    [ModelType.CODING_ASSISTANT]: { name: 'Code Assistant', icon: <Cpu className="w-3.5 h-3.5" />, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    [ModelType.GENERAL_KNOWLEDGE]: { name: 'General Knowledge', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    [ModelType.HUMOROUS_COMPANION]: { name: 'Humorous Companion', icon: <Laugh className="w-3.5 h-3.5" />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    [ModelType.FRIENDLY_ASSISTANT]: { name: 'Friendly Assistant', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    [ModelType.PROFESSIONAL_TONE]: { name: 'Professional Tone', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    [ModelType.WITTY_COMPANION]: { name: 'Witty Companion', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
  };

  const coherence = telemetry?.coherence || 100;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-[90] glass-morphic bg-black/40 backdrop-blur-3xl flex items-center justify-between px-8 pt-safe border-b border-white/10">
      <div className="flex items-center gap-6">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenProfile}
          className="relative group shrink-0"
        >
          <div className={`absolute inset-0 blur-xl opacity-30 group-hover:opacity-60 transition-all rounded-full ${coherence > 70 ? 'bg-blue-500' : 'bg-amber-500'}`} />
          <img 
            src={userProfile.avatarUrl} 
            alt="User" 
            className="relative w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-2xl" 
            referrerPolicy="no-referrer"
          />
        </motion.button>
        
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              haptic.trigger(HapticPattern.UI_INTERACT);
            }}
            className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all shadow-lg group"
          >
            <div className={`p-1.5 rounded-lg bg-black border border-white/5 ${modelInfo[currentModel].color}`}>
               {modelInfo[currentModel].icon}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${modelInfo[currentModel].color}`}>
              {modelInfo[currentModel].name}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-600 transition-transform group-hover:text-white ${isMenuOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-3 w-64 glass-morphic rounded-3xl overflow-hidden shadow-2xl p-2 ring-1 ring-white/10"
              >
                {Object.values(ModelType).map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      onModelChange(model);
                      setIsMenuOpen(false);
                      haptic.trigger(HapticPattern.SUCCESS);
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${coherence > 70 ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-amber-600/10 border-amber-500/20 text-amber-400'}`}>
           {coherence > 70 ? <Wifi className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
           <span className="text-[9px] font-black uppercase tracking-widest">{coherence}%</span>
        </div>

        <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />

        <div className="flex items-center gap-2">
          {[
            { icon: <BookOpen className="w-5 h-5" />, onClick: onOpenPrompts, title: "Custom Prompts" },
            { icon: <MessageSquare className="w-5 h-5" />, onClick: onOpenHistory, title: "Chat History" },
            { icon: <Plus className="w-5 h-5" />, onClick: onNewChat, title: "New Chat" },
            { icon: <Settings className="w-5 h-5" />, onClick: onOpenProfile, title: "Settings" }
          ].map((btn, i) => (
            <motion.button 
              key={i}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                btn.onClick();
                haptic.trigger(HapticPattern.UI_INTERACT);
              }}
              className="p-2.5 text-neutral-400 hover:text-white bg-white/5 border border-white/5 rounded-2xl transition-all shadow-sm"
              title={btn.title}
            >
              {btn.icon}
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
