
import React, { useState, useEffect } from 'react';
import { Mail as MailIcon, Star, Archive, MoreHorizontal, History, Plus, ExternalLink, ShieldCheck, MailQuestion, MessageSquareText, UserPlus, Sparkles } from 'lucide-react';
import { Message } from '../../types';

interface MailViewProps {
  messages?: Message[];
  onNavigate?: () => void;
}

const MailView: React.FC<MailViewProps> = ({ messages = [], onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'archives' | 'services'>('inbox');
  const [savedChats, setSavedChats] = useState<Message[]>(messages);

  useEffect(() => {
    // If props are provided, use them. Otherwise, could fall back to local storage, 
    // but the app structure pushes props down now.
    setSavedChats(messages);
  }, [messages]);

  const mails = [
    { id: 1, sender: "Aura Support", subject: "Welcome to Aura Pro", preview: "Thanks for upgrading! Here are some tips to get started with advanced reasoning...", time: "10:30 AM", unread: true, avatar: "AS" },
    { id: 2, sender: "Google Cloud", subject: "Billing Alert", preview: "Your monthly statement for July is ready to view. Total amount: $0.00", time: "Yesterday", unread: false, avatar: "GC" },
    { id: 3, sender: "NeuralNexus News", subject: "The Future of AI is here", preview: "This week we discuss the implications of AGI and what it means for...", time: "Mon", unread: false, avatar: "N" },
  ];

  const emailServices = [
    { id: 'gmail', name: 'Google Mail', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', status: 'Not Connected' },
    { id: 'outlook', name: 'Outlook', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg', status: 'Not Connected' },
    { id: 'icloud', name: 'iCloud Mail', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/ICloud_logo.svg', status: 'Not Connected' },
  ];

  return (
    <div className="pt-6 pb-24 px-4 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          {activeTab === 'archives' ? <History className="w-6 h-6 text-blue-500" /> : <MailIcon className="w-6 h-6 text-blue-500" />}
          {activeTab === 'archives' ? 'Chat Archives' : activeTab === 'services' ? 'Integrations' : 'Inbox'}
        </h1>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <Plus className="w-5 h-5 text-neutral-500" />
          </button>
          <button className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <MoreHorizontal className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'inbox' ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-white shadow-sm' : 'text-neutral-500'}`}
        >
          Inbox
        </button>
        <button 
          onClick={() => setActiveTab('archives')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'archives' ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-white shadow-sm' : 'text-neutral-500'}`}
        >
          Archives
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'services' ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-white shadow-sm' : 'text-neutral-500'}`}
        >
          Connect
        </button>
      </div>

      {activeTab === 'inbox' && (
        <div className="space-y-1">
          {mails.map((mail) => (
            <div key={mail.id} className={`flex gap-4 p-4 rounded-2xl cursor-pointer ${mail.unread ? 'bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'} transition-all group`}>
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-300 dark:border-neutral-700 shadow-sm">
                 <span className="font-bold text-xs text-neutral-600 dark:text-neutral-300">{mail.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-baseline mb-0.5">
                   <h3 className={`text-sm truncate ${mail.unread ? 'font-bold text-neutral-900 dark:text-white' : 'font-medium text-neutral-500'}`}>{mail.sender}</h3>
                   <span className="text-[10px] font-bold text-neutral-400 shrink-0 ml-2">{mail.time}</span>
                 </div>
                 <p className={`text-sm truncate mb-0.5 ${mail.unread ? 'font-semibold text-neutral-800 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>{mail.subject}</p>
                 <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{mail.preview}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'archives' && (
        <div className="space-y-2">
          {savedChats.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-neutral-300 dark:border-neutral-700">
                <Archive className="w-6 h-6 text-neutral-300" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-1">No saved chats</h3>
              <p className="text-xs text-neutral-500">History from your home screen will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareText className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Active Thread</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed italic">
                  "Your current conversation is automatically synced with this folder as a persistent archive."
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Latest Session Messages</span>
                </div>
                {savedChats.slice().reverse().map((msg, i) => (
                  <div 
                    key={i} 
                    onClick={onNavigate}
                    className="flex gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/30 transition-all cursor-pointer active:scale-95 hover:bg-white dark:hover:bg-neutral-900"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-blue-600/20'}`}>
                      {msg.role === 'user' ? <UserPlus className="w-4 h-4 text-neutral-600 dark:text-neutral-300" /> : <Sparkles className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">{msg.role === 'user' ? 'You' : 'Aura Assistant'}</span>
                        <span className="text-[9px] text-neutral-400">
                          {(() => {
                            const d = new Date(msg.timestamp);
                            return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
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
        <div className="space-y-6 animate-fade-in">
          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Mail Link
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
              Connect your professional or personal email to let Aura organize your inbox, draft replies, and summarize complex threads directly within this interface.
            </p>
            
            <div className="space-y-3">
              {emailServices.map(service => (
                <button 
                  key={service.id}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img src={service.icon} alt={service.name} className="w-6 h-6 object-contain" />
                    <div className="text-left">
                      <div className="text-sm font-bold text-neutral-800 dark:text-white">{service.name}</div>
                      <div className="text-[10px] text-neutral-500">{service.status}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
              
              <button className="w-full flex items-center justify-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl text-xs font-bold text-neutral-500 hover:border-blue-500 hover:text-blue-500 transition-all">
                <Plus className="w-4 h-4" /> Add custom IMAP/SMTP server
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <MailQuestion className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
              OAuth 2.0 is used for Google and Outlook connections. Aura never stores your passwords; only temporary access tokens are held in your secure device enclave.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailView;
