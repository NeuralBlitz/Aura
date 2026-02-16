
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings2, Zap, Activity, RefreshCw } from 'lucide-react';
import { LiveClient, LiveStatus } from '../../services/liveClient';

interface LiveViewProps {
  onClose: () => void;
}

const LiveView: React.FC<LiveViewProps> = ({ onClose }) => {
  const [status, setStatus] = useState<LiveStatus>('disconnected');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    const client = new LiveClient();
    clientRef.current = client;

    client.onStatusChange = (s) => setStatus(s);
    client.onError = (e) => setError(e.message);
    client.onAudioLevel = (v) => setVolume(Math.min(v * 5, 1)); // Amplify for visualizer

    client.connect({
      systemInstruction: "You are Aura, an advanced AI interface. Keep responses concise, conversational, and helpful. You can see what I see if I enable my camera."
    });

    return () => {
      client.disconnect();
    };
  }, []);

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
    };

    if (isCamOn && status === 'connected') {
      const startCamera = async () => {
        try {
          // Stop existing stream before starting new one (important for switching cameras)
          stopStream();

          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: facingMode,
              width: { ideal: 640 }, 
              height: { ideal: 480 } 
            } 
          });

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
                const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
                clientRef.current.sendVideoFrame(base64);
              }
            }
          }, 1000); // Send 1 FPS for context
        } catch (e) {
          console.error("Camera error", e);
          setIsCamOn(false);
          setError("Failed to access camera.");
        }
      };
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      clearInterval(interval);
      stopStream();
    };
  }, [isCamOn, status, facingMode]);

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
        {isCamOn ? (
           <video ref={videoRef} className="w-full h-full object-cover opacity-50" muted playsInline />
        ) : (
           <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-black to-blue-900/20" />
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
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400">
            {status === 'connected' ? 'Aura Live // Online' : status === 'connecting' ? 'Establishing Neural Link...' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {error && <span className="text-xs text-red-500 font-bold">{error}</span>}
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
          <div className="relative w-32 h-32 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
             <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 blur-md transition-opacity duration-200 ${volume > 0.05 ? 'opacity-100' : 'opacity-40'}`} />
             <div className="absolute inset-0 flex items-center justify-center">
                <Zap className={`w-10 h-10 text-white transition-all ${status === 'connecting' ? 'animate-bounce' : ''}`} />
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
        
        <p className="mt-20 text-sm font-medium text-neutral-400 animate-pulse">
           {status === 'connected' ? (volume > 0.1 ? 'Receiving Input...' : 'Listening...') : 'Connecting...'}
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
          onClick={() => setIsCamOn(!isCamOn)}
          className={`p-5 rounded-full border-2 transition-all ${isCamOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-transparent border-white/10 text-neutral-400 hover:border-white/30'}`}
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
