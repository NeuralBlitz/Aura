
import React, { useState } from 'react';
import { Link2, Send, Database, CheckCircle, AlertTriangle, Code, ArrowRight, Server, Activity } from 'lucide-react';
import { executeTool } from '../../services/toolService';
import ModuleLayout from '../ui/ModuleLayout';

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
    <ModuleLayout title="Logic Gate" subtitle="Dispatcher" status={status === 'sending' ? "DISPATCHING" : "READY"} icon={Link2} color="pink">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-pink-500 mb-6">
                 <Link2 className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Dispatcher</h2>
              </div>
              <button 
                 onClick={handleSend}
                 className="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-600/20"
              >
                 {status === 'sending' ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                 Dispatch Signal
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all bg-pink-900/20 text-pink-400 border border-pink-500/20">
                 <div className="flex items-center gap-3"><Code className="w-4 h-4" /><span className="text-xs font-bold">Payload</span></div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent">
                 <div className="flex items-center gap-3"><Server className="w-4 h-4" /><span className="text-xs font-bold">Response</span></div>
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <h1 className="text-sm font-black text-white uppercase tracking-widest">
               Webhook Configuration
             </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Request Config */}
               <div className="space-y-6">
                  <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-8 space-y-6">
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
                  </div>
               </div>

               {/* Response Viewer */}
               <div className="glass-morphic bg-neutral-900/30 border border-white/5 rounded-[3rem] p-8 flex flex-col relative overflow-hidden h-full min-h-[400px]">
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
        </div>
      </div>
    </ModuleLayout>
  );
};

export default WebhookView;
