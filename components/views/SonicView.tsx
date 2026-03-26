
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

const SonicView: React.FC = () => {
  const playlistId = 'PLpvAXmg1KSacTT3A0g3jyvDfluIwDji4a';
  const [isPlaying, setIsPlaying] = useState(true);

  // Cleanup old neural sounds on mount
  useEffect(() => {
    executeTool('sonic_link', { action: 'stop', soundType: 'rain' });
  }, []);

  return (
    <ModuleLayout title="Neural Radio" subtitle="Playlist Integration" status={isPlaying ? "STREAMING" : "IDLE"} icon={Headphones} color="indigo">
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
             <div className="max-w-5xl mx-auto h-full flex flex-col">
                <div className="mb-8 animate-fade-in flex-1 min-h-[500px]">
                  <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&modestbranding=1&rel=0`}
                      title="Neural Playlist"
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-tighter">Neural Collection</h2>
                      <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mt-0.5">Custom Playlist Stream</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <a 
                      href={`https://www.youtube.com/playlist?list=${playlistId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in YouTube
                    </a>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                    </button>
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
