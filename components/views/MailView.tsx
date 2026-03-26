
import React, { useState, useEffect } from 'react';
import { Mail as MailIcon, Star, Archive, MoreHorizontal, History, Plus, ExternalLink, ShieldCheck, MailQuestion, MessageSquareText, UserPlus, Sparkles } from 'lucide-react';
import { Message } from '../../types';
import ModuleLayout from '../ui/ModuleLayout';

interface MailViewProps {
  messages?: Message[];
  onNavigate?: () => void;
}

const MailView: React.FC<MailViewProps> = ({ messages = [], onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'archives' | 'services'>('inbox');
  const [savedChats, setSavedChats] = useState<Message[]>(messages);
  const [mails, setMails] = useState<any[]>([]);

  const fetchMails = async () => {
    try {
      const response = await fetch('/api/store/mail');
      const data = await response.json();
      setMails(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMails();
  }, []);

  useEffect(() => {
    setSavedChats(messages);
  }, [messages]);

  const emailServices = [
    { id: 'gmail', name: 'Google Mail', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', status: 'Not Connected' },
    { id: 'outlook', name: 'Outlook', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg', status: 'Not Connected' },
    { id: 'icloud', name: 'iCloud Mail', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/ICloud_logo.svg', status: 'Not Connected' },
  ];

  return (
    <ModuleLayout title="Inbox" subtitle="Comms" status="SYNCED" icon={MailIcon} color="blue">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-blue-500 mb-6">
                 <MailIcon className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Mail</h2>
              </div>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                 <Plus className="w-4 h-4" /> Compose
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <button 
                 onClick={() => setActiveTab('inbox')}
                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'inbox' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' : 'text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                 <div className="flex items-center gap-3"><MailIcon className="w-4 h-4" /><span className="text-xs font-bold">Inbox</span></div>
                 <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">3</span>
              </button>
              <button 
                 onClick={() => setActiveTab('archives')}
                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'archives' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' : 'text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                 <div className="flex items-center gap-3"><History className="w-4 h-4" /><span className="text-xs font-bold">Archives</span></div>
              </button>
              <button 
                 onClick={() => setActiveTab('services')}
                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'services' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' : 'text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                 <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4" /><span className="text-xs font-bold">Integrations</span></div>
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <h1 className="text-sm font-black text-white uppercase tracking-widest">
               {activeTab === 'archives' ? 'Chat Archives' : activeTab === 'services' ? 'Integrations' : 'Inbox'}
             </h1>
             <div className="flex gap-2">
               <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 transition-all">
                 <MoreHorizontal className="w-4 h-4" />
               </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {activeTab === 'inbox' && (
              <div className="space-y-2">
                {mails.map((mail) => (
                  <div key={mail.id} className={`flex gap-4 p-5 rounded-2xl cursor-pointer transition-all group border ${mail.unread ? 'bg-blue-900/10 border-blue-500/20' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                       <span className="font-bold text-xs text-neutral-400">{mail.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-baseline mb-1">
                         <h3 className={`text-sm truncate ${mail.unread ? 'font-bold text-white' : 'font-medium text-neutral-400'}`}>{mail.sender}</h3>
                         <span className="text-[10px] font-mono text-neutral-500 shrink-0 ml-2">{mail.time}</span>
                       </div>
                       <p className={`text-sm truncate mb-1 ${mail.unread ? 'font-semibold text-neutral-200' : 'text-neutral-500'}`}>{mail.subject}</p>
                       <p className="text-xs text-neutral-600 truncate">{mail.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'archives' && (
              <div className="space-y-4 max-w-3xl mx-auto">
                {savedChats.length === 0 ? (
                  <div className="text-center py-20 px-6 opacity-50">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10">
                      <Archive className="w-6 h-6 text-neutral-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">No saved chats</h3>
                    <p className="text-xs text-neutral-500">History from your home screen will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-5 bg-blue-900/10 border border-blue-500/20 rounded-2xl mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquareText className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Active Thread</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Your current conversation is automatically synced with this folder as a persistent archive.
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 px-2">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Latest Session Messages</span>
                      </div>
                      {savedChats.slice().reverse().map((msg, i) => (
                        <div 
                          key={i} 
                          onClick={onNavigate}
                          className="flex gap-4 p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer active:scale-95 hover:bg-white/5 group"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-white/5 border-white/10' : 'bg-blue-600/20 border-blue-500/30'}`}>
                            {msg.role === 'user' ? <UserPlus className="w-5 h-5 text-neutral-400" /> : <Sparkles className="w-5 h-5 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Aura Assistant'}</span>
                              <span className="text-[9px] font-mono text-neutral-600">
                                {(() => {
                                  const d = new Date(msg.timestamp);
                                  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
                <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-lg font-black text-white mb-3 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" /> Secure Mail Link
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-8">
                    Connect your professional or personal email to let Aura organize your inbox, draft replies, and summarize complex threads directly within this interface.
                  </p>
                  
                  <div className="space-y-4">
                    {emailServices.map(service => (
                      <button 
                        key={service.id}
                        className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2">
                             <img src={service.icon} alt={service.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-white">{service.name}</div>
                            <div className="text-[10px] font-mono text-neutral-500 mt-1">{service.status}</div>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-neutral-600 group-hover:text-blue-400 transition-colors" />
                      </button>
                    ))}
                    
                    <button className="w-full flex items-center justify-center gap-3 p-5 bg-transparent border border-dashed border-white/20 rounded-2xl text-xs font-bold text-neutral-400 hover:border-blue-500 hover:text-blue-400 transition-all">
                      <Plus className="w-4 h-4" /> Add custom IMAP/SMTP server
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem]">
                  <MailQuestion className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                  <p className="text-xs text-amber-500/80 leading-relaxed">
                    OAuth 2.0 is used for Google and Outlook connections. Aura never stores your passwords; only temporary access tokens are held in your secure device enclave.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default MailView;
