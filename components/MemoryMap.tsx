
import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { memoryService } from '../services/memoryService';
import { BrainCircuit, Loader2, Sparkles, Hash } from 'lucide-react';

const MemoryMap: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const memories = await memoryService.getAllMemories();
        // Simple projection: Use dimensions 0 and 1 of the vector for X and Y
        // In a real app, we'd use PCA or t-SNE, but this creates a cool stable 'map' for now
        const chartData = memories.map(m => ({
          x: m.vector[0] * 100,
          y: m.vector[1] * 100,
          z: 10,
          text: m.text,
          role: m.role,
          id: m.id
        }));
        setData(chartData);
      } catch (e) {
        console.error("Map fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-black/90 border border-blue-500/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl max-w-xs animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Memory_{item.id}</span>
          </div>
          <p className="text-[11px] text-white font-medium line-clamp-3 leading-relaxed">
            {item.text}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center opacity-40">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-widest">Projecting Mnemosyne...</span>
    </div>
  );

  return (
    <div className="relative w-full h-80 glass bg-blue-600/[0.02] border border-blue-500/10 rounded-[2.5rem] p-6 overflow-hidden group">
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-4 h-4 text-blue-500" />
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Mnemosyne Map</h4>
            <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Semantic Vector Visualization</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
        <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">{data.length} Clusters Ingested</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" hide />
          <YAxis type="number" dataKey="y" hide />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#3b82f6', strokeOpacity: 0.3 }} />
          <Scatter name="Memories" data={data}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.role === 'user' ? '#3b82f6' : '#8b5cf6'} 
                className="hover:filter hover:brightness-150 transition-all cursor-pointer drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemoryMap;
