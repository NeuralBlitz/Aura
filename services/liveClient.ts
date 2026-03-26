
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

export interface LiveConfig {
  voiceName?: string;
  systemInstruction?: string;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class LiveClient {
  private ai: GoogleGenAI;
  public status: LiveStatus = 'disconnected';
  private audioContext: AudioContext | null = null;
  private inputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private sessionPromise: Promise<any> | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private currentConfig: LiveConfig | null = null;
  private models = [
    'gemini-2.5-flash-native-audio-preview-12-2025',
    'gemini-2.5-flash-native-audio-preview-09-2025'
  ];
  private currentModelIndex = 0;
  
  public onStatusChange: (status: LiveStatus) => void = () => {};
  public onAudioLevel: (level: number) => void = () => {};
  public onError: (error: Error) => void = () => {};

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Pre-warms the audio context and microphone to reduce connection latency
   */
  async warmup() {
    try {
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      }
      return true;
    } catch (e) {
      console.warn("Warmup failed:", e);
      return false;
    }
  }

  async connect(config: LiveConfig, modelIndex = 0) {
    try {
      this.currentConfig = config;
      this.currentModelIndex = modelIndex;
      
      if (this.currentModelIndex >= this.models.length) {
        throw new Error("All neural models failed to establish a live link.");
      }

      const modelName = this.models[this.currentModelIndex];
      console.log(`[AURA]: Establishing neural link via ${modelName}...`);

      this.status = 'connecting';
      this.onStatusChange(this.status);

      // Parallelize audio/mic initialization and API connection
      const warmupPromise = this.warmup();
      
      this.sessionPromise = this.ai.live.connect({
        model: modelName,
        callbacks: {
          onopen: async () => {
            const isReady = await warmupPromise; // Ensure audio is ready
            if (!isReady) {
              this.onError(new Error("Microphone access denied or hardware error."));
              this.disconnect();
              return;
            }
            this.status = 'connected';
            this.onStatusChange(this.status);
            this.startAudioInput();
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onclose: () => {
            if (this.status === 'connected' || this.status === 'connecting' || this.status === 'reconnecting') {
              console.log("[AURA]: Neural link dropped unexpectedly. Attempting recovery...");
              this.retryWithFallback();
            } else if (this.status !== 'disconnected') {
              this.status = 'disconnected';
              this.onStatusChange(this.status);
              this.disconnect();
            }
          },
          onerror: (err: any) => {
            console.error(`Live API Error with ${modelName}:`, err);
            
            // Enhanced fallback logic: check for specific error types
            const isQuotaError = err.message?.includes('429') || err.message?.includes('QUOTA');
            const isAuthError = err.message?.includes('401') || err.message?.includes('403');
            
            if (isQuotaError) {
              this.onError(new Error("Neural Quota Exhausted. Please try again later."));
              this.disconnect();
              return;
            }

            // If we are still connecting and get an error, try the fallback
            if (this.status === 'connecting' || this.status === 'connected') {
              console.log("[AURA]: Neural link unstable. Attempting fallback...");
              this.retryWithFallback();
            } else {
              this.status = 'error';
              this.onStatusChange(this.status);
              this.onError(new Error(`Neural Link Failure: ${err.message || 'Unknown error'}`));
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Kore' } }
          },
          systemInstruction: { parts: [{ text: config.systemInstruction || '' }] }
        }
      });

    } catch (e: any) {
      console.error("Failed to connect:", e);
      this.retryWithFallback();
    }
  }

  private async retryWithFallback() {
    if (this.currentConfig && this.currentModelIndex < this.models.length - 1) {
      // Clean up current failed session
      if (this.workletNode) {
        this.workletNode.disconnect();
        this.workletNode = null;
      }
      
      this.currentModelIndex++;
      const nextModel = this.models[this.currentModelIndex];
      console.log(`[AURA]: Retrying with fallback model: ${nextModel}`);
      
      this.status = 'reconnecting';
      this.onStatusChange(this.status);

      // Wait a bit before retrying to avoid rapid-fire failures
      await new Promise(resolve => setTimeout(resolve, 500));
      this.connect(this.currentConfig, this.currentModelIndex);
    } else {
      this.status = 'error';
      this.onStatusChange(this.status);
      this.onError(new Error("Neural Link Failure: All models exhausted. Please check your network or API key."));
    }
  }

  private startAudioInput() {
    if (!this.audioContext || !this.mediaStream) return;

    // Use a context with 16kHz for input as required by the API
    this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = this.inputContext.createMediaStreamSource(this.mediaStream);
    
    // ScriptProcessor is used for streaming raw PCM
    const processor = this.inputContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Volume visualization logic
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onAudioLevel(rms);

      // Convert Float32 to Int16 PCM (Native SDK format)
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = inputData[i] * 32768;
      }

      // Ensure data is sent only after session resolves
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({
          audio: {
            data: uint8ArrayToBase64(new Uint8Array(pcmData.buffer)),
            mimeType: 'audio/pcm;rate=16000'
          }
        });
      });
    };

    source.connect(processor);
    processor.connect(this.inputContext.destination);
    
    this.workletNode = processor;
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle interruption signal from the model
    const interrupted = message.serverContent?.interrupted;
    if (interrupted && this.audioContext) {
      for (const src of this.activeSources) {
        try { src.stop(); } catch(e) {}
      }
      this.activeSources.clear();
      this.nextStartTime = 0;
    }

    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.audioContext) {
      const binaryData = base64ToUint8Array(audioData);
      const sampleRate = 24000;
      const numChannels = 1;
      
      const dataInt16 = new Int16Array(binaryData.buffer);
      const buffer = this.audioContext.createBuffer(numChannels, dataInt16.length, sampleRate);
      const channelData = buffer.getChannelData(0);
      
      // Raw PCM to Float32 decoding
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      // Gapless playback scheduling
      const now = this.audioContext.currentTime;
      this.nextStartTime = Math.max(now, this.nextStartTime);
      
      source.onended = () => {
        this.activeSources.delete(source);
      };

      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
      this.activeSources.add(source);
    }
  }

  async sendVideoFrame(base64Image: string) {
    this.sessionPromise?.then(session => {
      session.sendRealtimeInput({
        video: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      });
    });
  }

  async sendText(text: string) {
    this.sessionPromise?.then(session => {
      session.sendRealtimeInput({
        text
      });
    });
  }

  async disconnect() {
    this.status = 'disconnected';
    this.onStatusChange(this.status);
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.inputContext) {
      this.inputContext.close();
      this.inputContext = null;
    }
    
    // Release session resources
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      if (typeof session.close === 'function') {
        session.close();
      }
      this.sessionPromise = null;
    }

    this.activeSources.clear();
    this.nextStartTime = 0;
  }
}
