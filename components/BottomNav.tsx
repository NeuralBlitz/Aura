
import React from 'react';
import { Home, Terminal, LayoutGrid, Newspaper, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab } from '../types';
import { haptic, HapticPattern } from '../services/hapticService';

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
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit glass-morphic bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center px-4 py-2 gap-2 z-[80] rounded-[2.5rem] shadow-2xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button 
            key={tab.id} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onTabChange(tab.id);
              haptic.trigger(HapticPattern.UI_INTERACT);
            }} 
            className="flex flex-col items-center justify-center relative group outline-none px-4 py-2 rounded-3xl transition-colors"
          >
            <div className={`flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-105' : 'scale-100'}`}>
              <div className={`p-2 rounded-2xl transition-all duration-500 ${isActive ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}>
                 <tab.icon className={`w-5 h-5 transition-all ${isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 transition-colors ${isActive ? 'text-blue-500' : 'text-neutral-600'}`}>
                {tab.label}
              </span>
            </div>
            
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  layoutId="activeTabGlow"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-blue-500/10 rounded-3xl -z-10 border border-blue-500/20 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]"
                />
              )}
            </AnimatePresence>

            {isActive && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute -bottom-1 w-6 h-[2px] bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
