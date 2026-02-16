
export interface TelemetryData {
  batteryLevel: number;
  isCharging: boolean;
  online: boolean;
  connectionType: string;
  memoryUsage: number;
  totalMemory: number;
  uptime: number;
  coherence: number;
}

class TelemetryService {
  private startTime: number = Date.now();
  private listeners: Set<(data: TelemetryData) => void> = new Set();
  private data: TelemetryData = {
    batteryLevel: 1,
    isCharging: false,
    online: true,
    connectionType: 'wifi',
    memoryUsage: 0,
    totalMemory: 0,
    uptime: 0,
    coherence: 100
  };

  constructor() {
    this.init();
    setInterval(() => this.update(), 1000);
  }

  private async init() {
    // Battery listeners
    if ('getBattery' in navigator) {
      const battery: any = await (navigator as any).getBattery();
      const updateBattery = () => {
        this.data.batteryLevel = battery.level;
        this.data.isCharging = battery.charging;
        this.notify();
      };
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
      updateBattery();
    }

    // Connection listeners
    window.addEventListener('online', () => { this.data.online = true; this.notify(); });
    window.addEventListener('offline', () => { this.data.online = false; this.notify(); });
    
    if ('connection' in navigator) {
      const conn: any = (navigator as any).connection;
      conn.addEventListener('change', () => {
        this.data.connectionType = conn.effectiveType || 'unknown';
        this.notify();
      });
      this.data.connectionType = conn.effectiveType || 'unknown';
    }
  }

  private update() {
    this.data.uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Memory usage (Chrome/Edge only)
    if ((performance as any).memory) {
      const mem = (performance as any).memory;
      this.data.memoryUsage = Math.round(mem.usedJSHeapSize / 1048576);
      this.data.totalMemory = Math.round(mem.jsHeapLimit / 1048576);
    }

    // Coherence Calculation
    let coherence = 100;
    if (!this.data.online) coherence -= 50;
    if (this.data.batteryLevel < 0.2) coherence -= 20;
    if (this.data.memoryUsage > 500) coherence -= 10;
    this.data.coherence = Math.max(0, coherence);

    this.notify();
  }

  public subscribe(callback: (data: TelemetryData) => void) {
    this.listeners.add(callback);
    callback(this.data);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.data }));
  }
}

export const telemetryService = new TelemetryService();
