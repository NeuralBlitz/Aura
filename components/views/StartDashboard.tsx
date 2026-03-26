
import React from 'react';
import { 
  Sparkles, ImageIcon, Search, Mic, ArrowRight, 
  TrendingUp, Activity, Cpu, Shield, Zap, LayoutGrid, Fingerprint, Network, Terminal, BookOpen,
  Home
} from 'lucide-react';
import { ModelType } from '../../types';
import SystemMonitor from '../SystemMonitor';
import ModuleLayout from '../ui/ModuleLayout';

interface StartDashboardProps {
  onAction: (prompt: string, model?: ModelType, actionType?: string) => void;
  userParams: {
    username: string;
  };
}

const StartDashboard: React.FC<StartDashboardProps> = ({ onAction, userParams }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Welcome back' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const neuralShortcuts = [
    { label: 'Morning Intel', icon: Network, color: 'text-blue-400', prompt: 'Give me a summary of my latest projects and news.' },
    { label: 'Solve Visual', icon: Fingerprint, color: 'text-emerald-400', prompt: 'Analyze my last uploaded image and suggest code.' },
    { label: 'Forge Draft', icon: Terminal, color: 'text-purple-400', prompt: 'Open a new spatial artifact template.' },
    { label: 'Neural Scan', icon: Search, color: 'text-amber-400', prompt: 'Scan global web traffic for AI trends.' },
    { label: 'Custom Prompts', icon: BookOpen, color: 'text-cyan-400', actionType: 'prompts' },
  ];

  return (
    <ModuleLayout 
      title="Aura OS" 
      subtitle="Neural Substrate Dashboard" 
      status="SYSTEM NOMINAL" 
      icon={Home} 
      color="blue"
    >
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center px-8 pt-16 pb-40 animate-fade-in max-w-2xl mx-auto w-full">
          {/* Central Visual Core */}
          <div className="relative mb-16 group">
            <div className="absolute inset-0 bg-blue-600 blur-[120px] opacity-20 animate-pulse group-hover:opacity-40 transition-all" />
            <div className="relative w-32 h-32 glass-morphic rounded-[3rem] bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl transition-all hover:scale-110 duration-700">
              <Sparkles className="w-14 h-14 text-white animate-pulse" />
              <div className="absolute -top-2 -right-2 w-12 h-12 glass-morphic rounded-2xl flex items-center justify-center animate-spin-slow border-white/20">
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">
              {greeting}, <span className="text-blue-500">{userParams.username.split(' ')[0]}</span>
            </h1>
            <div className="flex flex-col items-center gap-2">
               <div className="flex items-center justify-center gap-3">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.4em]">Neural Substrate_v9.0_Operational</p>
               </div>
            </div>
          </div>

          <SystemMonitor />

          {/* Neural Intent Matrix (Shortcuts) */}
          <div className="w-full mb-16">
            <div className="flex items-center gap-3 mb-6 px-2">
              <LayoutGrid className="w-4 h-4 text-neutral-700" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700">Intent Matrix</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {neuralShortcuts.map((sc, i) => (
                <button 
                  key={i}
                  onClick={() => onAction(sc.prompt || '', undefined, sc.actionType)}
                  className="flex flex-col items-center gap-4 p-5 glass-morphic bg-white/[0.01] border-white/5 hover:border-blue-500/40 rounded-[2rem] transition-all active:scale-90 group"
                >
                   <div className={`p-3.5 rounded-2xl bg-black border border-white/5 group-hover:scale-110 transition-transform ${sc.color}`}>
                      <sc.icon className="w-5 h-5" />
                   </div>
                   <span className="text-[7px] font-black uppercase tracking-[0.2em] text-neutral-500 text-center leading-tight">{sc.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-16">
            {[
              { label: 'Deep Search', icon: Search, color: 'text-blue-400', model: ModelType.GEMINI_PRO, prompt: 'Logical analysis of...', desc: 'Research Link' },
              { label: 'Imagine Engine', icon: ImageIcon, color: 'text-pink-400', model: ModelType.GEMINI_IMAGE, prompt: 'Cinematic render of...', desc: 'Art Pipeline' },
              { label: 'Neural Art', icon: Activity, color: 'text-emerald-400', model: ModelType.GEMINI_INTELLIGENCE, prompt: 'Neural status of...', desc: 'State Scan' },
              { label: 'Aura Live', icon: Mic, color: 'text-purple-400', actionType: 'live', desc: 'Voice Interface' },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => onAction(action.prompt || '', action.model, action.actionType)}
                className="flex flex-col items-start gap-6 p-7 glass-morphic bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-blue-500/40 transition-all text-left active:scale-[0.98] rounded-[2.8rem] group relative overflow-hidden"
              >
                <div className={`p-4 rounded-2xl bg-black border border-white/5 group-hover:scale-110 transition-transform shadow-lg ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <span className="block font-black text-[15px] text-white tracking-tight mb-1 group-hover:text-blue-500 transition-colors">
                    {action.label}
                  </span>
                  <span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">{action.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default StartDashboard;
