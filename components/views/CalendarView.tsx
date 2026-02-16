
import React from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Zap, RefreshCw } from 'lucide-react';

const CalendarView: React.FC = () => {
  const events = [
    { id: 1, title: "Neural Design Sync", time: "10:00 AM", duration: "1h", type: "work", location: "Virtual Lab 4", attendees: ["Alice", "Bob"] },
    { id: 2, title: "Deep Work Cycle", time: "01:00 PM", duration: "2h", type: "focus", location: "Focus Substrate", attendees: [] },
    { id: 3, title: "System Retro", time: "04:30 PM", duration: "45m", type: "meeting", location: "Boardroom Alpha", attendees: ["Team"] },
  ];

  return (
    <div className="pt-6 pb-48 px-6 max-w-4xl mx-auto animate-fade-in font-sans">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
          <div className="p-5 bg-orange-600/10 border border-orange-500/20 rounded-[2rem] shadow-[0_0_30px_rgba(249,115,22,0.2)]">
             <Calendar className="w-10 h-10 text-orange-500" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic drop-shadow-lg">Temporal Bridge</h1>
            <p className="text-xs text-orange-500 font-bold uppercase tracking-[0.3em] mt-1">Schedule Optimization</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-neutral-900 border border-white/10 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-3 hover:bg-neutral-800 hover:border-orange-500/30 transition-all shadow-xl">
           <Zap className="w-4 h-4 fill-current animate-pulse" /> Optimize
        </button>
      </div>

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
  );
};

export default CalendarView;
