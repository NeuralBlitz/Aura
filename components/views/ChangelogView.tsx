
import React, { useState } from 'react';
import { 
  GitMerge, Zap, Library, Cpu, Plus, Bug, Wrench, Shield, 
  Send, MessageSquare, ChevronDown, CheckCircle, AlertCircle,
  Layout, Database, Lock, Globe, Fingerprint, ShieldCheck
} from 'lucide-react';

interface ChangeItemProps {
  type: string;
  text: string;
  icon: React.ElementType;
  color: string;
}

const ChangeItem: React.FC<ChangeItemProps> = ({ type, text, icon: Icon, color }) => (
  <div className="flex items-start gap-4">
    <div className={`p-1.5 rounded-full ${color}/20 shrink-0`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <div className="flex-1">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{type}</span>
      <p className="text-xs text-neutral-300 font-medium leading-relaxed mt-1">{text}</p>
    </div>
  </div>
);

const ChangelogView: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [category, setCategory] = useState('Feature Request');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const categories = [
    "Bug Report",
    "Feature Request", 
    "Tool Enhancement",
    "New Module Idea",
    "UI/UX Feedback",
    "Performance Issue",
    "Security Vulnerability",
    "AI Model Feedback",
    "Integration Request",
    "Documentation Error",
    "Account Support",
    "Billing/Subscription",
    "Partnership Inquiry",
    "General Question",
    "Other"
  ];

  const versions = [
    {
      version: 'v9.1',
      title: 'Strategic Persistence Update',
      date: 'Current Build',
      status: 'Live',
      sections: [
        { 
          title: 'Project Board Architecture',
          icon: Layout,
          changes: [
            { type: 'Feature', text: 'Implemented Drag-and-Drop Kanban functionality for task status management.', icon: Plus, color: 'text-blue-500' },
            { type: 'Enhancement', text: 'Added Priority Sorting (High/Medium/Low) and metadata tags for granular task tracking.', icon: Wrench, color: 'text-amber-500' },
            { type: 'System', text: 'Integrated IndexedDB persistence layer for Projects and Tasks to ensure data survival across sessions.', icon: Database, color: 'text-emerald-500' },
          ]
        }
      ]
    },
    {
      version: 'v9.0',
      title: 'Deca-Core Expansion',
      date: '2024-05-22',
      status: 'Stable',
      sections: [
        { 
          title: 'New Sovereign Modules',
          icon: Cpu,
          changes: [
            { type: 'Feature', text: 'Deployed DreamStream (Oneiric Engine) for abstract visual thought rendering.', icon: Plus, color: 'text-purple-500' },
            { type: 'Feature', text: 'Added Cipher-X and Void Bin for cryptographic text handling and secure deletion.', icon: Lock, color: 'text-red-500' },
            { type: 'Feature', text: 'Launched Bio-Link and Echo-Mirror for biological rhythm and personality analysis.', icon: Fingerprint, color: 'text-green-500' },
            { type: 'Feature', text: 'Integrated Signal Tuner, Idea Loom, and Style Matrix for generative creativity.', icon: Zap, color: 'text-cyan-500' },
          ]
        },
        { 
          title: 'Core Infrastructure',
          icon: Shield,
          changes: [
            { type: 'System', text: 'Expanded Sovereign Tool definition to map specific tools to dedicated UI views.', icon: Globe, color: 'text-blue-500' },
          ]
        }
      ]
    },
    {
      version: 'v8.0',
      title: 'Sovereign Interface Mapping',
      date: '2024-05-20',
      status: 'Stable',
      sections: [
        { 
          title: 'App Ecosystem',
          icon: Globe,
          changes: [
            { type: 'Feature', text: 'Atmospherics (Weather) interface with canvas-based particle rain simulation.', icon: Plus, color: 'text-blue-400' },
            { type: 'Feature', text: 'Temporal Bridge (Calendar) for schedule visualization.', icon: Plus, color: 'text-orange-400' },
            { type: 'Feature', text: 'Quantum Browser for headless DOM parsing and reading mode.', icon: Plus, color: 'text-emerald-400' },
            { type: 'Feature', text: 'Logic Gate (Webhook) console for API payload testing.', icon: Plus, color: 'text-pink-400' },
          ]
        }
      ]
    },
    {
      version: 'v7.0',
      title: 'Aura OS Genesis',
      date: '2024-05-15',
      status: 'Legacy',
      sections: [
        {
          title: 'Foundation',
          icon: Zap,
          changes: [
            { type: 'Launch', text: 'Initial release of Aura Unified Substrate with Nexus, Forge, and Chat interfaces.', icon: Plus, color: 'text-white' },
            { type: 'Core', text: 'Gemini 3 Pro and Flash model integration with streaming response support.', icon: Cpu, color: 'text-blue-500' },
          ]
        }
      ]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setFormState('sending');

    // Simulate network delay for effect
    setTimeout(() => {
      const emailBody = `Category: ${category}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(message)}`;
      const mailtoLink = `mailto:nuralnexus@icloud.com?subject=[Aura Feedback] ${encodeURIComponent(subject)}&body=${emailBody}`;
      
      window.location.href = mailtoLink;
      setFormState('success');
    }, 1500);
  };

  return (
    <div className="pt-6 pb-32 px-4 max-w-4xl mx-auto min-h-full font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12 animate-fade-in">
        <div className="p-4 rounded-[1.5rem] bg-orange-600/10 border border-orange-500/20 shadow-xl">
          <GitMerge className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white italic">System Logs</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Aura Substrate Evolution</p>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="space-y-16 animate-slide-up">
        {versions.map((version, vIdx) => (
          <div key={version.version} className="relative pl-8 md:pl-12 border-l-2 border-white/5">
            {/* Timeline Marker */}
            <div className="absolute -left-[9px] top-0">
              <div className={`w-4 h-4 rounded-full border-4 border-black ${vIdx === 0 ? 'bg-orange-500 animate-pulse' : 'bg-neutral-800'}`} />
            </div>

            {/* Version Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-[10px] font-black text-white rounded-lg uppercase tracking-widest ${vIdx === 0 ? 'bg-orange-600 shadow-lg shadow-orange-600/20' : 'bg-neutral-800'}`}>
                  {version.version}
                </span>
                <span className="px-3 py-1 text-[9px] font-bold text-neutral-400 bg-white/5 rounded-lg border border-white/5 uppercase tracking-widest">
                  {version.status}
                </span>
              </div>
              <div className="flex-1">
                 <h2 className="text-xl font-black text-white tracking-tight">{version.title}</h2>
                 <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">{version.date}</p>
              </div>
            </div>

            {/* Change Sections */}
            <div className="space-y-6">
              {version.sections.map((section, idx) => (
                <div key={idx} className="p-6 rounded-[2.5rem] bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <section.icon className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">{section.title}</h3>
                  </div>
                  <div className="space-y-5">
                    {section.changes.map((change, cIdx) => (
                      <ChangeItem key={cIdx} type={change.type} text={change.text} icon={change.icon} color={change.color} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Footer */}
      <div className="mt-32 border-t border-white/5 pt-16 animate-fade-in">
        <div className="glass-morphic bg-gradient-to-br from-blue-900/10 to-black border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
              <MessageSquare className="w-64 h-64 text-blue-500" />
           </div>

           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30">
                    <Send className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tight">We Want To Hear Your Opinions</h2>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">Direct Link to Core Development</p>
                 </div>
              </div>

              {formState === 'success' ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
                   <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-2">Transmission Received</h3>
                   <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
                      Your feedback has been encrypted and dispatched to the NuralNexus core node. Thank you for improving the substrate.
                   </p>
                   <button 
                     onClick={() => { setFormState('idle'); setSubject(''); setMessage(''); }}
                     className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all"
                   >
                      Send Another Signal
                   </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-2">Signal Category</label>
                         <div className="relative">
                            <select 
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white appearance-none outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                            >
                               {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-2">Subject</label>
                         <input 
                           type="text"
                           value={subject}
                           onChange={(e) => setSubject(e.target.value)}
                           placeholder="Brief summary..."
                           className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder-neutral-700"
                           required
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-2">Detailed Observation</label>
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your request, bug, or feedback in detail..."
                        rows={5}
                        className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-5 text-sm font-medium text-white outline-none focus:border-blue-500/50 transition-all placeholder-neutral-700 resize-none no-scrollbar"
                        required
                      />
                   </div>

                   <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3" />
                         Secure Destination: nuralnexus@icloud.com
                      </div>
                      <button 
                        type="submit"
                        disabled={formState === 'sending'}
                        className="px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                      >
                         {formState === 'sending' ? (
                           <>Processing...</>
                         ) : (
                           <>Transmit <Send className="w-3 h-3" /></>
                         )}
                      </button>
                   </div>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogView;
