
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Minus, Maximize2, Shrink } from 'lucide-react';
import { Message, ModelType } from '../types';
import { sendMessageStreamToGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'model', text: '', timestamp: new Date(), isStreaming: true }]);

    try {
      const stream = sendMessageStreamToGemini([...messages, userMsg], input, ModelType.GEMINI_FLASH);
      for await (const chunk of stream) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { 
          ...m, 
          text: chunk.text, 
        } : m));
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: e.message, isError: true, isStreaming: false } : m));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(59,130,246,0.5)] transition-all hover:scale-110 active:scale-95 z-[99]"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed right-6 z-[100] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isMinimized ? 'bottom-24 w-16 h-16' : 'bottom-24 w-[380px] h-[550px] max-h-[75vh]'} glass-morphic bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-scale-in`}>
      {/* Widget Header */}
      <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Aura Assistant</h3>
            <p className="text-[9px] text-green-500 font-black uppercase tracking-[0.1em]">Neural Link Active</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-neutral-500 hover:text-white transition-colors">
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Canvas */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar selection:bg-blue-500/30">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-6">
                <MessageSquare className="w-10 h-10 text-neutral-600 mb-4 stroke-[1px]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Neural Context Ready</p>
                <p className="text-[9px] text-neutral-600 mt-2 font-medium">How can I assist your workflow today?</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-neutral-900 border border-white/5 text-neutral-300'}`}>
                   <div className="prose prose-invert prose-xs">
                     <ReactMarkdown>{msg.text}</ReactMarkdown>
                   </div>
                </div>
              </div>
            ))}
            {isLoading && !messages[messages.length - 1]?.text && (
               <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest px-2">
                 <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" />
                 <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce delay-75" />
                 <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce delay-150" />
                 Thinking
               </div>
            )}
          </div>

          {/* Widget Input */}
          <div className="p-4 border-t border-white/5 bg-white/2">
             <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-2xl px-4 py-1 focus-within:border-blue-500/50 transition-all">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Aura..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white py-3 placeholder-neutral-600"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-xl transition-all ${input.trim() ? 'text-blue-500' : 'text-neutral-700'}`}
                >
                  <Send className="w-4 h-4" />
                </button>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingChat;
