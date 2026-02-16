
import React from 'react';
import { Image, MapPin, Settings, Mic, Sparkles, Activity, Search, ImageIcon } from 'lucide-react';
import { QuickActionType } from '../types';

interface QuickActionsProps {
  onAction: (action: QuickActionType | 'market') => void;
  activeActionId?: QuickActionType | null;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction, activeActionId }) => {
  const actions = [
    { id: 'aura-live', label: 'Aura Live', icon: Mic, desc: 'Real-time link', color: 'text-purple-400', glow: 'shadow-purple-500/20' },
    { id: 'nearby-search', label: 'Explore', icon: MapPin, desc: 'Maps & nodes', color: 'text-red-400', glow: 'shadow-red-500/20' },
    { id: 'create-image', label: 'Imagine', icon: ImageIcon, desc: 'Neural art', color: 'text-pink-400', glow: 'shadow-pink-500/20' },
    // Routed to 'market' tab instead of generic 'analyze-data'
    { id: 'market', label: 'Insights', icon: Activity, desc: 'Data streams', color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    { id: 'settings', label: 'Configure', icon: Settings, desc: 'Neural prefs', color: 'text-blue-400', glow: 'shadow-blue-500/20' },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-6 pt-2">
      <div className="flex gap-4 px-6 min-w-max">
        {actions.map((action, idx) => {
          const isActive = activeActionId === action.id;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id as any)}
              className={`flex flex-col items-start justify-between p-5 w-40 h-32 glass-morphic border rounded-[2rem] transition-all duration-300 text-left group animate-slide-up relative overflow-hidden active:scale-95
                ${isActive 
                  ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_15px_35px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <div className="absolute top-0 right-0 p-10 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 animate-pulse" />
              )}

              <div className={`p-3 rounded-xl bg-black border border-white/5 transition-all group-hover:scale-110 ${isActive ? 'text-blue-400 border-blue-500/20 shadow-lg' : action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>

              <div className="relative z-10">
                <span className={`block font-black text-[13px] leading-tight tracking-tight transition-colors mb-0.5 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                  {action.label}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-400/60' : 'text-neutral-600'}`}>
                  {action.desc}
                </span>
              </div>

              {/* Selection Bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
