
import React, { useState, useEffect } from 'react';
import { Activity, Battery, Zap, Globe, Cpu, Clock, ShieldCheck } from 'lucide-react';
import { telemetryService, TelemetryData } from '../services/telemetryService';

const SystemMonitor: React.FC = () => {
  const [data, setData] = useState<TelemetryData | null>(null);

  useEffect(() => {
    return telemetryService.subscribe(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="w-full glass-morphic bg-white/5 rounded-[2.5rem] p-6 mb-12 border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Background Pulse */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 transition-colors duration-1000 ${data.coherence > 70 ? 'bg-blue-500' : 'bg-amber-500'}`} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 shadow-lg">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Neural Telemetry</h3>
            <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">Real-time Substrate Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
           <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${data.online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
           <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">
             {data.online ? 'Uplink Established' : 'Link Interrupted'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {/* Battery */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Power</span>
             <span className="text-[9px] font-bold text-white">{Math.round(data.batteryLevel * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div 
               className={`h-full transition-all duration-700 ${data.isCharging ? 'bg-yellow-500' : 'bg-blue-500'}`}
               style={{ width: `${data.batteryLevel * 100}%` }}
             />
          </div>
          <div className="flex items-center gap-1.5 opacity-40">
            {data.isCharging ? <Zap className="w-3 h-3 text-yellow-500" /> : <Battery className="w-3 h-3" />}
            <span className="text-[8px] font-black uppercase">{data.isCharging ? 'Charging' : 'Discharging'}</span>
          </div>
        </div>

        {/* Connection */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Network</span>
             <span className="text-[9px] font-bold text-white uppercase">{data.connectionType}</span>
          </div>
          <div className="flex items-center gap-1">
             {[...Array(4)].map((_, i) => (
               <div key={i} className={`h-1.5 flex-1 rounded-full ${i < (data.online ? 3 : 0) ? 'bg-cyan-500' : 'bg-white/5'}`} />
             ))}
          </div>
          <div className="flex items-center gap-1.5 opacity-40">
            <Globe className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase">{data.online ? 'Stable Grid' : 'Offline'}</span>
          </div>
        </div>

        {/* Memory */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Substrate</span>
             <span className="text-[9px] font-bold text-white uppercase">{data.memoryUsage > 0 ? `${data.memoryUsage}MB` : 'N/A'}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div 
               className="h-full bg-purple-500 transition-all duration-700"
               style={{ width: data.totalMemory > 0 ? `${(data.memoryUsage / data.totalMemory) * 100}%` : '0%' }}
             />
          </div>
          <div className="flex items-center gap-1.5 opacity-40">
            <Cpu className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase">Heap Usage</span>
          </div>
        </div>

        {/* Sync / Coherence */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Coherence</span>
             <span className="text-[9px] font-bold text-white uppercase">{data.coherence}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div 
               className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
               style={{ width: `${data.coherence}%` }}
             />
          </div>
          <div className="flex items-center gap-1.5 opacity-40">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-black uppercase">Aura Sync</span>
          </div>
        </div>
      </div>
      
      {/* Footer Meta */}
      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-neutral-600" />
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Uptime: {Math.floor(data.uptime / 60)}m {data.uptime % 60}s</span>
         </div>
         <div className="text-[8px] font-black text-neutral-800 uppercase tracking-widest group-hover:text-blue-500/40 transition-colors">
           Secure_Enclave_v4.5_Verified
         </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
