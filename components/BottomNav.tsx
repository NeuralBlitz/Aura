
import React from 'react';
import { Home, Terminal, LayoutGrid, Newspaper, Users } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'nexus', icon: LayoutGrid, label: 'OS' },
    { id: 'news', icon: Newspaper, label: 'Intel' },
    { id: 'home', icon: Home, label: 'Neural' },
    { id: 'forums', icon: Users, label: 'Mesh' },
    { id: 'forge', icon: Terminal, label: 'Forge' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 glass-morphic bg-black/80 border-t border-white/5 flex items-center justify-around px-4 z-[80] pb-safe shadow-2xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id} 
            onClick={() => onTabChange(tab.id)} 
            className="flex flex-col items-center justify-center transition-all group relative h-full flex-1 active:scale-90 py-1"
          >
            <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'text-neutral-600 hover:text-neutral-300'}`}>
               <tab.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tighter mt-1.5 transition-colors ${isActive ? 'text-blue-500' : 'text-neutral-600 group-hover:text-neutral-400'}`}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute top-0 w-8 h-[2px] bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] animate-fade-in" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
