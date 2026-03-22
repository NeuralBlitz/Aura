
import React, { useState, useEffect } from 'react';
import { 
  X, Camera, Palette, Zap, Shield, Trash2, Key, ExternalLink, 
  Bell, Sparkles, ShieldCheck, Mail, Archive, MessageSquareText, 
  Plus, MoreHorizontal, History, Check, Globe, MapPin, Search,
  Cpu, Workflow, Sliders, Activity, Terminal, Calendar, Music, StickyNote, Lock, Link,
  TrendingUp, ShieldAlert, Fingerprint, Eye, EyeOff, Edit3, BrainCircuit, ArrowUpRight,
  CreditCard, LayoutGrid
} from 'lucide-react';
import { UserProfile, UserPreferences, Message, VaultStatus, Tab } from '../types';
import { SOVEREIGN_TOOLS } from '../services/toolService';
import { vaultService } from '../services/vaultService';
import MemoryMap from './MemoryMap';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onClearHistory: () => void;
  hasPlatformKey: boolean;
  onSelectKey: () => void;
  messages: Message[];
  vaultStatus: VaultStatus;
  onVaultStatusChange: (status: VaultStatus) => void;
  onLaunchTool?: (view: Tab) => void;
  onSignOut?: () => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aura',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zenith',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Iris',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Atlas',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Crono',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Veda',
];

