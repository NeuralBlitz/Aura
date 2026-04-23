
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AURA_MODULES } from '../ModuleRegistry';
import { UserPreferences, UserProfile, Tab, ModuleDefinition } from '../../types';
import ModuleLayout from '../ui/ModuleLayout';
import { 
  Search, Clock, Sparkles, Activity, Zap, 
  TrendingUp, Cpu, Gauge, Globe, Shield, Newspaper,
  ChevronRight, ListChecks, Fingerprint, Network, ShieldCheck
} from 'lucide-react';
import { haptic, HapticPattern } from '../../services/hapticService';

interface NexusViewProps {
  preferences: UserPreferences;
  userProfile: UserProfile;
  onLaunch: (id: Tab) => void;
}

interface ModuleCardProps {
  module: ModuleDefinition;
  onLaunch: (id: Tab) => void;
  index: number;
}

const getColorName = (tailwindColor: string) => {
  if(tailwindColor.includes('blue')) return 'blue';
  if(tailwindColor.includes('purple')) return 'purple';
  if(tailwindColor.includes('emerald')) return 'emerald';
  if(tailwindColor.includes('green')) return 'emerald';
  if(tailwindColor.includes('amber')) return 'amber';
  if(tailwindColor.includes('orange')) return 'amber';
  if(tailwindColor.includes('red')) return 'red';
  if(tailwindColor.includes('pink')) return 'pink';
  if(tailwindColor.includes('cyan')) return 'cyan';
  return 'blue'; // default
};

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onLaunch, index }) => (
  <motion.button 
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      onLaunch(module.id as Tab);
      haptic.trigger(HapticPattern.SUCCESS);
    }}
    className={`metallic-card ${getColorName(module.color)} flex flex-col items-center gap-4 p-6 rounded-[2.5rem] group transition-all relative overflow-hidden h-full justify-between shadow-lg hover:shadow-2xl`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    <div className={`w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-lg transition-all relative overflow-hidden ${module.color}`}>
       <div className="absolute inset-0 bg-current opacity-[0.1] group-hover:opacity-[0.2] transition-opacity" />
       <module.icon className="w-7 h-7 relative z-10 group-hover:rotate-3 transition-transform drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
    </div>
    <div className="text-center relative z-10">
      <span className="text-[10px] font-black text-neutral-400 group-hover:text-white transition-colors uppercase tracking-[0.2em]">{module.name}</span>
    </div>
  </motion.button>
);

