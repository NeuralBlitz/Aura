
const DB_NAME = 'aura_os_substrate';
const VERSION = 2;

class StorageService {
  async init(): Promise<void> {
    // Backend is always ready or handled by fetch
    return Promise.resolve();
  }

  async save<T>(storeName: string, item: T): Promise<void> {
    const response = await fetch(`/api/store/${storeName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error(`Failed to save to ${storeName}`);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const response = await fetch(`/api/store/${storeName}`);
    if (!response.ok) throw new Error(`Failed to fetch from ${storeName}`);
    return response.json();
  }

  async delete(storeName: string, id: string): Promise<void> {
    const response = await fetch(`/api/store/${storeName}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete from ${storeName}`);
  }
}

export const storageService = new StorageService();
