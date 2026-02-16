import React from 'react';
import { Bell, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';

const NotificationsView: React.FC = () => {
  const notifications = [
    { id: 1, type: 'feature', title: "Aura 2.0 is here", desc: "Experience faster reasoning and larger context windows.", time: "2m ago", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-400/10" },
    { id: 2, type: 'security', title: "New login detected", desc: "Windows PC, San Francisco, CA.", time: "1h ago", icon: ShieldCheck, color: "text-green-400", bg: "bg-green-400/10" },
    { id: 3, type: 'social', title: "New follower", desc: "Sarah Jenkins started following you.", time: "5h ago", icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 4, type: 'system', title: "Subscription renewed", desc: "Your Pro plan has been renewed successfully.", time: "1d ago", icon: Bell, color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <div className="pt-6 pb-24 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button className="text-sm text-blue-500 font-medium">Mark all read</button>
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex gap-4 p-4 rounded-2xl bg-surfaceLight/50 border border-transparent hover:border-neutral-800 transition-colors">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bg}`}>
              <notif.icon className={`w-6 h-6 ${notif.color}`} />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-start">
                 <h3 className="font-semibold text-neutral-200">{notif.title}</h3>
                 <span className="text-xs text-neutral-500">{notif.time}</span>
               </div>
               <p className="text-sm text-neutral-400 mt-0.5 leading-relaxed">{notif.desc}</p>
            </div>
            {notif.id === 1 && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsView;