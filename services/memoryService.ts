
import { GoogleGenAI } from "@google/genai";
import { MemoryRetrieval } from '../types';
import { vaultService } from './vaultService';

const DB_NAME = 'aura_mnemosyne_db';
const STORE_NAME = 'vectors';
const DB_VERSION = 1;

interface VectorRecord {
  id?: number;
  text: string;
  vector: number[];
  role: 'user' | 'model';
  timestamp: Date;
  isEncrypted?: boolean;
}

class MemoryService {
  private db: IDBDatabase | null = null;
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: "text-embedding-004",
        contents: [{ parts: [{ text }] }]
      });
      return response.embeddings?.[0]?.values || [];
    } catch (e: any) {
      return [];
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public async addMemory(text: string, role: 'user' | 'model') {
    if (!this.db) await this.initDB();
    if (!text || text.length < 5) return;

    const vector = await this.getEmbedding(text);
    if (vector.length === 0) return;

    let textToStore = text;
    let isEncrypted = false;

    if (vaultService.getStatus() === 'unlocked') {
      try {
        textToStore = await vaultService.encrypt(text);
        isEncrypted = true;
      } catch (e) {
        console.warn("Vault encryption failed, storing as plain text");
      }
    }

    const record: VectorRecord = {
      text: textToStore,
      vector,
      role,
      timestamp: new Date(),
      isEncrypted
    };

    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.add(record);
  }

  public async queryMemories(queryText: string, limit = 3): Promise<MemoryRetrieval[]> {
    if (!this.db) await this.initDB();
    
    const queryVector = await this.getEmbedding(queryText);
    if (queryVector.length === 0) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      const results: { item: VectorRecord, score: number }[] = [];

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value as VectorRecord;
          const score = this.cosineSimilarity(queryVector, record.vector);
          
          if (score > 0.65) {
            let finalMsg = record.text;
            if (record.isEncrypted) {
              if (vaultService.getStatus() === 'unlocked') {
                try {
                  finalMsg = await vaultService.decrypt(record.text);
                } catch (e) {
                  finalMsg = "[DECRYPTION FAILED: VAULT ERROR]";
                }
              } else {
                finalMsg = "[ENCRYPTED MEMORY: VAULT LOCKED]";
              }
            }
            results.push({ item: { ...record, text: finalMsg }, score });
          }
          cursor.continue();
        } else {
          const topResults = results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(r => ({
              id: r.item.id!,
              text: r.item.text,
              similarity: r.score,
              timestamp: r.item.timestamp,
              role: r.item.role
            }));
          resolve(topResults);
        }
      };
    });
  }

  public async getAllMemories(): Promise<(MemoryRetrieval & { vector: number[] })[]> {
    if (!this.db) await this.initDB();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result as VectorRecord[];
        resolve(records.map(r => ({
          id: r.id!,
          text: r.text,
          similarity: 1,
          timestamp: r.timestamp,
          role: r.role,
          vector: r.vector
        })));
      };
    });
  }
}

export const memoryService = new MemoryService();