const NexusView: React.FC<NexusViewProps> = ({ preferences, userProfile, onLaunch }) => {
  return (
    <ModuleLayout title="Nexus" subtitle="Universal Substrate" status="ONLINE" icon={Network} color="blue">
      <div className="pt-6 pb-40 px-6 font-sans max-w-7xl mx-auto h-full overflow-y-auto no-scrollbar w-full">
        {/* Search HUD */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-16 group"
        >
          <div className="absolute inset-0 bg-blue-500/5 blur-[100px] opacity-50 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Accessing Universal Substrate..." 
            className="w-full metallic-card blue bg-black/40 rounded-[3rem] py-7 pl-20 pr-8 text-sm font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/30 transition-all shadow-2xl"
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5 opacity-40">
             <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest italic">CMD + K</span>
          </div>
        </motion.div>

        {/* Identity Cockpit HUD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative group mb-20"
        >
          <div className="absolute inset-0 bg-blue-600/5 blur-[150px] opacity-30 animate-pulse group-hover:opacity-50 transition-all" />
          <div className="relative metallic-card blue rounded-[4rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden bg-black/20 shadow-2xl">
             <div className="absolute top-0 right-0 p-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Globe className="w-80 h-80 text-blue-500" />
             </div>
             
             <div className="flex items-center gap-12 z-10 w-full lg:w-auto">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 rounded-full animate-pulse" />
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src={userProfile.avatarUrl} 
                    alt="Avatar" 
                    className="relative w-36 h-36 rounded-[3rem] border-4 border-white/5 shadow-2xl transition-transform duration-700 object-cover bg-black" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-blue-600 rounded-[1.5rem] border-4 border-[#050505] flex items-center justify-center shadow-2xl">
                     <Zap className="w-7 h-7 text-white fill-current drop-shadow-lg" />
                  </div>
                </div>
                <div className="space-y-6 flex-1">
                   <div className="flex items-center gap-5">
                      <h2 className="text-5xl font-black text-white tracking-tighter italic drop-shadow-xl">{userProfile.username}</h2>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Architect</span>
                         <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Level {userProfile.level}</span>
                      </div>
                   </div>
                   <div className="space-y-3 max-w-md">
                      <div className="flex items-center justify-between text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                         <span>Intelligence Sync</span>
                         <span className="text-blue-400">{userProfile.exp} / 10,000 XP</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(userProfile.exp/10000)*100}%` }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.6)] relative"
                         >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                         </motion.div>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-5 w-full lg:w-auto z-10">
                {[
                  { icon: Gauge, label: 'Throughput', value: '4.2 TB/s', color: 'text-blue-500', glow: 'rgba(59,130,246,0.5)' },
                  { icon: TrendingUp, label: 'Coherence', value: '99.4%', color: 'text-emerald-500', glow: 'rgba(16,185,129,0.5)' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="p-8 bg-black/30 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center group/card transition-all shadow-lg backdrop-blur-md"
                  >
                    <stat.icon className={`w-10 h-10 ${stat.color} mb-4 group-hover/card:animate-pulse drop-shadow-[0_0_10px_${stat.glow}]`} />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center">{stat.label}</span>
                    <span className="text-xl font-black text-white mt-1 italic tracking-tight">{stat.value}</span>
                  </motion.div>
                ))}
             </div>
          </div>
        </motion.div>

        {/* Universal Substrate Mesh */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-12 px-4">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-neutral-400">Substrate Module Grid</h3>
             </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6">
             <motion.button 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               whileHover={{ scale: 1.05, y: -5 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 onLaunch('home');
                 haptic.trigger(HapticPattern.SUCCESS);
               }}
               className="metallic-card blue flex flex-col items-center gap-4 p-6 rounded-[2.5rem] group transition-all h-full justify-between shadow-lg hover:shadow-2xl"
             >
               <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-xl text-blue-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-current opacity-[0.1]" />
                  <Zap className="w-7 h-7 relative z-10 group-hover:animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
               </div>
               <span className="text-[10px] font-black text-neutral-400 group-hover:text-white uppercase tracking-[0.2em] transition-colors">Neural Chat</span>
             </motion.button>
            {AURA_MODULES.map((module, i) => (
              <ModuleCard key={module.id} module={module} onLaunch={onLaunch} index={i + 1} />
            ))}
          </div>
        </div>

        {/* Engine Vitals & Activity Trace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="metallic-card purple rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl"
           >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Cpu className="w-48 h-48 text-purple-500" />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-lg">
                       <Cpu className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Runtime Vitals</h3>
                 </div>
                 <span className="text-[9px] font-black text-green-400 bg-green-500/10 px-4 py-1.5 rounded-xl border border-green-500/20 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">Optimized</span>
              </div>
              <div className="space-y-8 relative z-10">
                 {[
                   { label: 'Intelligence Ingest', value: '1.2M Tokens', pct: 88, color: 'bg-blue-500' },
                   { label: 'Encryption Entropy', value: '256-bit GCM', pct: 100, color: 'bg-emerald-500' },
                   { label: 'Context Window', value: 'Ready', pct: 74, color: 'bg-purple-500' }
                 ].map((stat, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                         <span className="text-neutral-500 uppercase tracking-widest">{stat.label}</span>
                         <span className="text-white italic tracking-wide">{stat.value}</span>
                      </div>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${stat.pct}%` }}
                           transition={{ duration: 1.2, delay: i * 0.1 }}
                           className={`h-full ${stat.color} shadow-[0_0_15px_rgba(0,0,0,0.5)] relative`}
                         >
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50" />
                         </motion.div>
                      </div>
                   </div>
                 ))}
              </div>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="metallic-card amber rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl"
           >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Clock className="w-48 h-48 text-amber-500" />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-lg">
                       <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Activity Trace</h3>
                 </div>
              </div>
              <div className="space-y-4 relative z-10">
                 {[
                   { title: 'Project Grid Synchronized', time: '2m ago', icon: ListChecks, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                   { title: 'Identity Vault Rotation', time: '1h ago', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                   { title: 'News Buffer Ingested', time: '3h ago', icon: Newspaper, color: 'text-neutral-400', bg: 'bg-neutral-500/10' }
                 ].map((recent, i) => (
                   <motion.div 
                     key={i}
                     whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                     whileTap={{ scale: 0.98 }}
                     className="flex items-center gap-6 p-5 bg-black/20 rounded-[2rem] border border-white/5 group/row transition-all cursor-pointer shadow-lg"
                   >
                      <div className={`p-3 rounded-2xl border border-white/5 ${recent.bg} ${recent.color} group-hover/row:scale-110 transition-transform`}>
                         <recent.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <h4 className="text-xs font-black text-white tracking-tight group-hover/row:text-blue-400 transition-colors">{recent.title}</h4>
                         <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.15em] mt-1">{recent.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover/row:text-white transition-colors" />
                   </motion.div>
                 ))}
              </div>
           </motion.div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default NexusView;
