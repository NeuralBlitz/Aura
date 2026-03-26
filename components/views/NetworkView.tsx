
import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Globe, Shield, Terminal, Zap, Activity, RefreshCcw, Server, ShieldCheck, MapPin, Search, ChevronRight, Play } from 'lucide-react';
import { executeTool } from '../../services/toolService';

import ModuleLayout from '../ui/ModuleLayout';

type NetTool = 'dashboard' | 'ping' | 'trace' | 'ports';

const NetworkView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<NetTool>('dashboard');
  const [intel, setIntel] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [targetIp, setTargetIp] = useState('8.8.8.8');
  const consoleRef = useRef<HTMLDivElement>(null);

  const runScan = async () => {
    setIsScanning(true);
    const res = await executeTool('scan_network_node', {});
    setTimeout(() => {
      setIntel(res);
      setIsScanning(false);
    }, 1500);
  };

  useEffect(() => { runScan(); }, []);

  const addToConsole = (line: string) => {
    setConsoleOutput(prev => [...prev, line]);
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  };

  const runPing = () => {
    setConsoleOutput([]);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      const time = Math.floor(Math.random() * 40) + 10;
      addToConsole(`64 bytes from ${targetIp}: icmp_seq=${count} ttl=117 time=${time} ms`);
      if (count >= 5) {
        clearInterval(interval);
        addToConsole(`--- ${targetIp} ping statistics ---`);
        addToConsole(`5 packets transmitted, 5 received, 0% packet loss, time 4005ms`);
      }
    }, 800);
  };

  const runTrace = () => {
    setConsoleOutput([]);
    const hops = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '142.250.1.1', targetIp];
    let step = 0;
    const interval = setInterval(() => {
      if (step >= hops.length) {
        clearInterval(interval);
        addToConsole("Trace complete.");
        return;
      }
      const time = Math.floor(Math.random() * 20) + 5;
      addToConsole(`${step + 1}  ${hops[step]}  ${time}ms  ${time + 2}ms  ${time - 1}ms`);
      step++;
    }, 1000);
  };

  const runPortScan = () => {
    setConsoleOutput([]);
    addToConsole(`Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}`);
    addToConsole(`Nmap scan report for ${targetIp}`);
    addToConsole("Host is up (0.0021s latency).");
    addToConsole("Not shown: 995 closed tcp ports (reset)");
    addToConsole("PORT     STATE SERVICE");
    
    const commonPorts = [
      { port: '22/tcp', state: 'open', service: 'ssh' },
      { port: '80/tcp', state: 'open', service: 'http' },
      { port: '443/tcp', state: 'open', service: 'https' },
      { port: '3000/tcp', state: 'open', service: 'ppp' },
      { port: '8080/tcp', state: 'open', service: 'http-proxy' }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step >= commonPorts.length) {
        clearInterval(interval);
        addToConsole("\nNmap done: 1 IP address (1 host up) scanned in 4.22 seconds");
        return;
      }
      const p = commonPorts[step];
      addToConsole(`${p.port.padEnd(8)} ${p.state.padEnd(7)} ${p.service}`);
      step++;
    }, 600);
  };

  const SidebarBtn = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTool(id)}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all mb-1 ${activeTool === id ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 shadow-lg' : 'text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <ModuleLayout title="NetSec Ops" subtitle="Network Intelligence" status="SECURE UPLINK" icon={Shield} color="cyan">
      <div className="flex h-full w-full bg-[#050505] font-sans overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 bg-black/50 border-r border-white/5 flex flex-col p-6 shrink-0">
         <div className="flex items-center gap-3 mb-10 text-cyan-500">
            <Shield className="w-6 h-6" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">NetSec Ops</h2>
         </div>
         <div className="space-y-1">
            <SidebarBtn id="dashboard" label="Intel Deck" icon={Activity} />
            <SidebarBtn id="ping" label="Ping Node" icon={Wifi} />
            <SidebarBtn id="trace" label="Route Trace" icon={MapPin} />
            <SidebarBtn id="ports" label="Port Scan" icon={Server} />
         </div>
         <div className="mt-auto p-4 bg-cyan-900/10 rounded-2xl border border-cyan-500/20">
            <span className="text-[9px] font-black uppercase text-cyan-600 block mb-2">My Public IP</span>
            <span className="font-mono text-xs text-white block">104.22.18.9</span>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative bg-neutral-900/10">
        
        {activeTool === 'dashboard' && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white italic tracking-tighter">Network Intelligence</h1>
                <button onClick={runScan} disabled={isScanning} className="p-3 bg-white/5 rounded-xl hover:bg-cyan-600/20 hover:text-cyan-400 transition-all">
                   <RefreshCcw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                </button>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 metallic-card cyan rounded-[2.5rem] p-8 flex items-center justify-between bg-black/40">
                   <div>
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Connection Status</span>
                      <h2 className="text-4xl font-black text-white mt-2">Secure Uplink</h2>
                      <p className="text-xs text-cyan-500 font-bold mt-1">AES-256 GCM Tunneled</p>
                   </div>
                   <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 flex items-center justify-center animate-pulse">
                      <ShieldCheck className="w-10 h-10 text-cyan-500" />
                   </div>
                </div>

                <div className="p-6 bg-black border border-white/10 rounded-[2rem]">
                   <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4">Latency</span>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{intel?.latency || '--'}</span>
                      <span className="text-xs text-neutral-500">ms</span>
                   </div>
                   <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-1/3" />
                   </div>
                </div>

                <div className="p-6 bg-black border border-white/10 rounded-[2rem]">
                   <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4">Packets</span>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">0%</span>
                      <span className="text-xs text-neutral-500">Loss</span>
                   </div>
                   <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-full" />
                   </div>
                </div>
             </div>
          </div>
        )}

        {(activeTool === 'ping' || activeTool === 'trace' || activeTool === 'ports') && (
           <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
              <h1 className="text-2xl font-black text-white italic tracking-tighter mb-6">
                {activeTool === 'ping' ? 'ICMP Echo Request' : activeTool === 'trace' ? 'Traceroute Path' : 'TCP Port Scan'}
              </h1>
              
              <div className="flex gap-4">
                 <div className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 transition-all">
                    <Globe className="w-4 h-4 text-cyan-500" />
                    <input 
                      value={targetIp} 
                      onChange={e => setTargetIp(e.target.value)} 
                      className="bg-transparent border-none focus:ring-0 text-sm font-mono text-white w-full outline-none"
                    />
                 </div>
                 <button 
                   onClick={activeTool === 'ping' ? runPing : activeTool === 'trace' ? runTrace : runPortScan}
                   className="px-8 bg-cyan-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20 active:scale-95 flex items-center gap-2"
                 >
                    <Play className="w-3 h-3 fill-current" /> Execute
                 </button>
              </div>

              <div ref={consoleRef} className="h-[400px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 overflow-y-auto font-mono text-xs shadow-inner">
                 <div className="text-neutral-500 mb-2">// Terminal Output Buffer</div>
                 {consoleOutput.map((line, i) => (
                    <div key={i} className="text-cyan-400 mb-1 whitespace-pre">{line}</div>
                 ))}
                 <div className="w-2 h-4 bg-cyan-500 animate-pulse mt-2" />
              </div>
           </div>
        )}

      </div>
      </div>
    </ModuleLayout>
  );
};

export default NetworkView;
