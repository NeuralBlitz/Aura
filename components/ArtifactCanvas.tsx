
import React, { useState, useRef, useEffect } from 'react';
// Added RotateCcw to the imports
import { X, Copy, Maximize2, Minimize2, Code2, FileText, Globe, Play, TerminalSquare, Sparkles, Zap, RotateCcw } from 'lucide-react';
import { Artifact, LogEntry } from '../types';
import ReactMarkdown from 'react-markdown';
import ForgeConsole from './ForgeConsole';
import { executeCode } from '../services/forgeExecution';

interface ArtifactCanvasProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInForge?: (code: string) => void;
}

const ArtifactCanvas: React.FC<ArtifactCanvasProps> = ({ artifact, isOpen, onClose, onOpenInForge }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const [canvasKey, setCanvasKey] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && artifact?.type === 'code' && (artifact.language === 'javascript' || artifact.language === 'js')) {
      handleRun();
    }
  }, [isOpen, artifact?.id]);

  if (!artifact) return null;

  const isExecutable = artifact.type === 'code' && (
    artifact.language === 'javascript' || 
    artifact.language === 'js' || 
    artifact.language === 'typescript' || 
    artifact.language === 'ts'
  );

  const handleRun = async () => {
    if (!isExecutable) return;
    setShowConsole(true);
    setIsRunning(true);
    setLogs([]); 
    setCanvasKey(prev => prev + 1);
    
    // Give React a tick to recreate the canvas
    setTimeout(async () => {
      if (!canvasRef.current) {
        setIsRunning(false);
        return;
      }
      const newLogs = await executeCode(artifact.content, canvasRef.current);
      setLogs(newLogs);
      setIsRunning(false);
    }, 100);
  };

  return (
    <div 
      className={`fixed top-14 bottom-0 right-0 z-[110] bg-black border-l border-white/10 transition-all duration-500 ease-out shadow-2xl flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        ${isMaximized ? 'w-full' : 'w-full lg:w-1/2'}`}
    >
      {/* Header */}
      <div className="h-16 shrink-0 border-b border-white/5 px-6 flex items-center justify-between bg-neutral-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20">
            {artifact.type === 'code' ? <Code2 className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-purple-500" />}
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight truncate max-w-[150px] sm:max-w-md">
              {artifact.title}
            </h2>
            <p className="text-[9px] uppercase font-black text-neutral-600 tracking-widest mt-0.5">
              {artifact.type} substrate // {artifact.language || 'generic'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hidden lg:block"
          >
            {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          {artifact.type === 'code' && onOpenInForge && (
            <button 
              onClick={() => onOpenInForge(artifact.content)}
              className="p-2.5 text-blue-500 hover:text-white hover:bg-blue-600/20 rounded-xl transition-all"
              title="Open in Forge"
            >
              <TerminalSquare className="w-5 h-5" />
            </button>
          )}
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button 
            onClick={onClose}
            className="p-2.5 text-neutral-500 hover:text-red-500 transition-all active:scale-90"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className={`flex-1 overflow-y-auto p-10 no-scrollbar transition-all ${showConsole ? 'basis-1/2' : 'basis-full'}`}>
          <div className="max-w-4xl mx-auto pb-40">
            {artifact.type === 'markdown' ? (
              <div className="prose prose-invert prose-blue max-w-none">
                <ReactMarkdown>{artifact.content}</ReactMarkdown>
              </div>
            ) : artifact.type === 'code' ? (
              <div className="relative group">
                <pre className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8 font-mono text-[13px] leading-relaxed overflow-x-auto selection:bg-blue-500/30">
                  <code className="text-blue-200/70">{artifact.content}</code>
                </pre>
              </div>
            ) : (
              <div className="bg-white rounded-3xl h-[70vh] w-full overflow-hidden border border-white/10">
                 <iframe title="Preview" srcDoc={artifact.content} className="w-full h-full border-none bg-white" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button for Execution */}
        {isExecutable && !showConsole && (
          <button 
            onClick={handleRun}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:bg-blue-500 active:scale-95 transition-all z-20 border-4 border-black"
          >
            <Zap className="w-5 h-5 fill-current" />
            Engage Neural Substrate
          </button>
        )}

        {/* Console Panel */}
        {showConsole && (
          <div className="basis-1/2 min-h-[350px] border-t border-white/10 animate-slide-up flex flex-col bg-black">
             <div className="flex-1 flex flex-col min-h-0">
               <div className="relative bg-neutral-900/20 flex items-center justify-center p-6 border-b border-white/5 min-h-[220px] overflow-hidden group shrink-0">
                  <canvas 
                    key={canvasKey}
                    ref={canvasRef} 
                    width={1280} 
                    height={720} 
                    className="bg-black border border-white/10 rounded-2xl shadow-2xl max-w-full h-auto max-h-[200px] object-contain" 
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={handleRun} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-500 transition-all active:scale-90">
                       <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowConsole(false)} className="p-3 bg-white/5 text-neutral-500 rounded-xl hover:text-white transition-all">
                       <X className="w-4 h-4" />
                    </button>
                  </div>
               </div>
               <div className="flex-1 overflow-hidden">
                 <ForgeConsole logs={logs} isRunning={isRunning} onClear={() => setLogs([])} />
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="p-5 border-t border-white/5 bg-neutral-950/50 flex justify-between items-center px-10 shrink-0">
        <div className="flex items-center gap-6">
          <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest">
            CID: {artifact.id.substring(0, 8)}
          </p>
          {isExecutable && (
            <button 
              onClick={() => setShowConsole(!showConsole)}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${showConsole ? 'text-blue-500' : 'text-neutral-600 hover:text-neutral-400'}`}
            >
              <TerminalSquare className="w-4 h-4" />
              {showConsole ? 'Terminate Log Stream' : 'Open Output Buffer'}
            </button>
          )}
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(artifact.content)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-400 transition-all"
        >
          <Copy className="w-4 h-4" />
          Clone Substrate
        </button>
      </div>
    </div>
  );
};

export default ArtifactCanvas;
