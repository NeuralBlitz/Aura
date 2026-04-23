
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings2, Zap, Activity, RefreshCw, Monitor, MonitorOff, AlertTriangle } from 'lucide-react';
import { LiveClient, LiveStatus } from '../../services/liveClient';
import ModuleLayout from '../ui/ModuleLayout';

interface LiveViewProps {
  onClose: () => void;
  hasPlatformKey: boolean;
  onSelectKey: () => Promise<void>;
}

const LiveView: React.FC<LiveViewProps> = ({ onClose, hasPlatformKey, onSelectKey }) => {
  const [status, setStatus] = useState<LiveStatus>('disconnected');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isMotionDetected, setIsMotionDetected] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'observing' | 'motion' | 'idle_chat'>('observing');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<LiveClient | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const lastMotionTime = useRef(0);
  const lastActivityTime = useRef(Date.now());

  const SYSTEM_INSTRUCTION = "You are Aura, a highly proactive, visual-first AI co-pilot. You are observing my screen/camera. " +
    "RULES: " +
    "1. MOVEMENT: If you receive [VISUAL_MOTION_DETECTED], comment immediately on what changed visually. " +
    "2. IDLE TIME: If you receive an [IDLE_PROMPT], you MUST proactively share the requested fun fact, joke, or observation to keep the vibe energetic. " +
    "3. Keep all responses extremely concise (1-2 sentences max), witty, and conversational. Do not be robotic. Be a fun companion.";

  useEffect(() => {
    const client = new LiveClient();
    clientRef.current = client;

    client.onStatusChange = (s) => setStatus(s);
    client.onError = (e) => setError(e.message);
    client.onAudioLevel = (v) => {
      setVolume(Math.min(v * 5, 1)); // Amplify for visualizer
      if (v > 0.1) {
        lastActivityTime.current = Date.now();
        setInteractionMode('observing');
      }
    };

    const init = () => {
      if (hasPlatformKey) {
        client.connect({
          systemInstruction: SYSTEM_INSTRUCTION
        });
      }
    };

    init();

    return () => {
      client.disconnect();
    };
  }, [hasPlatformKey]);

  // Idle Interaction Timer
  useEffect(() => {
    const idleInterval = setInterval(() => {
      if (status === 'connected' && Date.now() - lastActivityTime.current > 25000) { // 25 seconds of silence
        console.log("[AURA]: Idle timeout reached. Triggering fun interaction.");
        if (clientRef.current) {
          const prompts = [
            "[IDLE_PROMPT] It's been quiet. Share a quick, fascinating tech or science fun fact.",
            "[IDLE_PROMPT] No movement detected. Tell me a quick joke or pun about programming or AI.",
            "[IDLE_PROMPT] Still observing. Make a creative, slightly sarcastic observation about my current workspace or screen.",
            "[IDLE_PROMPT] Silence detected. Give me a 1-sentence motivational quote for productivity.",
            "[IDLE_PROMPT] Just hanging out. What's a weird fact about the internet or computers?"
          ];
          const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
          clientRef.current.sendText(randomPrompt);
          lastActivityTime.current = Date.now();
          setInteractionMode('idle_chat');
          
          // Fallback to reset mode if model doesn't respond
          setTimeout(() => {
            setInteractionMode(prev => prev === 'idle_chat' ? 'observing' : prev);
          }, 10000);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(idleInterval);
  }, [status]);

  const handleRetry = () => {
    setError(null);
    if (clientRef.current) {
      clientRef.current.connect({
        systemInstruction: SYSTEM_INSTRUCTION
      });
    }
  };

  // Handle Video Frame Streaming and Camera Selection
  useEffect(() => {
    let interval: any;

    const stopStream = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsFlashOn(false);
      prevFrameRef.current = null;
      setIsMotionDetected(false);
    };

    if ((isCamOn || isScreenSharing) && status === 'connected') {
      const startStream = async () => {
        try {
          stopStream();

          let stream: MediaStream;
          if (isScreenSharing) {
            stream = await navigator.mediaDevices.getDisplayMedia({ 
              video: { 
                width: { ideal: 1280 }, 
                height: { ideal: 720 },
                frameRate: { ideal: 5 }
              } 
            });
            // Handle user stopping screen share via browser UI
            stream.getVideoTracks()[0].onended = () => {
              setIsScreenSharing(false);
            };
          } else {
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                facingMode: facingMode,
                width: { ideal: 1280 }, 
                height: { ideal: 720 } 
              } 
            });
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }

          interval = setInterval(() => {
            if (videoRef.current && canvasRef.current && clientRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0);
                
                // Motion Detection Logic
                const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                const currentData = imageData.data;
                
                if (prevFrameRef.current) {
                  let diff = 0;
                  const step = 40; // Sample every 10th pixel (4 values per pixel)
                  for (let i = 0; i < currentData.length; i += step) {
                    const r = Math.abs(currentData[i] - prevFrameRef.current[i]);
                    const g = Math.abs(currentData[i+1] - prevFrameRef.current[i+1]);
                    const b = Math.abs(currentData[i+2] - prevFrameRef.current[i+2]);
                    if (r + g + b > 100) diff++;
                  }
                  
                  const threshold = (currentData.length / step) * 0.08; // 8% change threshold
                  if (diff > threshold && Date.now() - lastMotionTime.current > 4000) {
                    console.log("[AURA]: Visual motion detected, triggering proactive response.");
                    clientRef.current.sendText("[VISUAL_MOTION_DETECTED] The screen just changed significantly. What happened?");
                    lastMotionTime.current = Date.now();
                    lastActivityTime.current = Date.now();
                    setIsMotionDetected(true);
                    setInteractionMode('motion');
                    setTimeout(() => {
                      setIsMotionDetected(false);
                      setInteractionMode('observing');
                    }, 2000);
                  }
                }
                prevFrameRef.current = new Uint8ClampedArray(currentData);

                try {
                  const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.6);
                  if (base64Data && base64Data.includes(',')) {
                    const base64 = base64Data.split(',')[1];
                    if (base64 && base64.length > 10) { // Basic sanity check
                      clientRef.current.sendVideoFrame(base64);
                    }
                  }
                } catch (e) {
                  console.warn("[AURA_LIVE]: Frame capture skipped", e);
                }
              }
            }
          }, 500);
        } catch (e) {
          console.error("Stream error", e);
          setIsCamOn(false);
          setIsScreenSharing(false);
          setError("Failed to access stream.");
        }
      };
      startStream();
    } else {
      stopStream();
    }

    return () => {
      clearInterval(interval);
      stopStream();
    };
  }, [isCamOn, isScreenSharing, status, facingMode]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleCameraFlip = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setIsFlashOn(false); // Reset flash when switching cameras
  };

  const toggleFlash = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    
    if (!track) return;

    try {
      // The 'torch' constraint is part of the image capture API
      // We use 'as any' because TS definitions for applyConstraints often lack the torch property
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn } as any]
      });
      setIsFlashOn(!isFlashOn);
    } catch (e) {
      console.error("Flashlight error:", e);
      setError("Flashlight not supported on this device/camera.");
    }
  };

  return (
    <ModuleLayout title="Aura Live" subtitle="Neural Presence" status={status.toUpperCase()} icon={Mic} color="blue">
      <div className="flex flex-col h-full bg-[#050505] font-sans relative overflow-hidden w-full">
        {/* Background Visualizer */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
        </div>

        {/* Header HUD */}
        <div className="relative z-10 p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
               <div className="absolute inset-0 bg-blue-500 blur-[20px] opacity-20 rounded-full animate-pulse" />
               <div className="relative w-16 h-16 glass-morphic rounded-2xl flex items-center justify-center bg-blue-600/20 border border-blue-500/30">
                  <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
               </div>
            </div>
            <div>
               <h1 className="text-2xl font-black text-white italic tracking-tighter">Aura Live</h1>
               <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`} />
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{status}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="px-4 py-2 glass-morphic bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Neural Sync: 99.8%</span>
             </div>
             <button onClick={() => setInteractionMode('observing')} className="p-3 glass-morphic bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-all">
                <Settings2 className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-8">
          {!hasPlatformKey ? (
            <div className="relative w-full max-w-4xl aspect-video glass-morphic bg-black/40 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-8">
                 <Zap className="w-10 h-10 text-blue-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">Neural Key Required</h3>
              <p className="text-sm text-neutral-400 mb-10 max-w-md leading-relaxed">
                Aura Live requires a paid Gemini API key to establish a high-bandwidth neural link. 
                Please select your key to proceed.
              </p>
              <button 
                onClick={onSelectKey}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-black text-white uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
              >
                 Select Neural Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 text-[10px] font-bold text-neutral-600 uppercase tracking-widest hover:text-neutral-400 transition-colors"
              >
                Learn about billing
              </a>
            </div>
          ) : (
            <div className="relative w-full max-w-4xl aspect-video glass-morphic bg-black/40 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl group">
              {/* Video Feed */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isCamOn || isScreenSharing ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {/* Canvas for motion detection (hidden) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Placeholder / Offline State */}
              {(!isCamOn && !isScreenSharing) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/40 backdrop-blur-3xl">
                  <div className="w-32 h-32 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-8">
                     <MonitorOff className="w-12 h-12 text-neutral-600" />
                  </div>
                  <p className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em]">Visual Substrate Offline</p>
                </div>
              )}

              {/* Overlay HUD */}
              <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                       <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Feed</span>
                       </div>
                       {isMotionDetected && (
                          <div className="px-3 py-1.5 bg-blue-600/80 backdrop-blur-md border border-blue-500/30 rounded-xl flex items-center gap-2 animate-bounce">
                             <Zap className="w-3 h-3 text-white" />
                             <span className="text-[9px] font-black text-white uppercase tracking-widest">Motion Detected</span>
                          </div>
                       )}
                    </div>
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
                       <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">00:00:00</span>
                    </div>
                 </div>

                 <div className="flex justify-center">
                    <div ref={visualizerRef} className="flex items-end gap-1 h-12">
                      {Array.from({ length: 32 }).map((_, i) => (
                         <div 
                            key={i} 
                            className="w-1 bg-blue-500/40 rounded-full transition-all duration-75"
                            style={{ 
                              height: `${Math.max(4, volume * Math.random() * 100)}%`,
                              opacity: 0.3 + (volume * 0.7)
                            }} 
                         />
                      ))}
                    </div>
                 </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 backdrop-blur-3xl p-12 text-center">
                  <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
                  <h3 className="text-xl font-black text-white mb-2 italic">Neural Link Failure</h3>
                  <p className="text-xs text-red-400/80 mb-8 max-w-xs">{error}</p>
                  <button onClick={handleRetry} className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all">
                     Retry Handshake
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="mt-12 text-sm font-medium text-neutral-400 animate-pulse transition-all">
             {status === 'connected' ? (
               interactionMode === 'motion' ? 'Analyzing Visual Delta...' :
               interactionMode === 'idle_chat' ? 'Sparking Conversation...' :
               volume > 0.1 ? 'Speaking...' : 'Observing Workspace...'
             ) : status === 'reconnecting' ? 'Recovering Connection...' : status === 'connecting' ? 'Connecting...' : 'Neural Link Idle'}
          </p>
        </div>

        {/* Controls */}
        <div className="relative z-10 p-8 pb-12 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          <button 
            onClick={toggleMic}
            className={`p-5 rounded-full border-2 transition-all ${isMicOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-red-500/20 border-red-500 text-red-500'}`}
          >
            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button 
            onClick={onClose}
            className="p-6 rounded-full bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:bg-red-500 hover:scale-105 transition-all active:scale-95"
          >
            <PhoneOff className="w-8 h-8" />
          </button>

          <button 
            onClick={() => {
              setIsScreenSharing(!isScreenSharing);
              if (!isScreenSharing) setIsCamOn(false);
            }}
            className={`p-5 rounded-full border-2 transition-all ${isScreenSharing ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-transparent border-white/10 text-neutral-400 hover:border-white/30'}`}
            title="Share Screen"
          >
            {isScreenSharing ? <Monitor className="w-6 h-6" /> : <MonitorOff className="w-6 h-6" />}
          </button>

          <button 
            onClick={() => {
              setIsCamOn(!isCamOn);
              if (!isCamOn) setIsScreenSharing(false);
            }}
            className={`p-5 rounded-full border-2 transition-all ${isCamOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-transparent border-white/10 text-neutral-400 hover:border-white/30'}`}
            title="Toggle Camera"
          >
            {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          {isCamOn && (
            <div className="flex gap-4">
              <button 
                onClick={toggleFlash}
                className={`p-5 rounded-full border-2 transition-all ${isFlashOn ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10 border-white/20 text-neutral-400 hover:text-white'}`}
                title="Toggle Flashlight"
              >
                <Zap className={`w-6 h-6 ${isFlashOn ? 'animate-pulse' : ''}`} />
              </button>
              <button 
                onClick={toggleCameraFlip}
                className="p-5 rounded-full border-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all active:rotate-180 duration-500"
                title="Flip Camera"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
};

export default LiveView;
