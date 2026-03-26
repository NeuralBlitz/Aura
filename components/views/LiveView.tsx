
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings2, Zap, Activity, RefreshCw, Monitor, MonitorOff } from 'lucide-react';
import { LiveClient, LiveStatus } from '../../services/liveClient';

interface LiveViewProps {
  onClose: () => void;
}

const LiveView: React.FC<LiveViewProps> = ({ onClose }) => {
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
      // The client.connect method will internally parallelize the warmup and API handshake
      client.connect({
        systemInstruction: SYSTEM_INSTRUCTION
      });
    };

    init();

    return () => {
      client.disconnect();
    };
  }, []);

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

                const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
                clientRef.current.sendVideoFrame(base64);
              }
            }
          }, 500); // Send 2 FPS for more proactive monitoring
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
    <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col overflow-hidden animate-fade-in">
      {/* Background / Camera Layer */}
      <div className="absolute inset-0 z-0">
        {(isCamOn || isScreenSharing) ? (
           <video ref={videoRef} className="w-full h-full object-cover opacity-50" muted playsInline />
        ) : (
           <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-black to-blue-900/20" />
        )}
        
        {/* Motion Detection Overlay */}
        {isMotionDetected && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 border-[20px] border-cyan-500/10 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-scan" />
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-500/30">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Neural Scan Active</span>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : (status === 'connecting' || status === 'reconnecting') ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400">
            {status === 'connected' ? 'Aura Live // Online' : status === 'connecting' ? 'Establishing Neural Link...' : status === 'reconnecting' ? 'Re-establishing Link...' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500 font-bold">{error}</span>
              <button 
                onClick={handleRetry}
                className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors"
                title="Retry Connection"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          )}
          {status === 'connected' && (
            <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors ${
              interactionMode === 'motion' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' :
              interactionMode === 'idle_chat' ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' :
              'border-white/10 bg-white/5 text-neutral-400'
            }`}>
              {interactionMode === 'motion' ? 'Motion Detected' : interactionMode === 'idle_chat' ? 'Proactive Mode' : 'Monitoring'}
            </div>
          )}
          <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold">
            GEMINI 2.5 FLASH
          </div>
        </div>
      </div>

      {/* Main Visualizer */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* The Orb */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer Rings */}
          <div className={`absolute inset-0 rounded-full border border-blue-500/30 transition-all duration-75 ease-linear`} 
               style={{ transform: `scale(${1 + volume * 0.5})` }} />
          <div className={`absolute inset-4 rounded-full border border-cyan-500/20 transition-all duration-100 ease-linear`} 
               style={{ transform: `scale(${1 + volume * 0.3}) rotate(${volume * 360}deg)` }} />
          
          {/* Core */}
          <div className={`relative w-32 h-32 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${
            interactionMode === 'idle_chat' ? 'shadow-[0_0_60px_rgba(168,85,247,0.6)]' :
            interactionMode === 'motion' ? 'shadow-[0_0_60px_rgba(6,182,212,0.6)]' :
            'shadow-[0_0_50px_rgba(59,130,246,0.5)]'
          }`}>
             <div className={`w-24 h-24 rounded-full bg-gradient-to-tr blur-md transition-all duration-500 ${
               interactionMode === 'idle_chat' ? 'from-purple-600 to-pink-600' :
               interactionMode === 'motion' ? 'from-cyan-600 to-blue-600' :
               'from-blue-600 to-purple-600'
             } ${volume > 0.05 ? 'opacity-100' : 'opacity-40'}`} />
             
             {/* Mascot Eyes */}
             <div className="absolute inset-0 flex items-center justify-center gap-6">
                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] transition-all duration-75" 
                     style={{ height: `${Math.max(2, 16 - volume * 40)}px`, transform: `translateY(${volume * -10}px)` }} />
                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] transition-all duration-75" 
                     style={{ height: `${Math.max(2, 16 - volume * 40)}px`, transform: `translateY(${volume * -10}px)` }} />
             </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <Zap className={`w-10 h-10 text-white transition-all ${(status === 'connecting' || status === 'reconnecting') ? 'animate-bounce' : ''}`} />
             </div>
          </div>
          
          {/* Waveform Visualization (Simulated CSS) */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12">
             {[...Array(12)].map((_, i) => (
               <div key={i} 
                    className="w-1.5 bg-blue-500 rounded-full transition-all duration-75"
                    style={{ 
                      height: `${Math.max(10, Math.random() * volume * 100 + 10)}%`, 
                      opacity: 0.5 + volume 
                    }} 
               />
             ))}
          </div>
        </div>
        
        <p className="mt-20 text-sm font-medium text-neutral-400 animate-pulse transition-all">
           {status === 'connected' ? (
             interactionMode === 'motion' ? 'Analyzing Visual Delta...' :
             interactionMode === 'idle_chat' ? 'Sparking Conversation...' :
             volume > 0.1 ? 'Speaking...' : 'Observing Workspace...'
           ) : status === 'reconnecting' ? 'Recovering Connection...' : 'Connecting...'}
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
  );
};

export default LiveView;
