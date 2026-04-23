
import { GoogleGenAI } from "@google/genai";

/**
 * AURA Transcription Service - Enterprise Grade
 * Handles audio/video transcription hooks and size caps using Gemini Multimodal.
 */
export class TranscriptionService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || (process.env as any).API_KEY || '' });
  private static SIZE_CAP_MB = 25;

  public static async transcribeAudio(audioBlob: Blob): Promise<string> {
    const sizeInMB = audioBlob.size / (1024 * 1024);
    if (sizeInMB > this.SIZE_CAP_MB) {
      throw new Error(`[TRANSCRIPTION_ERROR]: File size exceeds cap (${sizeInMB.toFixed(2)}MB > ${this.SIZE_CAP_MB}MB)`);
    }

    return this.processMedia(audioBlob, 'audio/mp3');
  }

  public static async transcribeVideo(videoBlob: Blob): Promise<string> {
    const sizeInMB = videoBlob.size / (1024 * 1024);
    if (sizeInMB > this.SIZE_CAP_MB) {
      throw new Error(`[TRANSCRIPTION_ERROR]: File size exceeds cap (${sizeInMB.toFixed(2)}MB > ${this.SIZE_CAP_MB}MB)`);
    }
    return this.processMedia(videoBlob, 'video/mp4');
  }

  private static async processMedia(blob: Blob, mimeType: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || (process.env as any).API_KEY;
    if (!apiKey) return "[TRANSCRIPTION_OFFLINE]: No API Key provided for neural processing.";

    try {
      const base64 = await this.blobToBase64(blob);
      
      const result = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { inlineData: { mimeType, data: base64 } },
          { text: "Provide a highly accurate, word-for-word transcript of this media. If there is no speech, describe the audio/visual content briefly. Format as a clean block of text." }
        ]
      });

      return result.text || "[TRANSCRIPTION_EMPTY]: No content detected.";
    } catch (e) {
      console.error("[TRANSCRIPTION_FAILURE]", e);
      return "[TRANSCRIPTION_ERROR]: Handshake failed with neurological processor.";
    }
  }

  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
