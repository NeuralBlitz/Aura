
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, X, Minimize2, Maximize2, ExternalLink, Youtube, Pause, Play } from 'lucide-react';

interface SonicWidgetProps {
  isActive: boolean;
  onClose: () => void;
}

const SonicWidget: React.FC<SonicWidgetProps> = ({ isActive, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const playlistId = 'PLpvAXmg1KSacTT3A0g3jyvDfluIwDji4a';

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: 0,
            width: isMinimized ? '200px' : '360px',
            height: isMinimized ? '60px' : '280px'
          }}
          exit={{ opacity: 0, scale: 0.9, x: 20 }}
          className="fixed top-20 right-6 z-[100] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Music className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="text-[8px] font-black text-white uppercase tracking-widest">Neural Radio</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-neutral-400 hover:text-white"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-neutral-400 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 relative bg-black ${isMinimized ? 'hidden' : 'block'}`}>
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&modestbranding=1&rel=0`}
              title="Neural Playlist Widget"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="absolute inset-0"
            />
          </div>

          {/* Minimized Controls */}
          {isMinimized && (
            <div className="flex-1 flex items-center justify-between px-4">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Streaming...</span>
               </div>
               <div className="flex items-center gap-2">
                  <a 
                    href={`https://www.youtube.com/playlist?list=${playlistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                  </button>
               </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SonicWidget;
