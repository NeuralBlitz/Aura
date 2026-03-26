
import React from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import ModuleLayout from '../ui/ModuleLayout';

const CalendarView: React.FC = () => {
  const events = [
    { id: 1, title: "Neural Design Sync", time: "10:00 AM", duration: "1h", type: "work", location: "Virtual Lab 4", attendees: ["Alice", "Bob"] },
    { id: 2, title: "Deep Work Cycle", time: "01:00 PM", duration: "2h", type: "focus", location: "Focus Substrate", attendees: [] },
    { id: 3, title: "System Retro", time: "04:30 PM", duration: "45m", type: "meeting", location: "Boardroom Alpha", attendees: ["Team"] },
  ];

  return (
    <ModuleLayout title="Calendar" subtitle="Temporal Bridge" status="SYNCED" icon={Calendar} color="orange">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-orange-500 mb-6">
                 <Calendar className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Schedule</h2>
              </div>
              <button className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20">
                 <Zap className="w-4 h-4" /> Optimize
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all bg-orange-900/20 text-orange-400 border border-orange-500/20">
                 <div className="flex items-center gap-3"><Calendar className="w-4 h-4" /><span className="text-xs font-bold">Today</span></div>
                 <span className="text-[10px] font-mono bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">3</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent">
                 <div className="flex items-center gap-3"><Clock className="w-4 h-4" /><span className="text-xs font-bold">Upcoming</span></div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent">
                 <div className="flex items-center gap-3"><RefreshCw className="w-4 h-4" /><span className="text-xs font-bold">Sync Nodes</span></div>
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <h1 className="text-sm font-black text-white uppercase tracking-widest">
               Temporal Bridge
             </h1>
             <div className="flex gap-2">
               <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 transition-all">
                 <RefreshCw className="w-4 h-4" />
               </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="max-w-3xl mx-auto">
              <div className="relative border-l-2 border-white/5 pl-10 space-y-10 ml-6">
                {events.map((event, i) => (
                  <div key={event.id} className="relative group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                     <div className={`absolute -left-[49px] top-8 w-6 h-6 rounded-full border-4 border-black z-10 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.5)] ${event.type === 'focus' ? 'bg-purple-500 shadow-purple-500/50' : event.type === 'work' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-orange-500 shadow-orange-500/50'}`} />
                     
                     <div className={`metallic-card ${event.type === 'focus' ? 'purple' : event.type === 'work' ? 'blue' : 'amber'} rounded-[3rem] p-8 transition-all hover:scale-[1.01]`}>
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{event.time} • {event.duration}</span>
                              </div>
                              <h3 className="text-2xl font-black text-white tracking-tight">{event.title}</h3>
                           </div>
                           <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg ${event.type === 'focus' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-neutral-300 border-white/10'}`}>
                              {event.type}
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                           {event.location && (
                             <div className="flex items-center gap-3 text-neutral-400">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{event.location}</span>
                             </div>
                           )}
                           {event.attendees.length > 0 && (
                             <div className="flex items-center gap-3 text-neutral-400">
                                <User className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{event.attendees.join(', ')}</span>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 p-10 rounded-[3rem] bg-gradient-to-r from-orange-600/10 to-purple-600/10 border border-white/10 flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-all shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                       <RefreshCw className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-white uppercase tracking-widest">Sync External Nodes</h4>
                       <p className="text-xs text-neutral-400 font-medium mt-1">Google Calendar, Outlook, iCloud</p>
                    </div>
                 </div>
                 <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default CalendarView;
