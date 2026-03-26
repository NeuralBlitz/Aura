
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
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cleanup old neural sounds on mount
  useEffect(() => {
    executeTool('sonic_link', { action: 'stop', soundType: 'rain' }); // soundType is required by schema but ignored by stopNoise
  }, []);

  const artists = [
    { name: 'Juice WRLD', id: 'juicewrld', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Pooh Shiesty', id: 'poohshiesty', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'DracBaby', id: 'dracbaby', color: 'text-red-400', bg: 'bg-red-500/10' },
    { name: 'Young Thug', id: 'youngthug', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Lil Baby', id: 'lilbaby', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const tracks: Track[] = [
    { id: '1', title: 'Lucid Dreams', artist: 'Juice WRLD', youtubeId: 'mzB1VGEGcSU', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop' },
    { id: '2', title: 'Robbery', artist: 'Juice WRLD', youtubeId: '5SejM_hBvQU', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop' },
    { id: '3', title: 'Wishing Well', artist: 'Juice WRLD', youtubeId: 'L7vYV-pX-h0', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
    { id: '4', title: 'Lean Wit Me', artist: 'Juice WRLD', youtubeId: 'sP2tO0Zq228', cover: 'https://images.unsplash.com/photo-1514525253361-bee8718a300c?w=400&h=400&fit=crop' },
    { id: '5', title: 'Back In Blood', artist: 'Pooh Shiesty', youtubeId: '0v_uS_8m6mE', cover: 'https://images.unsplash.com/photo-1514525253361-bee8718a300c?w=400&h=400&fit=crop' },
    { id: '6', title: 'Neighbors', artist: 'Pooh Shiesty', youtubeId: 'e-t_79o_v_o', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop' },
    { id: '7', title: 'Switch It Up', artist: 'Pooh Shiesty', youtubeId: '3N_Z67E8y-Y', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { id: '8', title: 'DracBaby Freestyle', artist: 'DracBaby', youtubeId: 'vY6_0F_v_Y8', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop' },
    { id: '9', title: 'Check', artist: 'Young Thug', youtubeId: 'nE_77U-H-kY', cover: 'https://images.unsplash.com/photo-1514525253361-bee8718a300c?w=400&h=400&fit=crop' },
    { id: '10', title: 'Best Friend', artist: 'Young Thug', youtubeId: 'bovj27S2Xy0', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
  ];

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ModuleLayout title="Neural Radio" subtitle="YouTube Video Integration" status={activeTrack ? "STREAMING" : "IDLE"} icon={Headphones} color="indigo">
      <div className="flex h-full bg-black/20 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans w-full">
        {/* Sidebar */}
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0">
           <div className="p-6">
              <div className="flex items-center gap-3 text-indigo-500 mb-6">
                 <Youtube className="w-6 h-6" />
                 <h2 className="text-sm font-black uppercase tracking-widest text-white">Music Link</h2>
              </div>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artists..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-2">Featured Artists</div>
                <div className="grid grid-cols-1 gap-2">
                  {artists.map(artist => (
                    <button 
                      key={artist.id}
                      onClick={() => setSearchQuery(artist.name)}
                      className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group ${searchQuery === artist.name ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${artist.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Disc className={`w-4 h-4 ${artist.color}`} />
                      </div>
                      <span className="text-xs font-bold">{artist.name}</span>
                    </button>
                  ))}
                </div>
              </div>
           </div>

           <div className="mt-auto p-6 border-t border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Master Gain</div>
                  <div className="h-1 w-24 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full w-3/4 bg-indigo-500" />
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-md shrink-0">
             <div className="flex items-center gap-4">
               <ListMusic className="w-5 h-5 text-indigo-500" />
               <h1 className="text-sm font-black text-white uppercase tracking-widest">
                 Neural Stream v2.0
               </h1>
             </div>
             <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Hi-Fi Audio</span>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
             <div className="max-w-4xl mx-auto">
                {activeTrack ? (
                  <div className="mb-12 animate-fade-in">
                    <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${activeTrack.youtubeId}?autoplay=1&modestbranding=1&rel=0`}
                        title={activeTrack.title}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="absolute inset-0"
                      />
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setActiveTrack(null)}
                          className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-red-500 transition-all"
                        >
                          <Pause className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter">{activeTrack.title}</h2>
                        <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mt-1">{activeTrack.artist}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><SkipBack className="w-5 h-5 text-white" /></button>
                        <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><SkipForward className="w-5 h-5 text-white" /></button>
                        <a 
                          href={`https://www.youtube.com/watch?v=${activeTrack.youtubeId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
                        >
                          <ExternalLink className="w-5 h-5 text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-12 p-12 rounded-[3.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center bg-white/[0.02]">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6">
                      <Music className="w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Select a Neural Stream</h2>
                    <p className="text-xs text-neutral-500 max-w-xs font-medium leading-relaxed">
                      Connect to the global music substrate. Select an artist or search for a track to begin streaming.
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.3em]">Neural Queue</h3>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{filteredTracks.length} Tracks Available</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredTracks.map(track => (
                      <button 
                        key={track.id}
                        onClick={() => setActiveTrack(track)}
                        className={`flex items-center gap-4 p-4 rounded-[2rem] transition-all border group ${activeTrack?.id === track.id ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'}`}
                      >
                        <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden shadow-lg">
                          <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white fill-current" />
                          </div>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-black text-white truncate tracking-tight">{track.title}</div>
                          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{track.artist}</div>
                        </div>
                        {activeTrack?.id === track.id && (
                          <div className="flex gap-1">
                            {[1, 2, 3].map(i => (
                              <div key={i} className={`w-1 bg-indigo-500 rounded-full animate-pulse`} style={{ height: `${Math.random() * 12 + 4}px`, animationDelay: `${i * 0.2}s` }} />
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
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
