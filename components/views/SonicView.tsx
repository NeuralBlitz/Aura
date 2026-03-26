
import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, ListMusic, Search, Headphones, Youtube, ExternalLink, Volume2, Disc, VolumeX } from 'lucide-react';
import { executeTool } from '../../services/toolService';
import ModuleLayout from '../ui/ModuleLayout';

interface Track {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  cover: string;
}

interface SonicViewProps {
  isSonicActive: boolean;
  setIsSonicActive: (active: boolean) => void;
}

const SonicView: React.FC<SonicViewProps> = ({ isSonicActive, setIsSonicActive }) => {
  const playlistId = 'PLpvAXmg1KSacTT3A0g3jyvDfluIwDji4a';

  // Cleanup old neural sounds on mount
  useEffect(() => {
    executeTool('sonic_link', { action: 'stop', soundType: 'rain' });
  }, []);

  return (
    <ModuleLayout title="Neural Radio" subtitle="Playlist Integration" status={isSonicActive ? "STREAMING" : "IDLE"} icon={Headphones} color="indigo">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <div className="flex items-center gap-4">
               <ListMusic className="w-5 h-5 text-indigo-500" />
               <h1 className="text-sm font-black text-white uppercase tracking-widest">
                 Neural Stream v3.0
               </h1>
             </div>
             <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Playlist Mode</span>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
             <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center">
                <div className="mb-12 p-16 rounded-[4rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/40 group-hover:scale-110 transition-transform duration-500">
                      <Music className="w-16 h-16 text-white animate-pulse" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Neural Collection</h2>
                    <p className="text-sm text-neutral-400 max-w-sm font-medium leading-relaxed mb-10">
                      Initialize the persistent neural stream. This audio module will continue playing as you navigate across the AURA OS ecosystem.
                    </p>

                    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                      <button 
                        onClick={() => setIsSonicActive(!isSonicActive)}
                        className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${isSonicActive ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'}`}
                      >
                        {isSonicActive ? (
                          <>
                            <VolumeX className="w-5 h-5" />
                            Terminate Stream
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 fill-current" />
                            Initialize Stream
                          </>
                        )}
                      </button>
                      
                      <a 
                        href={`https://www.youtube.com/playlist?list=${playlistId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Source Collection
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 opacity-40">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-1 h-12 bg-indigo-500/50 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Alpha</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-1 h-16 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Beta</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-1 h-12 bg-indigo-500/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Gamma</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default SonicView;
