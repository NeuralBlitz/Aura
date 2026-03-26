
import React, { useState } from 'react';
import { Message } from '../types';
import { Copy, BrainCircuit, Globe, Sparkles, ArrowUp, GitFork, BookMarked, History, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { WidgetDispatcher } from './widgets/GenerativeWidgets';
import ThinkingXRay from './ThinkingXRay';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRetry?: () => void;
  onOpenArtifact?: (artifact: any) => void;
  onFork?: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, onRetry, onOpenArtifact, onFork }) => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className={`w-full px-6 py-8 animate-slide-up flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[92%] sm:max-w-[85%] ${isUser ? 'message-user p-5 px-7 rounded-[2.2rem] rounded-tr-lg' : 'w-full'}`}>
        
        {message.imageUrl && (
          <div className="mb-6 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl max-w-sm">
            <img src={message.imageUrl} alt="Input" className="w-full h-auto" />
          </div>
        )}

        {!isUser && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-100">Neural Response</span>
                 <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Aura Substrate v4.5</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleSpeech}
                className={`p-2 rounded-xl transition-all active:scale-90 ${isSpeaking ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-500 hover:text-blue-400'}`}
                title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
              >
                 {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => onFork?.(message.id)}
                className="p-2 bg-white/5 rounded-xl text-neutral-500 hover:text-blue-400 transition-all active:scale-90"
                title="Fork Conversation"
              >
                 <GitFork className="w-3.5 h-3.5" />
              </button>
              <button 
                className="p-2 bg-white/5 rounded-xl text-neutral-500 hover:text-emerald-400 transition-all active:scale-90"
                title="Archive to Scriptorium"
              >
                 <BookMarked className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Reasoning X-Ray Integration */}
        {message.thinkingSteps && message.thinkingSteps.length > 0 && (
          <ThinkingXRay steps={message.thinkingSteps} />
        )}

        {isStreaming && !message.text && (
          <div className="space-y-4 w-64 p-2">
            <div className="h-3 w-full bg-blue-500/10 rounded-full animate-pulse overflow-hidden">
               <div className="h-full w-1/3 bg-blue-500 animate-[marquee_2s_linear_infinite]" />
            </div>
            <div className="h-3 w-2/3 bg-blue-500/10 rounded-full animate-pulse delay-75" />
          </div>
        )}

        {message.isError && (
          <div className="mt-6 p-6 rounded-[2rem] bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 shadow-lg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Neural Disruption</p>
                <p className="text-[10px] text-red-500/70 font-bold leading-relaxed">{message.text}</p>
              </div>
            </div>
            <button 
              onClick={onRetry}
              className="p-4 rounded-2xl bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-400 hover:scale-105 transition-all active:scale-95"
              title="Retry Neural Link"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}

        {!message.isError && (
          <div className={`prose prose-invert prose-sm max-w-none leading-relaxed font-medium selection:bg-blue-500/30 ${isUser ? 'text-white' : 'text-neutral-300 border-l-2 border-blue-500/30 pl-8'}`}>
            <ReactMarkdown 
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{
                code: ({node, inline, ...props}: any) => (
                  inline 
                    ? <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[11px]" {...props} />
                    : <div className="bg-black/40 border border-white/10 p-6 rounded-[2rem] my-6 overflow-x-auto shadow-inner">
                        <code className="text-blue-200 font-mono text-[12px] leading-relaxed" {...props} />
                      </div>
                ),
                img: ({node, ...props}: any) => <img {...props} className="rounded-[2.5rem] border border-white/10 my-8 shadow-2xl" />,
                p: ({node, ...props}: any) => <p className="mb-6 last:mb-0" {...props} />
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}

        {message.widgets && message.widgets.length > 0 && (
          <div className="mt-10 space-y-8 w-full">
            {message.widgets.map((widget) => (
              <WidgetDispatcher key={widget.id} widget={widget} />
            ))}
          </div>
        )}

        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-4">
            {message.artifacts.map((artifact) => (
              <button 
                key={artifact.id}
                onClick={() => onOpenArtifact?.(artifact)}
                className="w-full p-6 glass-morphic bg-white/5 rounded-[2.5rem] flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white/10 hover:border-blue-500/50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                    <BrainCircuit className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm text-white tracking-tight">{artifact.title}</p>
                    <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] mt-1">{artifact.type} substrate</p>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-blue-500 transition-all">
                  <ArrowUp className="w-5 h-5 text-neutral-600 rotate-45 group-hover:text-white" />
                </div>
              </button>
            ))}
          </div>
        )}

        {message.groundingMetadata && message.groundingMetadata.length > 0 && (
          <div className="mt-12 pt-10 border-t border-white/5">
            <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
              <Globe className="w-4 h-4" /> Cognitive Grounding
            </h4>
            <div className="flex flex-wrap gap-3">
              {message.groundingMetadata.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="px-5 py-3 glass-morphic bg-white/2 rounded-2xl text-[11px] font-bold text-neutral-400 hover:text-white hover:border-blue-500/50 transition-all flex items-center gap-3 active:scale-95 shadow-lg">
                  <Globe className="w-4 h-4 text-blue-500" />
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
