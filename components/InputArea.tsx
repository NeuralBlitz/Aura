
import React, { useRef, useState, useEffect } from 'react';
import { Paperclip, ArrowUp, X, Sparkles, Eye, EyeOff, Trash2, Code2, List, Hash, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface InputAreaProps {
  onSend: (text: string, attachment?: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<{ data: string, name: string } | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const height = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${height}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (isLoading || (!text.trim() && !attachment)) return;
    onSend(text.trim(), attachment?.data);
    setText('');
    setAttachment(null);
    setShowPreview(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachment({ data: reader.result as string, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const hasMarkdown = (str: string) => {
    return /[*_~`[\]()>#]/.test(str) || str.includes('$$') || str.includes('$');
  };

  return (
    <div className="w-full transition-all duration-500">
        {/* Enhanced Real-time Markdown Preview */}
        {text.length > 0 && showPreview && (
          <div className="mb-4 glass-morphic bg-neutral-900/90 border border-blue-500/20 rounded-[2.5rem] p-8 max-h-[400px] overflow-y-auto no-scrollbar animate-slide-up shadow-[0_30px_90px_rgba(0,0,0,0.7)] relative group ring-1 ring-white/5">
            <div className="sticky top-0 right-0 flex justify-between items-center mb-6 bg-transparent z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.25em]">Substrate Preview</span>
                  <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Real-time Rendering Active</span>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/10 rounded-full text-neutral-500 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none text-neutral-300 font-medium leading-relaxed border-l-2 border-blue-500/20 pl-6">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                  code: ({node, inline, className, children, ...props}: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return inline 
                      ? <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[11px]" {...props}>{children}</code>
                      : (
                        <div className="bg-black/60 border border-white/10 p-6 rounded-[2rem] my-6 overflow-x-auto shadow-inner group/code relative">
                          <div className="absolute top-4 right-6 flex items-center gap-2">
                             <Terminal className="w-3 h-3 text-neutral-600" />
                             <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{match ? match[1] : 'CODE'}</span>
                          </div>
                          <code className="text-blue-200 font-mono text-[12px] leading-relaxed block" {...props}>{children}</code>
                        </div>
                      );
                  },
                  ul: ({node, ...props}: any) => <ul className="list-none pl-4 space-y-3 my-6" {...props} />,
                  ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 space-y-3 my-6 marker:text-blue-500/50 marker:font-black" {...props} />,
                  li: ({node, ordered, ...props}: any) => (
                    <li className="relative group/li">
                      {!ordered && (
                        <span className="absolute -left-6 top-2 w-1.5 h-1.5 rounded-full bg-blue-600 group-hover/li:scale-125 transition-transform shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                      <div {...props} />
                    </li>
                  ),
                  h1: ({node, ...props}: any) => <h1 className="text-xl font-black mt-8 mb-4 text-white tracking-tight" {...props} />,
                  h2: ({node, ...props}: any) => <h2 className="text-lg font-black mt-6 mb-3 text-white tracking-tight" {...props} />,
                  p: ({node, ...props}: any) => <p className="my-4 last:mb-0" {...props} />,
                  blockquote: ({node, ...props}: any) => (
                    <blockquote className="border-l-4 border-blue-600/40 pl-6 italic text-neutral-400 my-6 py-2 bg-blue-500/5 rounded-r-2xl" {...props} />
                  )
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Attachment Display */}
        {attachment && (
          <div className="mb-4 flex items-center gap-4 p-4 glass-morphic bg-blue-600/5 border-blue-500/20 rounded-[2.2rem] animate-slide-up shadow-2xl ring-1 ring-blue-500/10">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg relative group/thumb">
              {attachment.data.startsWith('data:image') ? (
                <img src={attachment.data} alt="Preview" className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Paperclip className="w-6 h-6 text-blue-500" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-white truncate block uppercase tracking-tight">{attachment.name}</span>
              <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">Payload Staged for Ingest</span>
            </div>
            <button onClick={() => setAttachment(null)} className="p-3 text-neutral-600 hover:text-red-500 transition-all bg-white/5 rounded-full hover:bg-red-500/10 active:scale-90">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Input Container */}
        <div className={`relative flex flex-col glass-morphic rounded-[3rem] transition-all duration-500 group ${isFocused ? 'ring-2 ring-blue-500/40 border-blue-500/40 shadow-[0_20px_80px_rgba(59,130,246,0.15)]' : 'shadow-[0_20px_60px_rgba(0,0,0,0.5)]'} ${isLoading ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          
          {/* Quick Format Bar */}
          {(isFocused || text.length > 0) && (
            <div className="flex items-center gap-1 px-8 pt-4 border-b border-white/[0.03] animate-fade-in">
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[9px] font-black uppercase tracking-[0.15em] border ${showPreview ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/10'}`}
                title="Toggle Neural Preview"
              >
                {showPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showPreview ? 'Link Established' : 'Engage Preview'}
              </button>
              <div className="w-px h-4 bg-white/10 mx-3" />
              <button onClick={() => setText(text + '**bold**')} className="p-2.5 text-neutral-600 hover:text-blue-500 transition-all active:scale-90" title="Bold Text"><Hash className="w-3.5 h-3.5" /></button>
              <button onClick={() => setText(text + '\n- ')} className="p-2.5 text-neutral-600 hover:text-blue-500 transition-all active:scale-90" title="Unordered List"><List className="w-3.5 h-3.5" /></button>
              <button onClick={() => setText(text + '\n```javascript\n\n```')} className="p-2.5 text-neutral-600 hover:text-blue-500 transition-all active:scale-90" title="Code Block"><Code2 className="w-3.5 h-3.5" /></button>
              {text.length > 0 && (
                <button onClick={() => setText('')} className="ml-auto p-2.5 text-neutral-700 hover:text-red-500 transition-all active:scale-90" title="Purge Buffer"><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          )}

          <div className="flex items-end p-4">
            <div className="flex items-center pl-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 text-neutral-500 hover:text-blue-500 transition-all active:scale-90 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-blue-500/20 mr-1"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

            <textarea
              ref={textareaRef}
              value={text}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 200);
              }}
              onChange={(e) => {
                setText(e.target.value);
                if (hasMarkdown(e.target.value) && !showPreview) {
                   setShowPreview(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Query the substrate..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-neutral-700 py-5 px-5 resize-none no-scrollbar font-bold text-sm leading-relaxed"
            />

            <div className="flex items-center gap-2 pr-2">
              <button 
                onClick={handleSend}
                disabled={!text.trim() && !attachment}
                className={`w-14 h-14 rounded-full transition-all active:scale-90 flex items-center justify-center relative overflow-hidden group/btn ${text.trim() || attachment ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-500' : 'text-neutral-700 bg-white/5 opacity-50'}`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    <ArrowUp className="w-6 h-6 stroke-[3.5px]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8 pb-4">
          <div className="flex items-center gap-3">
             <div className="w-1 h-1 rounded-full bg-blue-500/40 animate-pulse" />
             <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-800">Neural Link v4.5 // Secure Substrate</p>
             <div className="w-1 h-1 rounded-full bg-blue-500/40 animate-pulse" />
          </div>
        </div>
    </div>
  );
};

export default InputArea;
