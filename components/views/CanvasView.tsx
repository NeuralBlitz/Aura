
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Network, Share2, Activity, Play, Square, Settings, 
  Plus, Search, Database, Globe, Cpu, Layout, Layers
} from 'lucide-react';
import { INTEGRATION_MESH } from '../../services/toolRegistry';

interface Node {
  id: string;
  type: string;
  label: string;
  status: 'idle' | 'running' | 'error';
  x: number;
  y: number;
}

const CanvasView: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'trigger', label: 'WhatsApp Webhook', status: 'idle', x: 50, y: 50 },
    { id: '2', type: 'agent', label: 'Router Logic', status: 'running', x: 250, y: 150 },
    { id: '3', type: 'tool', label: 'Notion Sync', status: 'idle', x: 450, y: 50 }
  ]);
  const [activeTab, setActiveTab] = useState<'flow' | 'mesh' | 'logs'>('flow');

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-3xl overflow-hidden font-mono">
      {/* Canvas Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Network className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Agent Mesh Control</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Control Plane // Node Gateway v5.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['flow', 'mesh', 'logs'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)]">
        {/* Connection Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Nodes Layer */}
        <div className="absolute inset-0 p-8">
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              style={{ x: node.x, y: node.y }}
              className={`absolute w-48 metallic-card p-4 rounded-2xl border ${node.status === 'running' ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white/10 opacity-80'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                  {node.type === 'trigger' && <Play className="w-3.5 h-3.5 text-emerald-500" />}
                  {node.type === 'agent' && <Cpu className="w-3.5 h-3.5 text-blue-500" />}
                  {node.type === 'tool' && <Database className="w-3.5 h-3.5 text-purple-500" />}
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-neutral-600'}`} />
              </div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-tight truncate">{node.label}</h3>
              <p className="text-[8px] text-neutral-500 mt-1 uppercase">ID: NODE_{node.id}</p>
            </motion.div>
          ))}
        </div>

        {/* Floating Controls */}
        <div className="absolute top-6 right-6 flex flex-col gap-3">
          {[
            { icon: Plus, label: 'Add Node' },
            { icon: Search, label: 'Discovery' },
            { icon: Globe, label: 'Mesh Sync' },
            { icon: Share2, label: 'Deploy' }
          ].map((btn, i) => (
            <button key={i} className="p-3 bg-black/60 border border-white/10 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-neutral-400 group relative">
              <btn.icon className="w-5 h-5" />
              <span className="absolute right-full mr-3 px-2 py-1 bg-black text-[8px] font-black uppercase tracking-widest text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap rounded pointer-events-none">
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        {/* Registry Sidebar (Discovery) */}
        <div className="absolute bottom-6 left-6 right-6 h-48 metallic-card border-white/5 rounded-[2.5rem] bg-black/40 p-6 overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Sovereign Integration Mesh</h4>
              <span className="text-[10px] text-blue-500 font-bold">{INTEGRATION_MESH.length} Tools Active</span>
           </div>
           <div className="flex-1 overflow-x-auto no-scrollbar flex gap-4">
              {INTEGRATION_MESH.slice(0, 20).map((tool) => (
                 <div key={tool.id} className="min-w-[180px] h-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                          <Layers className="w-4 h-4" />
                       </div>
                       <span className="text-[9px] font-bold text-white tracking-widest uppercase">{tool.provider}</span>
                    </div>
                    <h5 className="text-[11px] font-black text-white leading-tight uppercase tracking-tighter truncate">{tool.name}</h5>
                    <p className="text-[8px] text-neutral-600 mt-1 line-clamp-2 uppercase leading-relaxed font-bold">{tool.description}</p>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasView;
