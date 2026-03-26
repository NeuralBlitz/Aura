
import React, { useState } from 'react';
import { Monitor, Search, Layers, FileText, Code2, Globe, Shield, Wifi, Lock, Plus, X, Star, History, Layout, RefreshCw } from 'lucide-react';
import { executeTool } from '../../services/toolService';
import ModuleLayout from '../ui/ModuleLayout';

interface Tab {
  id: string;
  title: string;
  url: string;
  content: string | null;
  loading: boolean;
}

const BrowserView: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'New Tab', url: '', content: null, loading: false }]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [showDevTools, setShowDevTools] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const createTab = () => {
    const newTab = { id: Date.now().toString(), title: 'New Tab', url: '', content: null, loading: false };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setInputUrl('');
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleNavigate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputUrl) return;
    
    updateTab(activeTabId, { url: inputUrl, loading: true, title: inputUrl });
    
    try {
      const res = await executeTool('fetch_web_data', { url: inputUrl });
      updateTab(activeTabId, { content: typeof res === 'string' ? res : JSON.stringify(res, null, 2), loading: false });
    } catch (err) {
      updateTab(activeTabId, { content: "Connection Error: Failed to handshake with node.", loading: false });
    }
  };

  return (
    <ModuleLayout title="Quantum Net" subtitle="Node Explorer" status={activeTab.loading ? "RESOLVING" : "CONNECTED"} icon={Globe} color="emerald">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        {/* Sidebar: Tabs */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-emerald-500 mb-6">
                 <Globe className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Quantum Net</h2>
              </div>
              <button 
                 onClick={createTab}
                 className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                 <Plus className="w-4 h-4" /> New Signal
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <div className="px-3 mb-2 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Active Channels</div>
              {tabs.map(tab => (
                 <div 
                    key={tab.id}
                    onClick={() => { setActiveTabId(tab.id); setInputUrl(tab.url); }}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeTabId === tab.id ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20' : 'text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
                 >
                    <div className="flex items-center gap-3 truncate">
                       {tab.loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                       <span className="text-xs font-bold truncate">{tab.title}</span>
                    </div>
                    <button onClick={(e) => closeTab(tab.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all">
                       <X className="w-3 h-3" />
                    </button>
                 </div>
              ))}
           </div>

           <div className="p-4 border-t border-white/5 space-y-1">
              <button className="w-full flex items-center gap-3 p-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                 <Star className="w-4 h-4" />
                 <span className="text-xs font-bold">Bookmarks</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                 <History className="w-4 h-4" />
                 <span className="text-xs font-bold">Trace Log</span>
              </button>
           </div>
        </div>

        {/* Main Browser Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
           {/* Omnibar */}
           <div className="h-16 border-b border-white/5 flex items-center px-6 gap-4 bg-black/40 backdrop-blur-md">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                 <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <form onSubmit={handleNavigate} className="flex-1 max-w-3xl flex items-center bg-black/60 border border-white/10 rounded-xl px-4 h-10 focus-within:border-emerald-500/50 transition-all shadow-inner">
                 <Lock className="w-3 h-3 text-emerald-500 mr-3" />
                 <input 
                    type="text" 
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="Enter target node address..."
                    className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white placeholder-neutral-700 font-mono"
                 />
              </form>
              <button 
                 onClick={() => setShowDevTools(!showDevTools)}
                 className={`p-2 rounded-lg transition-all ${showDevTools ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
                 title="Toggle Inspector"
              >
                 <Layout className="w-5 h-5" />
              </button>
           </div>

           {/* Content & DevTools Split */}
           <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-neutral-900/20 relative">
                 {activeTab.loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <Layers className="w-16 h-16 text-emerald-500 animate-bounce mb-6" />
                       <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Resolving Handshake...</span>
                    </div>
                 ) : activeTab.content ? (
                    <div className="prose prose-invert prose-emerald max-w-none">
                       <div className="bg-white/5 border border-white/5 rounded-2xl p-8 shadow-xl">
                          <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-300 leading-relaxed">{activeTab.content}</pre>
                       </div>
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                       <Wifi className="w-24 h-24 text-neutral-600 mb-6" />
                       <p className="text-sm font-black uppercase tracking-[0.4em] text-neutral-500">Awaiting Signal</p>
                    </div>
                 )}
              </div>

              {/* DevTools Inspector */}
              {showDevTools && (
                 <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col animate-slide-left">
                    <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-black/40">
                       <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">DOM Inspector</span>
                       <Code2 className="w-3 h-3 text-neutral-600" />
                    </div>
                    <div className="flex-1 overflow-auto p-4 font-mono text-[10px] text-emerald-300/70 space-y-2">
                       <div>
                          <span className="text-purple-400">Request Headers:</span>
                          <div className="pl-2 border-l border-white/10 mt-1">
                             <div>User-Agent: Aura/7.0 (Neural)</div>
                             <div>Accept: application/json</div>
                             <div>Encryption: AES-256</div>
                          </div>
                       </div>
                       <div className="mt-4">
                          <span className="text-blue-400">Node Metrics:</span>
                          <div className="pl-2 border-l border-white/10 mt-1">
                             <div>Latency: 42ms</div>
                             <div>Size: 14KB</div>
                             <div>Status: 200 OK</div>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default BrowserView;
