
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

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
  private mediaStream: MediaStream | null = null;
  private workletNode: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private sessionPromise: Promise<any> | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  
  public onStatusChange: (status: LiveStatus) => void = () => {};
  public onAudioLevel: (level: number) => void = () => {};
  public onError: (error: Error) => void = () => {};

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(config: LiveConfig) {
    try {
      this.status = 'connecting';
      this.onStatusChange(this.status);

      // Initialize Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Get Microphone Stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      });

      this.sessionPromise = this.ai.live.connect({
        // Updated model name to latest preview from guidelines
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            this.status = 'connected';
            this.onStatusChange(this.status);
            this.startAudioInput();
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onclose: () => {
            this.status = 'disconnected';
            this.onStatusChange(this.status);
            this.disconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            this.status = 'error';
            this.onStatusChange(this.status);
            this.onError(new Error("Connection error"));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Kore' } }
          },
          systemInstruction: config.systemInstruction
        }
      });

    } catch (e: any) {
      console.error("Failed to connect:", e);
      this.status = 'error';
      this.onStatusChange(this.status);
      this.onError(e);
    }
  }

  private startAudioInput() {
    if (!this.audioContext || !this.mediaStream) return;

    // Use a context with 16kHz for input as required by the API
    const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputContext.createMediaStreamSource(this.mediaStream);
    
    // ScriptProcessor is used for streaming raw PCM
    const processor = inputContext.createScriptProcessor(4096, 1, 1);
    
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
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: uint8ArrayToBase64(new Uint8Array(pcmData.buffer))
          }
        });
      });
    };

    source.connect(processor);
    processor.connect(inputContext.destination);
    
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
        media: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
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