const ProfilePanel: React.FC<ProfilePanelProps> = ({ 
  isOpen, 
  onClose, 
  profile, 
  onUpdateProfile, 
  preferences, 
  onUpdatePreferences,
  onClearHistory,
  hasPlatformKey,
  onSelectKey,
  messages,
  vaultStatus,
  onVaultStatusChange,
  onLaunchTool,
  onSignOut
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'inbox' | 'toolbox' | 'settings' | 'alerts'>('profile');
  const [inboxTab, setInboxTab] = useState<'messages' | 'archives' | 'integrations'>('messages');
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  const [alertItems, setAlertItems] = useState([
    { id: 1, type: 'feature', title: "Aura 2.0 is here", desc: "Experience faster reasoning.", time: "2m ago", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-400/10", unread: true },
    { id: 2, type: 'security', title: "Neural Vault Enabled", desc: "AES-GCM encryption is now protecting your memories.", time: "1h ago", icon: ShieldCheck, color: "text-blue-400", bg: "bg-blue-400/10", unread: false },
    { id: 3, type: 'system', title: "Subscription renewed", desc: "Pro plan active.", time: "1d ago", icon: Bell, color: "text-orange-400", bg: "bg-orange-400/10", unread: false },
  ]);

  if (!isOpen) return null;

  const toggleTool = (toolId: string) => {
    const current = preferences.enabledTools || [];
    const updated = current.includes(toolId) 
      ? current.filter(id => id !== toolId)
      : [...current, toolId];
    onUpdatePreferences({ enabledTools: updated });
  };

  const handleLaunch = (view: Tab) => {
    if (onLaunchTool) {
      onLaunchTool(view);
      onClose();
    }
  };

  const toggleIntegration = (integrationId: string) => {
    const current = preferences.connectedIntegrations || [];
    const updated = current.includes(integrationId)
      ? current.filter(id => id !== integrationId)
      : [...current, integrationId];
    onUpdatePreferences({ connectedIntegrations: updated });
  };

  const handleVaultAction = async () => {
    if (vaultStatus === 'uninitialized') {
      if (pin.length < 4) return alert("PIN must be at least 4 characters.");
      await vaultService.initialize(pin);
      onVaultStatusChange('unlocked');
    } else if (vaultStatus === 'locked') {
      const success = await vaultService.unlock(pin);
      if (success) onVaultStatusChange('unlocked');
      else alert("Invalid PIN. Access Denied.");
    } else {
      vaultService.lock();
      onVaultStatusChange('locked');
    }
    setPin('');
  };

  const integrations = [
    { id: 'gmail', name: 'Google Mail', icon: <Mail className="w-5 h-5 text-red-500" />, desc: 'Summarize and draft emails.' },
    { id: 'calendar', name: 'Google Calendar', icon: <Calendar className="w-5 h-5 text-blue-500" />, desc: 'Manage schedules & meetings.' },
    { id: 'github', name: 'GitHub Enterprise', icon: <Activity className="w-5 h-5 text-neutral-200" />, desc: 'Analyze PRs and repositories.' },
    { id: 'spotify', name: 'Spotify Music', icon: <Music className="w-5 h-5 text-green-500" />, desc: 'Control playback & discover music.' },
    { id: 'notion', name: 'Notion Workspace', icon: <StickyNote className="w-5 h-5 text-neutral-200" />, desc: 'Read and update documents.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-xl animate-fade-in p-4 sm:p-6">
      <div 
        className="w-full max-w-3xl metallic-card blue rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] animate-slide-up relative"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0 bg-black/20 border-b border-white/5">
          <div className="flex gap-2 p-1 bg-black/40 rounded-full border border-white/10">
            {(['profile', 'inbox', 'toolbox', 'settings', 'alerts'] as const).map(section => (
              <button 
                key={section}
                onClick={() => { setActiveSection(section); setIsPickingAvatar(false); }}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === section ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
              >
                {section === 'toolbox' ? 'Agents' : section}
                {section === 'alerts' && alertItems.some(a => a.unread) && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-red-500 inline-block align-middle animate-pulse" />}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors border border-transparent hover:border-red-500/20 text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-black/20">
          
          {/* === PROFILE SECTION === */}
          {activeSection === 'profile' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div 
                    onClick={() => setIsPickingAvatar(!isPickingAvatar)}
                    className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all hover:scale-105 hover:border-blue-500/50 cursor-pointer relative bg-black"
                  >
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Palette className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 p-2 bg-black border border-white/10 rounded-xl">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>

                {isPickingAvatar && (
                  <div className="mt-8 grid grid-cols-4 gap-4 p-6 bg-black/60 rounded-[2rem] border border-white/10 animate-scale-in">
                    {AVATARS.map((url, i) => (
                      <button 
                        key={i}
                        onClick={() => { onUpdateProfile({ avatarUrl: url }); setIsPickingAvatar(false); }}
                        className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${profile.avatarUrl === url ? 'border-blue-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'border-transparent hover:border-white/20'}`}
                      >
                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover bg-neutral-900" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-8 w-full max-w-md text-center space-y-4">
                  <div className="relative group/input">
                    <input 
                      type="text"
                      value={profile.username}
                      onChange={(e) => onUpdateProfile({ username: e.target.value })}
                      className="text-3xl font-black bg-transparent text-center border-b-2 border-transparent focus:border-blue-500/50 outline-none w-full py-2 text-white tracking-tighter placeholder-neutral-700 transition-all"
                      placeholder="IDENTITY_HANDLE"
                    />
                    <Edit3 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 opacity-0 group-hover/input:opacity-100 transition-opacity" />
                  </div>
                  
                  <textarea 
                    value={profile.bio}
                    onChange={(e) => onUpdateProfile({ bio: e.target.value })}
                    className="text-sm text-neutral-400 bg-transparent text-center resize-none w-full outline-none font-medium px-4 py-2 border-b border-transparent focus:border-blue-500/30 transition-all no-scrollbar"
                    placeholder="Initialize bio substrate..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Memory Nodes', value: messages.length, icon: BrainCircuit, color: 'text-purple-400' }, { label: 'Model Version', value: 'Gemini 3.0', icon: Cpu, color: 'text-blue-400' }, { label: 'Trust Score', value: '100%', icon: ShieldCheck, color: 'text-emerald-400' }].map((stat, i) => (
                  <div key={i} className="metallic-card blue p-6 rounded-[2rem] text-center group hover:-translate-y-1 transition-transform">
                    <div className="flex justify-center mb-3">
                       <div className="p-3 rounded-full bg-black/40 border border-white/5 group-hover:border-white/20 transition-colors">
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                       </div>
                    </div>
                    <div className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em]">{stat.label}</div>
                    <div className="text-xl font-black mt-1 text-white tracking-tight">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === INBOX & INTEGRATIONS SECTION === */}
          {activeSection === 'inbox' && (
             <div className="animate-fade-in space-y-6">
               <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                 {(['messages', 'archives', 'integrations'] as const).map(tab => (
                   <button
                     key={tab}
                     onClick={() => setInboxTab(tab)}
                     className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${inboxTab === tab ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-neutral-500 hover:text-neutral-300'}`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>

               {inboxTab === 'messages' && (
                 <div className="space-y-3">
                   {[
                     { id: 1, sender: "Aura System", subject: "Protocol Update v9.1", preview: "Substrate forge logic has been upgraded...", time: "10:30 AM", unread: true, avatar: <Zap className="w-5 h-5 text-yellow-500" /> },
                     { id: 2, sender: "Secure Vault", subject: "Identity Verification", preview: "New key pair generated for session...", time: "Yesterday", unread: false, avatar: <Lock className="w-5 h-5 text-emerald-500" /> },
                   ].map((mail) => (
                     <div key={mail.id} className={`flex gap-5 p-5 rounded-[2rem] cursor-pointer transition-all border ${mail.unread ? 'metallic-card blue bg-blue-900/10 border-blue-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                       <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                          {mail.avatar}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className={`text-sm tracking-tight ${mail.unread ? 'font-black text-white' : 'font-bold text-neutral-400'}`}>{mail.sender}</h3>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{mail.time}</span>
                          </div>
                          <p className={`text-xs truncate ${mail.unread ? 'font-bold text-blue-200' : 'text-neutral-500'}`}>{mail.subject}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}

               {inboxTab === 'archives' && (
                 <div className="space-y-4">
                   {vaultStatus === 'locked' ? (
                     <div className="text-center py-20 px-8 metallic-card red rounded-[3rem]">
                        <Lock className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Archives Encrypted</h3>
                        <p className="text-xs text-red-300/70 mb-8 font-medium">Unlock the Neural Vault to access temporal history.</p>
                        <button 
                          onClick={() => setActiveSection('settings')}
                          className="px-8 py-3 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-red-500 transition-all"
                        >
                          Authenticate
                        </button>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       {messages.length === 0 ? (
                         <div className="text-center py-20 opacity-30">
                           <Archive className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
                           <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Temporal Archive Empty</p>
                         </div>
                       ) : (
                         [...messages].reverse().map((msg, i) => (
                           <div key={i} className="p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group">
                             <div className="flex justify-between mb-2">
                               <span className={`text-[9px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-neutral-500' : 'text-blue-500'}`}>{msg.role}</span>
                               <span className="text-[9px] text-neutral-600 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                             </div>
                             <p className="text-xs text-neutral-300 font-medium line-clamp-2 leading-relaxed">{msg.text}</p>
                           </div>
                         ))
                       )}
                     </div>
                   )}
                 </div>
               )}

               {inboxTab === 'integrations' && (
                 <div className="space-y-4">
                    <div className="p-6 rounded-[2.5rem] metallic-card purple mb-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-2 bg-black/40 rounded-xl border border-white/10"><Link className="w-5 h-5 text-purple-400" /></div>
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Bridge</h4>
                      </div>
                      <p className="text-[11px] text-purple-200/70 font-medium leading-relaxed">Secure OAuth pipelines allow Aura to ingest external data streams without retaining credentials.</p>
                    </div>
                   {integrations.map(service => {
                     const isConnected = (preferences.connectedIntegrations || []).includes(service.id);
                     return (
                       <div key={service.id} className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all ${isConnected ? 'bg-blue-900/10 border-blue-500/30 shadow-lg' : 'bg-white/5 border-white/5'}`}>
                         <div className="flex items-center gap-5">
                           <div className={`w-12 h-12 flex items-center justify-center rounded-2xl p-2.5 transition-all bg-black border border-white/10 shadow-lg`}>
                             {service.icon}
                           </div>
                           <div>
                             <div className="text-sm font-black text-white tracking-tight">{service.name}</div>
                             <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isConnected ? 'text-emerald-500' : 'text-neutral-600'}`}>{isConnected ? 'Link Active' : 'Disconnected'}</div>
                           </div>
                         </div>
                         <button 
                            onClick={() => toggleIntegration(service.id)}
                            className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isConnected ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'}`}
                         >
                           {isConnected ? 'Sever' : 'Link'}
                         </button>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
          )}

          {/* === TOOLBOX SECTION === */}
          {activeSection === 'toolbox' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-[2.5rem] metallic-card cyan mb-2">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Sovereign Agent Mesh</h3>
                </div>
                <p className="text-[11px] text-cyan-100/70 font-medium leading-relaxed">
                  Enable autonomous agents to extend Aura's capabilities into the local environment.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {SOVEREIGN_TOOLS.map(tool => {
                  const isEnabled = (preferences.enabledTools || []).includes(tool.id);
                  return (
                    <div 
                      key={tool.id} 
                      className={`p-6 rounded-[2.5rem] border transition-all ${isEnabled ? 'bg-white/[0.03] border-blue-500/30 shadow-lg' : 'bg-transparent border-white/5 opacity-60 hover:opacity-100'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 transition-all ${isEnabled ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-black text-neutral-600'}`}>
                            {tool.id === 'fetch_web_data' && <Globe className="w-6 h-6" />}
                            {tool.id === 'get_environment_status' && <Activity className="w-6 h-6" />}
                            {tool.id === 'sonic_link' && <Zap className="w-6 h-6" />}
                            {tool.id === 'market_pipeline' && <TrendingUp className="w-6 h-6" />}
                            {tool.id === 'calendar_bridge' && <Calendar className="w-6 h-6" />}
                            {/* Fallback Icon */}
                            {['fetch_web_data', 'get_environment_status', 'sonic_link', 'market_pipeline', 'calendar_bridge'].indexOf(tool.id) === -1 && <Cpu className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className={`text-sm font-black tracking-tight ${isEnabled ? 'text-white' : 'text-neutral-500'}`}>{tool.name}</h4>
                            <p className="text-[10px] text-neutral-400 font-medium leading-relaxed mt-1 line-clamp-2 max-w-[200px]">{tool.description}</p>
                            {tool.mappedView && (
                               <button 
                                onClick={() => handleLaunch(tool.mappedView as Tab)}
                                className="mt-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
                               >
                                 Launch <ArrowUpRight className="w-3 h-3" />
                               </button>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleTool(tool.id)}
                          className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${isEnabled ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-neutral-800'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === SETTINGS SECTION === */}
          {activeSection === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Neural Vault</h3>
                </div>
                
                <div className={`rounded-[2.5rem] p-8 border transition-all duration-500 ${vaultStatus === 'unlocked' ? 'metallic-card blue bg-blue-900/10' : 'bg-neutral-900/40 border-white/10'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <span className="text-sm font-black text-white block">Identity Enclave</span>
                      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-1">
                        {vaultStatus === 'uninitialized' ? 'Provisioning Required' : vaultStatus === 'locked' ? 'Biometric Lock Active' : 'Secure Session Established'}
                      </p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-black border border-white/10 ${vaultStatus === 'unlocked' ? 'text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'text-neutral-600'}`}>
                       {vaultStatus === 'unlocked' ? <Fingerprint className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                    </div>
                  </div>

                  {vaultStatus === 'unlocked' && (
                    <div className="mb-8 animate-fade-in">
                       <MemoryMap />
                    </div>
                  )}

                  <div className="space-y-4">
                    {(vaultStatus === 'uninitialized' || vaultStatus === 'locked') && (
                      <div className="relative group">
                        <input 
                          type={showPin ? "text" : "password"}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder={vaultStatus === 'uninitialized' ? "Create Master PIN" : "Enter Master PIN"}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-center tracking-[0.5em] focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder-neutral-700"
                        />
                        <button 
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={handleVaultAction}
                      className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${vaultStatus === 'unlocked' ? 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'}`}
                    >
                      {vaultStatus === 'uninitialized' ? (
                        <><Zap className="w-4 h-4" /> Initialize Vault</>
                      ) : vaultStatus === 'locked' ? (
                        <><Key className="w-4 h-4" /> Authenticate</>
                      ) : (
                        <><ShieldAlert className="w-4 h-4" /> Terminate Session</>
                      )}
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Environment</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   {[
                     { label: 'OLED Pure Black', desc: 'True substrate black for efficiency', value: preferences.theme === 'dark', action: () => onUpdatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' }) },
                     { label: 'Predictive Forge', desc: 'Auto-launch artifacts on code output', value: preferences.autoOpenArtifacts, action: () => onUpdatePreferences({ autoOpenArtifacts: !preferences.autoOpenArtifacts }) },
                     { label: 'Neural Alerts', desc: 'Alert for model state updates', value: preferences.notificationsEnabled, action: () => onUpdatePreferences({ notificationsEnabled: !preferences.notificationsEnabled }) },
                   ].map((opt, i) => (
                     <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                        <div>
                          <span className="text-sm font-black text-white block">{opt.label}</span>
                          <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">{opt.desc}</span>
                        </div>
                        <button 
                          onClick={opt.action}
                          className={`w-12 h-6 rounded-full transition-all relative ${opt.value ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-neutral-800'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${opt.value ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                   ))}
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-white/5">
                <button 
                  onClick={onClearHistory}
                  className="w-full flex items-center justify-center gap-3 p-5 bg-red-600/5 hover:bg-red-600/10 text-red-500 hover:text-red-400 border border-red-500/20 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Purge Local Data
                </button>
                {onSignOut && (
                  <button 
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center gap-3 p-5 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all group"
                  >
                    <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Disconnect Identity
                  </button>
                )}
              </section>
            </div>
          )}

          {/* === ALERTS SECTION === */}
          {activeSection === 'alerts' && (
             <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between px-4 mb-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">System Feed</h3>
                   <button onClick={() => setAlertItems(prev => prev.map(a => ({...a, unread: false})))} className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Mark all read</button>
                </div>
                <div className="space-y-3">
                  {alertItems.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`flex gap-5 p-6 rounded-[2.5rem] border transition-all relative ${notif.unread ? 'bg-white/[0.08] border-white/20 shadow-xl' : 'bg-white/[0.02] border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      {notif.unread && <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-black border border-white/10 shadow-lg`}>
                        <notif.icon className={`w-5 h-5 ${notif.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-black text-sm tracking-tight text-white">{notif.title}</h3>
                          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-xs leading-relaxed font-medium text-neutral-400">{notif.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
