
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Cpu, Lock, Wifi, Zap, RefreshCw, Fingerprint, Database, History } from 'lucide-react';

const HealthView: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reports, setReports] = useState<{label: string, status: 'ok' | 'warn', value: string}[]>([]);

  const runScan = () => {
    setScanning(true);
    setProgress(0);
    setReports([]);
    
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setScanning(false);
          setReports([
            { label: 'Identity Enclave', status: 'ok', value: 'AES-GCM Secure' },
            { label: 'Neural Coherence', status: 'ok', value: '99.4%' },
            { label: 'Database Integrity', status: 'ok', value: 'GoldenDAG Verified' },
            { label: 'Network Proxy', status: 'warn', value: 'Latency 24ms' },
            { label: 'Memory Leakage', status: 'ok', value: 'None' },
          ]);
          return 100;
        }
        return p + 1;
      });
    }, 40);
  };

  useEffect(() => { runScan(); }, []);

  return (
    <div className="pt-6 pb-48 px-6 max-w-3xl mx-auto animate-fade-in font-sans text-center">
      <div className="relative mb-24 group">
         <div className={`absolute inset-0 blur-[150px] opacity-20 transition-colors duration-1000 bg-emerald-500`} />
         <div className="relative inline-block">
            <div className={`relative w-80 h-80 rounded-full metallic-card emerald flex flex-col items-center justify-center border-4 border-emerald-500/10 shadow-[0_0_100px_rgba(16,185,129,0.2)] bg-black/40`}>
               {scanning ? (
                 <Fingerprint className="w-24 h-24 text-emerald-500 animate-pulse drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
               ) : (
                 <ShieldCheck className="w-24 h-24 text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
               )}
               <div className="mt-8 flex flex-col items-center gap-2">
                  <h2 className="text-5xl font-black text-white tabular-nums italic tracking-tighter drop-shadow-lg">{progress}%</h2>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/70">{scanning ? 'Deep Scanning...' : 'System Optimal'}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {reports.map((report, i) => (
          <div key={i} className="metallic-card emerald rounded-[2rem] p-6 flex justify-between items-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
             <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl ${report.status === 'ok' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                   {report.status === 'ok' ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <Activity className="w-5 h-5 text-amber-500" />}
                </div>
                <span className="text-sm font-bold text-neutral-200 tracking-wide">{report.label}</span>
             </div>
             <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${report.status === 'ok' ? 'text-emerald-400 bg-emerald-500/5' : 'text-amber-400 bg-amber-500/5'}`}>{report.value}</span>
             </div>
          </div>
        ))}

        {!scanning && (
          <button onClick={runScan} className="w-full mt-12 py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-emerald-900/40 active:scale-95 transition-all hover:bg-emerald-500 flex items-center justify-center gap-4">
             <RefreshCw className="w-5 h-5" />
             Re-Initialize Integrity Check
          </button>
        )}
      </div>

      <div className="mt-20 p-12 metallic-card blue rounded-[3.5rem] bg-blue-600/5 border-blue-500/20 text-center relative overflow-hidden group">
         <div className="flex items-center justify-center gap-4 mb-4">
            <Database className="w-6 h-6 text-blue-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Temporal Archive Health</h3>
         </div>
         <p className="text-[10px] text-neutral-400 font-medium leading-relaxed max-w-sm mx-auto">
           Aura OS local records are cross-verified against the GoldenDAG blockchain substrate every 15 minutes.
         </p>
      </div>
    </div>
  );
};

export default HealthView;
