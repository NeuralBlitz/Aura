
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, RotateCcw, Terminal, Code2, Trash2, 
  Sparkles, Zap, Cpu, Settings2, Monitor, Activity, Check,
  ChevronRight, Layout, ZapOff, Fingerprint, Gauge, Layers, 
  Maximize2, Minimize2, Share2, AlertTriangle
} from 'lucide-react';
import { executeCode } from '../../services/forgeExecution';
import ForgeConsole from '../ForgeConsole';
import { LogEntry, ForgeParam } from '../../types';
import { GoogleGenAI } from "@google/genai";

interface ForgeViewProps {
  initialCode: string | null;
  onClearInjected?: () => void;
}

type ForgeTab = 'editor' | 'preview' | 'console' | 'config';

const DEFAULT_CODE = `// AURA OS v9.0 // SUBSTRATE FORGE
// Interactive Spatial Canvas

AURA.clear();

// Simulation Parameters
const particleCount = 50;
const connectionRadius = 100;

// /* @param {min: 10, max: 200} */
const speed = 50;

const particles = [];

// Initialize
for(let i=0; i<particleCount; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  });
}

AURA.animate((time, { telemetry }) => {
  // Clear with trails
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Update & Draw
  ctx.strokeStyle = telemetry.online ? '#3b82f6' : '#ef4444';
  ctx.fillStyle = '#fff';
  
  particles.forEach((p, i) => {
    p.x += p.vx * (speed / 50);
    p.y += p.vy * (speed / 50);
    
    // Bounds
    if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
    
    // Draw Node
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Connections
    for(let j=i+1; j<particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if(dist < connectionRadius) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.globalAlpha = 1 - (dist / connectionRadius);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  });
  
  // Telemetry HUD
  ctx.fillStyle = '#0ea5e9';
  ctx.font = '12px monospace';
  ctx.fillText(\`BATTERY: \${Math.round(telemetry.batteryLevel * 100)}%\`, 20, 30);
  ctx.fillText(\`NODES: \${particleCount}\`, 20, 50);
});`;

