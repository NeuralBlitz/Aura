
import React, { useState } from 'react';
import { Link2, Send, Database, CheckCircle, AlertTriangle, Code, ArrowRight, Server, Activity } from 'lucide-react';
import { executeTool } from '../../services/toolService';

const WebhookView: React.FC = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [payload, setPayload] = useState('{\n  "event": "neural_trigger",\n  "data": {\n    "message": "Hello World"\n  }\n}');
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async () => {
    setStatus('sending');
    try {
      const parsed = JSON.parse(payload);
      const res = await executeTool('dispatch_webhook', { url, payload: parsed });
      setTimeout(() => {
         setResponse(res);
         setStatus('success');
      }, 1000);
    } catch (e: any) {
      setResponse({ error: e.message });
      setStatus('error');
    }
  };

  return (
    <div className="pt-6 pb-48 px-6 max-w-5xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-pink-600/10 border border-pink-500/20 rounded-[1.8rem] shadow-xl">
           <Link2 className="w-8 h-8 text-pink-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">Logic Gate</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Webhook Dispatcher</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Request Config */}
         <div className="space-y-6">
            <div className="metallic-card pink rounded-[3rem] p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-pink-400 ml-2">Endpoint Configuration</label>
                  <div className="flex gap-3">
                     <select 
                       value={method} 
                       onChange={e => setMethod(e.target.value)}
                       className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black text-pink-500 outline-none uppercase tracking-wider"
                     >
                        <option>POST</option><option>GET</option><option>PUT</option>
                     </select>
                     <input 
                       type="text" 
                       value={url}
                       onChange={e => setUrl(e.target.value)}
                       placeholder="https://api.example.com/hook"
                       className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium text-white placeholder-neutral-700 outline-none focus:border-pink-500/50 transition-all font-mono"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-pink-400">JSON Payload</label>
                     <Code className="w-3 h-3 text-pink-500/50" />
                  </div>
                  <div className="relative group">
                     <textarea 
                       value={payload}
                       onChange={e => setPayload(e.target.value)}
                       className="w-full h-64 bg-black/60 border border-white/10 rounded-[2rem] p-6 font-mono text-xs leading-relaxed text-blue-100 outline-none focus:border-pink-500/50 transition-all resize-none no-scrollbar shadow-inner"
                     />
                  </div>
               </div>

               <button 
                  onClick={handleSend}
                  className="w-full py-5 bg-pink-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-pink-500 transition-all shadow-xl shadow-pink-600/20 active:scale-95 flex items-center justify-center gap-3 border border-pink-400/20"
               >
                  {status === 'sending' ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Dispatch Signal
               </button>
            </div>
         </div>

         {/* Response Viewer */}
         <div className="metallic-card blue rounded-[3rem] p-8 flex flex-col relative overflow-hidden h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-blue-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Response Buffer</h3>
               </div>
               
               {status === 'success' && (
                  <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 flex items-center gap-2 text-green-500">
                     <CheckCircle className="w-3 h-3" />
                     <span className="text-[9px] font-black uppercase tracking-widest">200 OK</span>
                  </div>
               )}
               {status === 'error' && (
                  <div className="px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 flex items-center gap-2 text-red-500">
                     <AlertTriangle className="w-3 h-3" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Error</span>
                  </div>
               )}
            </div>
            
            <div className="flex-1 bg-black/60 rounded-[2rem] border border-white/5 p-6 overflow-auto no-scrollbar shadow-inner relative">
               {response ? (
                  <pre className="font-mono text-[11px] text-blue-200 whitespace-pre-wrap leading-relaxed">
                     {JSON.stringify(response, null, 2)}
                  </pre>
               ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                     <Database className="w-16 h-16 text-neutral-600 mb-6" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Awaiting Downlink</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default WebhookView;
