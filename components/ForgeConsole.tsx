
import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../types';
import { Terminal, AlertCircle, Info, CheckCircle, AlertTriangle, Copy, Check, ChevronDown, ChevronRight, Activity, Share } from 'lucide-react';

interface ForgeConsoleProps {
  logs: LogEntry[];
  isRunning: boolean;
  onClear: () => void;
}

const HighlightedValue: React.FC<{ value: string }> = ({ value }) => {
  // Simple syntax highlighting for common types
  if (value === 'true' || value === 'false') return <span className="text-orange-400 font-bold">{value}</span>;
  if (!isNaN(Number(value))) return <span className="text-yellow-400 font-mono">{value}</span>;
  if (value.startsWith('"') && value.endsWith('"')) return <span className="text-emerald-400">{value}</span>;
  if (value.startsWith('[') || value.startsWith('{')) {
    // Attempt to highlight keys in JSON strings
    const highlighted = value.replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:');
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  }
  return <span>{value}</span>;
};

const LogItem: React.FC<{ log: LogEntry }> = ({ log }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = log.content.join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'info': return <Info className="w-3.5 h-3.5 text-blue-400" />;
      case 'result': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      default: return <span className="text-neutral-600 font-black">›</span>;
    }
  };

  const getLogStyles = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-500/5 border-l-2 border-red-500';
      case 'warn': return 'text-amber-400 bg-amber-500/5 border-l-2 border-amber-500';
      case 'info': return 'text-blue-400';
      case 'result': return 'text-emerald-400 font-black bg-emerald-500/5 border-l-2 border-emerald-500';
      default: return 'text-neutral-300';
    }
  };

  return (
    <div className={`group relative flex gap-3 items-start py-2.5 px-6 transition-all hover:bg-white/5 border-b border-white/[0.02] ${getLogStyles(log.type)}`}>
      <div className="mt-1 shrink-0 opacity-70">
        {getIcon(log.type)}
      </div>
      <div className="flex-1 break-words whitespace-pre-wrap select-text min-w-0 font-mono leading-relaxed text-[11px]">
        {log.content.map((c, i) => (
          <React.Fragment key={i}>
            <HighlightedValue value={c} />
            {i < log.content.length - 1 && ' '}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
        <button 
          onClick={handleCopy}
          className="p-1.5 bg-black/40 border border-white/5 rounded-lg hover:bg-white/10 transition-colors text-neutral-500 hover:text-white"
          title="Copy log entry"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
        <span className="text-[9px] text-neutral-600 font-bold tabular-nums">
          {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

const ForgeConsole: React.FC<ForgeConsoleProps> = ({ logs, isRunning, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copyingAll, setCopyingAll] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyAll = () => {
    const text = logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.type.toUpperCase()}: ${l.content.join(' ')}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopyingAll(true);
    setTimeout(() => setCopyingAll(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#060606] font-mono select-none overflow-hidden relative">
      {/* Console Sub-Header */}
      <div className="px-6 py-2 bg-neutral-950/40 border-b border-white/5 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-neutral-800'}`} />
               <span className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">Buffer Status</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyAll}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-lg transition-colors text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-blue-400 disabled:opacity-20"
            >
              {copyingAll ? <Check className="w-3 h-3" /> : <Share className="w-3 h-3" />}
              {copyingAll ? 'Copied' : 'Export Logs'}
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2 selection:bg-blue-500/30">
        {logs.length === 0 && !isRunning && (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Terminal className="w-10 h-10 text-neutral-800 mb-4 stroke-[1px]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-800">
              Aura Console Idle
            </span>
          </div>
        )}
        
        {logs.map((log) => (
          <LogItem key={log.id} log={log} />
        ))}

        {isRunning && (
          <div className="flex items-center gap-3 px-6 py-4 text-blue-500 bg-blue-500/[0.02] animate-pulse border-y border-blue-500/5 mt-2">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Assembling Neutral Flux...</span>
          </div>
        )}
        <div ref={bottomRef} className="h-8 shrink-0" />
      </div>
    </div>
  );
};

export default ForgeConsole;
