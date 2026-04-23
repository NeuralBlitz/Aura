
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

export interface LiveConfig {
  voiceName?: string;
  systemInstruction?: string;
}

function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64.trim());
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e: any) {
    console.error("[LIVE_CLIENT]: Decode error", e);
    return new Uint8Array(0);
  }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  try {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (e: any) {
    console.error("[LIVE_CLIENT]: Encode error", e);
    return "";
  }
}

export class LiveClient {
  private ai: GoogleGenAI | null = null;
  public status: LiveStatus = 'disconnected';
  private audioContext: AudioContext | null = null;
  private inputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private sessionPromise: Promise<any> | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private currentConfig: LiveConfig | null = null;
  private models = [
    'gemini-2.0-flash-exp'
  ];
  private currentModelIndex = 0;
  
  public onStatusChange: (status: LiveStatus) => void = () => {};
  public onAudioLevel: (level: number) => void = () => {};
  public onError: (error: Error) => void = () => {};

  constructor() {}

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
            noiseSuppression: true
          } 
        });
      }
      return true;
    } catch (e) {
      console.warn("[LIVE_CLIENT]: Warmup failure", e);
      return false;
    }
  }

  async connect(config: LiveConfig, modelIndex = 0) {
    try {
      this.currentConfig = config;
      this.currentModelIndex = modelIndex;
      
      const modelName = this.models[this.currentModelIndex % this.models.length];
      console.log(`[AURA]: Synchronizing neural interface via ${modelName}...`);

      this.status = 'connecting';
      this.onStatusChange(this.status);

      const apiKey = process.env.GEMINI_API_KEY || (process.env as any).API_KEY;
      if (!apiKey) {
        throw new Error("Neural Identity Missing: API key required for live substrate.");
      }

      this.ai = new GoogleGenAI({ apiKey });
      const warmupPromise = this.warmup();
      
      this.sessionPromise = (this.ai as any).live.connect({
        model: modelName,
        callbacks: {
          onopen: async () => {
            const isReady = await warmupPromise;
            if (!isReady) {
              this.onError(new Error("Audio Hardware Mismatch: Microphone access denied or in use."));
              this.disconnect();
              return;
            }
            this.status = 'connected';
            this.onStatusChange(this.status);
            this.startAudioInput();
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onclose: () => {
            if (this.status === 'connected' || this.status === 'reconnecting') {
              console.log("[AURA]: Substrate connection dropped. Attempting resync...");
              this.retryWithFallback();
            } else if (this.status !== 'disconnected') {
              this.status = 'disconnected';
              this.onStatusChange(this.status);
              this.disconnect();
            }
          },
          onerror: (err: any) => {
            console.error(`[LIVE_CLIENT]: Stream Error:`, err);
            const msg = err.message || "";
            if (msg.includes('429') || msg.includes('QUOTA')) {
              this.onError(new Error("Neural Quota Exhausted: Please try again later."));
              this.disconnect();
            } else {
              this.retryWithFallback();
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Kore' } }
          },
          systemInstruction: { parts: [{ text: config.systemInstruction || 'You are Aura.' }] },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

    } catch (e: any) {
      console.error("[LIVE_CLIENT]: Connection Critical failure", e);
      this.status = 'error';
      this.onStatusChange(this.status);
      this.onError(e);
    }
  }

  public disconnect() {
    this.status = 'disconnected';
    this.onStatusChange(this.status);
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputContext) {
      this.inputContext.close();
      this.inputContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.activeSources.forEach(s => { try { s.stop(); } catch(e) {} });
    this.activeSources.clear();
    this.nextStartTime = 0;
    this.sessionPromise = null;
    this.ai = null;
  }

  public async sendText(text: string) {
    if (this.status !== 'connected') return;
    try {
      const session = await this.sessionPromise;
      if (session) {
        session.sendRealtimeInput({
          text: text
        });
      }
    } catch (e) {
      console.error("[LIVE_CLIENT]: Failed to send text context", e);
    }
  }

  public async sendVideoFrame(base64: string) {
    if (this.status !== 'connected') return;
    try {
      const session = await this.sessionPromise;
      if (session) {
        session.sendRealtimeInput({
          video: { data: base64, mimeType: 'image/jpeg' }
        });
      }
    } catch (e) {
      console.error("[LIVE_CLIENT]: Failed to send video frame", e);
    }
  }

  private async retryWithFallback() {
    if (this.currentConfig && this.currentModelIndex < 3) {
      // Clean up previous context before retry
      if (this.processor) this.processor.disconnect();
      if (this.inputContext) this.inputContext.close();

      this.currentModelIndex++;
      this.status = 'reconnecting';
      this.onStatusChange(this.status);
      await new Promise(r => setTimeout(r, 2000));
      this.connect(this.currentConfig, this.currentModelIndex);
    } else {
      this.status = 'error';
      this.onStatusChange(this.status);
      this.onError(new Error("Neural Interface Failed: Reconnection threshold exceeded."));
    }
  }

  private startAudioInput() {
    if (!this.audioContext || !this.mediaStream) return;

    this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = this.inputContext.createMediaStreamSource(this.mediaStream);
    
    // Low-latency buffer
    const processor = this.inputContext.createScriptProcessor(2048, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (this.status !== 'connected') return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      this.onAudioLevel(Math.sqrt(sum / inputData.length));

      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
      }

      this.sessionPromise?.then(session => {
        const payload = uint8ArrayToBase64(new Uint8Array(pcmData.buffer));
        if (payload) {
          session.sendRealtimeInput({
            audio: { data: payload, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      });
    };

    source.connect(processor);
    processor.connect(this.inputContext.destination);
    this.processor = processor;
  }

  private async handleMessage(message: LiveServerMessage) {
    const interrupted = message.serverContent?.interrupted;
    if (interrupted && this.audioContext) {
      this.activeSources.forEach(s => { try { s.stop(); } catch(e) {} });
      this.activeSources.clear();
      this.nextStartTime = 0;
    }

    const audioData = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;

    if (audioData && this.audioContext) {
      const binaryData = base64ToUint8Array(audioData);
      if (binaryData.length === 0) return;

      const dataInt16 = new Int16Array(binaryData.buffer);
      const buffer = this.audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      const now = this.audioContext.currentTime;
      this.nextStartTime = Math.max(now, this.nextStartTime);
      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
      
      source.onended = () => this.activeSources.delete(source);
      this.activeSources.add(source);
    }
  }
}