const ForgeView: React.FC<ForgeViewProps> = ({ initialCode, onClearInjected }) => {
  const [code, setCode] = useState(initialCode || DEFAULT_CODE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [params, setParams] = useState<ForgeParam[]>([]);
  const [activeTab, setActiveTab] = useState<ForgeTab>('editor');
  const [showCRT, setShowCRT] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoRunTimer = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Initialization & Logic ---

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setActiveTab('editor');
      if (onClearInjected) onClearInjected();
    }
  }, [initialCode]);

  useEffect(() => {
    // Initial run to populate canvas
    if (!initialCode) handleRun();
  }, []);

  useEffect(() => {
    if (autoRun) {
      if (autoRunTimer.current) clearTimeout(autoRunTimer.current);
      autoRunTimer.current = setTimeout(handleRun, 800);
    }
  }, [code, autoRun]);

  // Parameter Extraction
  useEffect(() => {
    const lines = code.split('\n');
    const newParams: ForgeParam[] = [];
    lines.forEach((line, idx) => {
      const match = line.match(/\/\/\s*\/\*\s*@param\s*(\{.*?\})\s*\*\//);
      if (match) {
        try {
          const config = JSON.parse(match[1]);
          const nextLine = lines[idx + 1];
          const valMatch = nextLine?.match(/(?:const|let|var)\s+(\w+)\s*=\s*([\d.]+)/);
          if (valMatch) {
            newParams.push({
              id: valMatch[1], label: valMatch[1],
              min: config.min ?? 0, max: config.max ?? 100,
              value: parseFloat(valMatch[2]), line: idx + 1
            });
          }
        } catch (e) {}
      }
    });
    setParams(newParams);
  }, [code]);

  const handleRun = async () => {
    if (!canvasRef.current) return;
    setIsRunning(true);
    // Switch to preview on mobile when running manually
    if (window.innerWidth < 1024 && !autoRun) setActiveTab('preview');
    
    const newLogs = await executeCode(code, canvasRef.current, setLogs);
    setLogs(newLogs);
    setIsRunning(false);
  };

  const handleHeal = async () => {
    const errors = logs.filter(l => l.type === 'error');
    if (errors.length === 0) return;
    setIsHealing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `REPAIR_CODE:\n${code}\n\nERROR:\n${errors.map(e => e.content.join(' ')).join('\n')}\nReturn fixed code in [ARTIFACT] tags.`,
      });
      const match = response.text.match(/\[ARTIFACT\](.*?)\[\/ARTIFACT\]/s);
      if (match) {
        const artifact = JSON.parse(match[1]);
        setCode(artifact.content);
        handleRun();
      }
    } catch (e) {} finally { setIsHealing(false); }
  };

  // --- UI Components ---

  const CyberButton = ({ active, onClick, icon: Icon, label, alert }: any) => (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 group overflow-hidden ${
        active 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
          : 'bg-black/40 text-neutral-500 border border-white/5 hover:border-white/20 hover:text-white'
      }`}
    >
      {alert && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
      <Icon className={`w-5 h-5 ${active ? 'animate-pulse' : ''}`} />
      {label && <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{label}</span>}
      {active && <div className="absolute inset-0 bg-blue-400/5 animate-scan" />}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#030303] text-white font-mono selection:bg-blue-500/30 overflow-hidden relative">
      {/* --- Cyberdeck Header --- */}
      <div className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-[14px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              Substrate Forge
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                {isRunning ? 'Runtime Active' : 'System Idle'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {logs.some(l => l.type === 'error') && (
            <button 
              onClick={handleHeal}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all animate-pulse"
            >
              <Sparkles className="w-3 h-3" /> Auto-Fix
            </button>
          )}
          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
          <button 
            onClick={() => setAutoRun(!autoRun)}
            className={`p-2 rounded-lg transition-all border ${autoRun ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-transparent border-transparent text-neutral-600 hover:text-white'}`}
            title="Auto-Run Link"
          >
            {autoRun ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 border border-blue-400/50"
          >
            <Play className="w-3 h-3 fill-current" /> Run
          </button>
        </div>
      </div>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        
        {/* Editor Panel */}
        <div className={`flex-1 flex flex-col bg-[#050505] relative transition-all duration-300 ${activeTab === 'editor' ? 'flex z-20' : 'hidden lg:flex'}`}>
          {/* Gutter & Code Area */}
          <div className="flex-1 flex relative overflow-hidden">
            <div className="w-12 bg-black border-r border-white/5 flex flex-col items-end py-6 pr-3 text-[10px] text-neutral-700 select-none font-mono leading-relaxed pt-[26px]">
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea 
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent p-6 font-mono text-[13px] leading-relaxed text-blue-100 resize-none focus:outline-none no-scrollbar selection:bg-blue-500/30 placeholder-neutral-800"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Visual/Shell Split (Desktop) or Tabs (Mobile) */}
        <div className={`lg:w-[45%] flex flex-col border-l border-white/10 bg-black transition-all duration-300 ${activeTab !== 'editor' ? 'flex z-20 w-full absolute inset-0 lg:static lg:w-[45%]' : 'hidden lg:flex'}`}>
          
          {/* Visual Panel (Canvas) */}
          <div className={`flex-col relative border-b border-white/10 transition-all ${activeTab === 'preview' || activeTab === 'editor' ? 'flex flex-1' : 'hidden lg:flex lg:h-1/2'}`}>
            <div className="absolute top-4 left-4 z-10 flex gap-2">
               <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[9px] font-black text-blue-400 uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Monitor className="w-3 h-3" />
                  Visual Output
               </div>
               <button onClick={() => setShowCRT(!showCRT)} className={`px-2 py-1 rounded-md border text-[9px] font-bold ${showCRT ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-black/60 border-white/10 text-neutral-500'}`}>CRT</button>
            </div>
            
            <div className="flex-1 bg-[#080808] relative overflow-hidden flex items-center justify-center">
               <canvas 
                 ref={canvasRef} 
                 width={800} 
                 height={600} 
                 className={`max-w-full max-h-full object-contain shadow-2xl ${showCRT ? 'crt-effect' : ''}`}
               />
               {/* CRT Scanline Overlay */}
               {showCRT && (
                 <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />
               )}
            </div>
          </div>

          {/* Configuration Panel (Mobile Tab / Desktop Sidebar equivalent) */}
          <div className={`flex-1 bg-black p-6 overflow-y-auto ${activeTab === 'config' ? 'flex flex-col' : 'hidden'}`}>
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <Settings2 className="w-5 h-5 text-purple-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Runtime Parameters</h3>
             </div>
             <div className="space-y-8">
               {params.length > 0 ? params.map(p => (
                  <div key={p.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{p.label}</span>
                      <span className="text-xs font-mono text-purple-400">{p.value}</span>
                    </div>
                    <input 
                      type="range" min={p.min} max={p.max} step={(p.max - p.min) / 100}
                      value={p.value} onChange={(e) => {
                        const lines = code.split('\n');
                        lines[p.line] = lines[p.line].replace(/=\s*([\d.]+)/, `= ${e.target.value}`);
                        setCode(lines.join('\n'));
                      }}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500"
                    />
                  </div>
                )) : (
                  <div className="text-center py-12 text-neutral-600">
                     <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                     <p className="text-[10px] font-black uppercase tracking-widest">No dynamic tags found</p>
                  </div>
                )}
             </div>
          </div>

          {/* Shell Panel (Console) */}
          <div className={`flex-1 flex flex-col bg-[#050505] min-h-0 ${activeTab === 'console' ? 'flex' : 'hidden lg:flex lg:h-1/2'}`}>
             <div className="h-10 bg-neutral-900/50 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                   <Terminal className="w-3 h-3 text-neutral-400" />
                   <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Shell Output</span>
                </div>
                <button onClick={() => setLogs([])} className="p-1.5 hover:bg-white/10 rounded text-neutral-500 hover:text-red-400 transition-colors">
                   <Trash2 className="w-3 h-3" />
                </button>
             </div>
             <div className="flex-1 overflow-hidden relative">
                <ForgeConsole logs={logs} isRunning={isRunning} onClear={() => setLogs([])} />
             </div>
          </div>

        </div>
      </div>

      {/* --- Mobile Deck Navigation --- */}
      <div className="lg:hidden h-16 bg-black border-t border-white/10 grid grid-cols-4 p-2 gap-2 shrink-0 z-50">
         <CyberButton 
           active={activeTab === 'editor'} 
           onClick={() => setActiveTab('editor')} 
           icon={Code2} 
           label="Code" 
         />
         <CyberButton 
           active={activeTab === 'preview'} 
           onClick={() => setActiveTab('preview')} 
           icon={Monitor} 
           label="Visual" 
         />
         <CyberButton 
           active={activeTab === 'console'} 
           onClick={() => setActiveTab('console')} 
           icon={Terminal} 
           label="Shell" 
           alert={logs.some(l => l.type === 'error')}
         />
         <CyberButton 
           active={activeTab === 'config'} 
           onClick={() => setActiveTab('config')} 
           icon={Settings2} 
           label="Config" 
         />
      </div>

      {/* Healing Overlay */}
      {isHealing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-black text-white tracking-tighter uppercase">Recompiling Substrate</h2>
          <p className="text-xs text-blue-400 font-mono mt-2 animate-pulse">Correcting Logical Syntax...</p>
        </div>
      )}

      <style>{`
        .crt-effect {
          filter: contrast(1.1) brightness(1.1) saturate(1.2);
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ForgeView;
