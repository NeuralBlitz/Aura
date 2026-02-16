
import { VaultStatus } from '../types';

class VaultService {
  private key: CryptoKey | null = null;
  private salt: Uint8Array | null = null;
  private status: VaultStatus = 'uninitialized';

  constructor() {
    this.checkInitialization();
  }

  private async checkInitialization() {
    const savedSalt = localStorage.getItem('aura_vault_salt');
    if (savedSalt) {
      this.status = 'locked';
      this.salt = new Uint8Array(savedSalt.split(',').map(Number));
    } else {
      this.status = 'uninitialized';
    }
  }

  public getStatus(): VaultStatus {
    return this.status;
  }

  public async initialize(pin: string): Promise<void> {
    this.salt = window.crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem('aura_vault_salt', this.salt.toString());
    await this.deriveKey(pin);
    this.status = 'unlocked';
  }

  public async unlock(pin: string): Promise<boolean> {
    if (!this.salt) return false;
    try {
      await this.deriveKey(pin);
      this.status = 'unlocked';
      return true;
    } catch (e) {
      return false;
    }
  }

  public lock(): void {
    this.key = null;
    this.status = 'locked';
  }

  private async deriveKey(pin: string): Promise<void> {
    const encoder = new TextEncoder();
    const pinData = encoder.encode(pin);
    
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      pinData,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    this.key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.salt!,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  public async encrypt(text: string): Promise<string> {
    if (!this.key || this.status !== 'unlocked') throw new Error("Vault Locked");
    
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = encoder.encode(text);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encodedText
    );

    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...result));
  }

  public async decrypt(encryptedBase64: string): Promise<string> {
    if (!this.key || this.status !== 'unlocked') throw new Error("Vault Locked");
    
    const data = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  }
}

export const vaultService = new VaultService();
