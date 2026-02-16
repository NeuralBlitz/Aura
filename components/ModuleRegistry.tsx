
import React from 'react';
import { 
  BookOpen, BrainCircuit, Layout, Code2, Sparkles, Terminal, 
  Layers, Search, Globe, Shield, Mic, Zap, ListChecks, 
  Presentation, GraduationCap, Wallet, Activity,
  Newspaper, Users, GitMerge, Library, Wifi, Key, 
  Timer, Calculator, ShieldCheck, Languages, BookMarked,
  TrendingUp, Music, CloudRain, Calendar, Link2, Monitor,
  Eye, Lock, Clock, Radio, Trash2, Edit3, Anchor, Hourglass
} from 'lucide-react';
import { ModuleDefinition, Tab } from '../types';

export const AURA_MODULES: ModuleDefinition[] = [
  // New Deca-Core Modules
  { id: 'dreamstream', name: 'DreamStream', description: 'Oneiric visualizer for abstract thought rendering.', icon: Eye, color: 'text-purple-400', category: 'creative' },
  { id: 'cipher', name: 'Cipher-X', description: 'Neural steganography and message encryption.', icon: Lock, color: 'text-red-400', category: 'system' },
  { id: 'biolink', name: 'Bio-Link', description: 'Circadian rhythm analysis and cognitive scheduling.', icon: Activity, color: 'text-green-400', category: 'personal' },
  { id: 'echo', name: 'Echo Mirror', description: 'Psychometric radar for personality reflection.', icon: BrainCircuit, color: 'text-pink-400', category: 'personal' },
  { id: 'signal', name: 'Signal Tuner', description: 'Latent space radio for random knowledge bursts.', icon: Radio, color: 'text-cyan-400', category: 'creative' },
  { id: 'void', name: 'Void Bin', description: 'Entropy shredder for ephemeral thought destruction.', icon: Trash2, color: 'text-neutral-400', category: 'utility' },
  { id: 'style', name: 'Style Matrix', description: 'Protocol droid for instant tone shifting.', icon: Edit3, color: 'text-blue-400', category: 'utility' },
  { id: 'loom', name: 'Idea Loom', description: 'Generative weaver for conceptual intersections.', icon: Layers, color: 'text-orange-400', category: 'creative' },
  { id: 'capsule', name: 'Chrono-Capsule', description: 'Time-locked vaults for future message retrieval.', icon: Hourglass, color: 'text-amber-400', category: 'personal' },
  { id: 'zenith', name: 'Zenith', description: 'Resonance anchor for haptic breathwork.', icon: Anchor, color: 'text-emerald-400', category: 'health' },

  // Existing Modules
  { id: 'weather', name: 'Atmospherics', description: 'Hyper-local weather telemetry and prediction.', icon: CloudRain, color: 'text-blue-400', category: 'personal' },
  { id: 'calendar', name: 'Temporal Bridge', description: 'Neural schedule optimization and timeline management.', icon: Calendar, color: 'text-orange-400', category: 'productivity' },
  { id: 'browser', name: 'Quantum Browser', description: 'Headless DOM parser for deep web extraction.', icon: Monitor, color: 'text-emerald-400', category: 'technical' },
  { id: 'webhook', name: 'Logic Gate', description: 'API payload constructor and webhook testing.', icon: Link2, color: 'text-pink-400', category: 'technical' },
  { id: 'market', name: 'Market Substrate', description: 'Real-time financial intelligence and crypto tickers.', icon: TrendingUp, color: 'text-emerald-400', category: 'personal' },
  { id: 'sonic', name: 'Sonic Architecture', description: 'Ambient neural audio and binaural focus tools.', icon: Music, color: 'text-indigo-400', category: 'creative' },
  { id: 'news', name: 'Intel Ingest', description: 'Real-time tech and AI intelligence ingest.', icon: Newspaper, color: 'text-blue-500', category: 'productivity' },
  { id: 'focus', name: 'Focus Node', description: 'Logic-locked Pomodoro focus session substrate.', icon: Timer, color: 'text-orange-500', category: 'productivity' },
  { id: 'network', name: 'Network Intel', description: 'Deep scan of local and global connection nodes.', icon: Wifi, color: 'text-cyan-500', category: 'technical' },
  { id: 'utility', name: 'Aura Utility', description: 'Swiss-army knife of neural converters and forgers.', icon: Calculator, color: 'text-emerald-500', category: 'personal' },
  { id: 'translate', name: 'Neural Translate', description: 'Real-time multi-language logic bridge.', icon: Languages, color: 'text-pink-500', category: 'personal' },
  { id: 'health', name: 'Deep Scan', description: 'Animated system integrity and security verification.', icon: ShieldCheck, color: 'text-emerald-400', category: 'system' },
  { id: 'library', name: 'Prompt Codex', description: 'High-performance prompt and snippet library.', icon: BookMarked, color: 'text-purple-400', category: 'technical' },
  { id: 'forums', name: 'Community Mesh', description: 'Collaborative substrate logic and discussions.', icon: Users, color: 'text-emerald-500', category: 'community' },
  { id: 'scriptorium', name: 'Knowledge Codex', description: 'The official NeuralBlitz technical compendium.', icon: Library, color: 'text-purple-500', category: 'technical' },
  { id: 'projects', name: 'Project Board', description: 'High-fidelity Kanban substrate for task management.', icon: ListChecks, color: 'text-blue-400', category: 'productivity' },
  { id: 'notes', name: 'Neural Codex', description: 'Markdown-based knowledge repository.', icon: BookOpen, color: 'text-cyan-400', category: 'productivity' },
  { id: 'forge', name: 'Substrate Forge', description: 'Advanced code execution and spatial preview sandbox.', icon: Terminal, color: 'text-white', category: 'technical' },
  { id: 'changelog', name: 'System Logs', description: 'Track the evolution of the Aura Unified Substrate.', icon: GitMerge, color: 'text-orange-500', category: 'technical' }
];

interface MarketplaceProps {
  installedIds: string[];
  onInstall: (id: string) => void;
  onLaunch: (id: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ installedIds, onInstall, onLaunch }) => {
  return (
    <div className="pt-6 pb-40 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Substrate Exchange</h1>
        <p className="text-sm text-neutral-500 font-medium">Extend the capabilities of your neural interface with modular substrate logic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AURA_MODULES.map((module) => {
          const isInstalled = installedIds.includes(module.id);
          return (
            <div 
              key={module.id}
              className="glass-card flex flex-col p-8 rounded-[2.5rem] group active:scale-[0.98] relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-black border border-white/5 shadow-xl transition-transform group-hover:scale-110 ${module.color}`}>
                  <module.icon className="w-8 h-8" />
                </div>
                {isInstalled ? (
                   <button 
                    onClick={() => onLaunch(module.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                   >
                     Launch
                   </button>
                ) : (
                   <button 
                    onClick={() => onInstall(module.id)}
                    className="px-6 py-2 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                   >
                     Install
                   </button>
                )}
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-blue-500 transition-colors">{module.name}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium line-clamp-2">{module.description}</p>
              
              <div className="mt-8 flex items-center gap-3">
                 <span className="text-[9px] font-black uppercase tracking-widest text-neutral-700 bg-neutral-900 px-3 py-1 rounded-lg">{module.category}</span>
                 {module.isBeta && <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">Beta</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;
