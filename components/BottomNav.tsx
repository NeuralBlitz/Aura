
import React from 'react';
import { Home, Terminal, LayoutGrid, Newspaper, Brain } from 'lucide-react';
import { motion } from 'motion/react';
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
    { id: 'forge', icon: Brain, label: 'Forge' },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit glass-morphic bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center px-8 gap-4 z-[80] rounded-[2.5rem] shadow-2xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id} 
            onClick={() => onTabChange(tab.id)} 
            className="flex flex-col items-center justify-center h-full relative group outline-none active:scale-95 transition-transform px-4"
          >
            <div className={`flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-105 -translate-y-1' : 'scale-100'}`}>
              <div className={`p-2.5 rounded-2xl transition-all duration-500 ${isActive ? 'bg-blue-600/20 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'text-neutral-500 hover:text-neutral-300'}`}>
                 <tab.icon className="w-5 h-5" />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 transition-colors ${isActive ? 'text-blue-500' : 'text-neutral-600'}`}>
                {tab.label}
              </span>
            </div>
            {isActive && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute bottom-2 w-6 h-[2px] bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
