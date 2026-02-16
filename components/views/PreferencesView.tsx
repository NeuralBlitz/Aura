
import React, { useState } from 'react';
import { Settings, Bell, Zap, Layout, ArrowRight, Shield, Database, Trash2, Cpu, Eye, Palette, Lock, Activity, Download } from 'lucide-react';
import { ModelType, UserPreferences } from '../../types';

interface PreferencesViewProps {
  preferences: UserPreferences;
  onUpdate: (prefs: Partial<UserPreferences>) => void;
  onClearHistory: () => void;
}

const PreferencesView: React.FC<PreferencesViewProps> = ({ preferences, onUpdate, onClearHistory }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'neural' | 'appearance' | 'privacy'>('general');

  const SidebarBtn = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all mb-1 ${activeTab === id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full bg-[#050505] font-sans overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 bg-black/50 border-r border-white/5 flex flex-col p-6 shrink-0">
         <div className="flex items-center gap-3 mb-10 text-neutral-200">
            <Settings className="w-6 h-6" />
            <h2 className="text-sm font-black uppercase tracking-widest">Control Panel</h2>
         </div>
         <div className="space-y-1">
            <SidebarBtn id="general" label="General" icon={Layout} />
            <SidebarBtn id="neural" label="Neural Engine" icon={Cpu} />
            <SidebarBtn id="appearance" label="Interface" icon={Palette} />
            <SidebarBtn id="privacy" label="Security" icon={Lock} />
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12">
         <div className="max-w-2xl mx-auto space-y-12">
            
            {activeTab === 'general' && (
               <section className="animate-slide-up space-y-6">
                  <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">General Configuration</h1>
                  <div className="bg-neutral-900/40 border border-white/10 rounded-[2rem] p-8 space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <h3 className="text-sm font-bold text-white">Push Notifications</h3>
                           <p className="text-xs text-neutral-500 mt-1">Real-time alerts for task completion and neural syncs.</p>
                        </div>
                        <button 
                           onClick={() => onUpdate({ notificationsEnabled: !preferences.notificationsEnabled })}
                           className={`w-14 h-8 rounded-full transition-all relative ${preferences.notificationsEnabled ? 'bg-blue-600' : 'bg-neutral-800'}`}
                        >
                           <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${preferences.notificationsEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between">
                        <div>
                           <h3 className="text-sm font-bold text-white">Smart Artifacts</h3>
                           <p className="text-xs text-neutral-500 mt-1">Automatically expand code and visual responses.</p>
                        </div>
                        <button 
                           onClick={() => onUpdate({ autoOpenArtifacts: !preferences.autoOpenArtifacts })}
                           className={`w-14 h-8 rounded-full transition-all relative ${preferences.autoOpenArtifacts ? 'bg-blue-600' : 'bg-neutral-800'}`}
                        >
                           <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${preferences.autoOpenArtifacts ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
               </section>
            )}

            {activeTab === 'neural' && (
               <section className="animate-slide-up space-y-6">
                  <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">Neural Architecture</h1>
                  <div className="bg-neutral-900/40 border border-white/10 rounded-[2rem] p-8">
                     <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-4">Default Model Substrate</h3>
                     <div className="grid grid-cols-1 gap-3">
                        {Object.values(ModelType).map(model => (
                           <button
                              key={model}
                              onClick={() => onUpdate({ defaultModel: model })}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${preferences.defaultModel === model ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-black/20 border-white/5 text-neutral-500 hover:text-white'}`}
                           >
                              <span className="font-bold text-sm">{model}</span>
                              {preferences.defaultModel === model && <Activity className="w-4 h-4 animate-pulse" />}
                           </button>
                        ))}
                     </div>
                  </div>
               </section>
            )}

            {activeTab === 'privacy' && (
               <section className="animate-slide-up space-y-6">
                  <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">Data Governance</h1>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 space-y-6">
                     <div className="flex items-center gap-4 text-red-500 mb-4">
                        <Shield className="w-6 h-6" />
                        <h3 className="text-lg font-black uppercase tracking-widest">Danger Zone</h3>
                     </div>
                     <button 
                        onClick={onClearHistory}
                        className="w-full flex items-center justify-between p-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 transition-all group"
                     >
                        <span className="text-sm font-bold">Purge Local Memory</span>
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                     </button>
                     <button className="w-full flex items-center justify-between p-4 bg-neutral-900 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-all">
                        <span className="text-sm font-bold">Export Vault Data (JSON)</span>
                        <Download className="w-4 h-4" />
                     </button>
                  </div>
               </section>
            )}

            {activeTab === 'appearance' && (
               <section className="animate-slide-up">
                  <h1 className="text-3xl font-black text-white italic tracking-tighter mb-8">Visual Substrate</h1>
                  <div className="bg-neutral-900/40 border border-white/10 rounded-[2rem] p-8">
                     <p className="text-sm text-neutral-400">Aura OS v7.0 adheres to the "Deep Glass & Metal" aesthetic. Theme switching is managed globally by the system kernel.</p>
                  </div>
               </section>
            )}
         </div>
      </div>
    </div>
  );
};

export default PreferencesView;
