
import React, { useState, useEffect } from 'react';
import { 
  Bot, Plus, Play, Pause, Trash2, Settings2, Zap, 
  Activity, Clock, Cpu, Workflow, MessageSquare,
  Shield, Globe, Terminal, Loader2, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AutomatedAgent } from '../../types';
import { AgentService } from '../../services/agentService';
import ModuleLayout from '../ui/ModuleLayout';

const AgentView: React.FC = () => {
  const [agents, setAgents] = useState<AutomatedAgent[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    triggerType: 'manual' as const,
    capabilities: [] as string[]
  });

  useEffect(() => {
    return AgentService.subscribeToAgents(setAgents);
  }, []);

  const handleCreate = async () => {
    if (!newAgent.name) return;
    setLoading(true);
    try {
      await AgentService.createAgent({
        ...newAgent,
        status: 'idle',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${newAgent.name}`,
        triggerConfig: {}
      });
      setIsCreating(false);
      setNewAgent({ name: '', description: '', triggerType: 'manual', capabilities: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (id: string) => {
    await AgentService.runAgent(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Decommission this agent?")) {
      await AgentService.deleteAgent(id);
    }
  };

  return (
    <ModuleLayout title="Agent Forge" subtitle="Autonomous Substrates" icon={Bot} color="purple">
      <div className="p-8 max-w-6xl mx-auto space-y-12">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-purple-600/10 border border-purple-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.15)]">
                 <Bot className="w-10 h-10 text-purple-400 stroke-[1.5]" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white italic tracking-tighter">Automated Agents</h1>
                <p className="text-sm font-medium text-neutral-500 mt-1 uppercase tracking-widest leading-relaxed">
                   Orchestrating autonomous logic chains across the neural substrate.
                </p>
              </div>
           </div>
           <button 
            onClick={() => setIsCreating(true)}
            className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] flex items-center gap-3 active:scale-95 shrink-0"
           >
             <Plus className="w-5 h-5 stroke-[2.5]" />
             Deploy New Agent
           </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Active Agents', value: agents.filter(a => a.status === 'active').length, icon: Activity, color: 'text-emerald-400' },
             { label: 'Total Executions', value: agents.reduce((acc, a) => acc + a.runCount, 0), icon: Zap, color: 'text-amber-400' },
             { label: 'Substrate Health', value: '99.9%', icon: Shield, color: 'text-blue-400' },
             { label: 'Latency', value: '14ms', icon: Clock, color: 'text-purple-400' }
           ].map((stat, i) => (
             <div key={i} className="metallic-card blue p-6 rounded-[2rem] flex items-center gap-5 group hover:border-white/20 transition-all">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                   <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{stat.label}</div>
                   <div className="text-xl font-black text-white mt-1 tracking-tight">{stat.value}</div>
                </div>
             </div>
           ))}
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
             {agents.map((agent) => (
               <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={agent.id} 
                className="metallic-card blue rounded-[3rem] p-8 flex flex-col relative group overflow-hidden"
               >
                 <div className="flex items-start justify-between mb-8">
                    <div className="relative">
                       <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full" />
                       <div className="relative w-20 h-20 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                          <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                       </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${agent.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-neutral-900 border-white/10 text-neutral-500'}`}>
                      {agent.status}
                    </div>
                 </div>

                 <h3 className="text-xl font-black text-white italic tracking-tight mb-2">{agent.name}</h3>
                 <p className="text-xs text-neutral-400 font-medium leading-relaxed mb-8 line-clamp-2">{agent.description}</p>

                 <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                       <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Trigger</div>
                       <div className="text-[10px] font-black text-white uppercase flex items-center gap-2">
                          <Workflow className="w-3 h-3 text-purple-500" />
                          {agent.triggerType}
                       </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                       <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Runs</div>
                       <div className="text-[10px] font-black text-white flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {agent.runCount}
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto flex items-center gap-3">
                    <button 
                      onClick={() => handleRun(agent.id)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                      Execute
                    </button>
                    <button 
                      onClick={() => handleDelete(agent.id)}
                      className="p-4 text-neutral-600 hover:text-red-500 bg-white/5 rounded-2xl border border-white/5 transition-all active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>

                 {/* Hover Glow */}
                 <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-600/5 blur-[80px] rounded-full group-hover:bg-purple-600/10 transition-all duration-700" />
               </motion.div>
             ))}
           </AnimatePresence>

           {agents.length === 0 && !isCreating && (
             <div className="col-span-full py-40 text-center">
                <div className="w-24 h-24 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mx-auto mb-8 opacity-20">
                   <Workflow className="w-10 h-10 text-neutral-500" />
                </div>
                <h3 className="text-xl font-black text-neutral-600 italic uppercase tracking-[0.2em]">No Agents Fabricated</h3>
                <p className="text-xs text-neutral-800 mt-4 font-black uppercase tracking-widest">Awaiting neural instructions for automation.</p>
             </div>
           )}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-xl metallic-card purple p-12 rounded-[4rem] relative overflow-hidden"
               >
                  <div className="flex justify-between items-center mb-10">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-2xl">
                           <Plus className="w-6 h-6 text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Initialize Agent</h2>
                     </div>
                     <button onClick={() => setIsCreating(false)} className="p-3 hover:bg-white/5 rounded-full transition-all"><Trash2 className="w-5 h-5 text-neutral-500" /></button>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.25em] ml-2">Temporal Label</label>
                        <input 
                          type="text" 
                          value={newAgent.name}
                          onChange={e => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Market Neural Pulse"
                          className="w-full bg-black/40 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold outline-none focus:border-purple-500/50 transition-all shadow-inner"
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.25em] ml-2">Neural Directives</label>
                        <textarea 
                          value={newAgent.description}
                          onChange={e => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the agent's core purpose and decision-making logic..."
                          rows={4}
                          className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] px-8 py-6 text-white font-medium outline-none focus:border-purple-500/50 transition-all shadow-inner resize-none overflow-hidden"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.25em] ml-2">Trigger Model</label>
                           <select 
                            value={newAgent.triggerType}
                            onChange={(e: any) => setNewAgent(prev => ({ ...prev, triggerType: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs font-black uppercase tracking-widest outline-none focus:border-purple-500/50"
                           >
                             <option value="manual">Manual Execution</option>
                             <option value="schedule">Kron Scheduler</option>
                             <option value="webhook">Substrate Webhook</option>
                             <option value="rpc">Remote RPC</option>
                           </select>
                        </div>
                        <div className="flex items-end">
                           <button 
                            onClick={handleCreate}
                            disabled={loading || !newAgent.name}
                            className="w-full h-[58px] bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:grayscale rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                           >
                             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Fabricate</>}
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
};

export default AgentView;
