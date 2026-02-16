
export const HapticPattern = {
  THINKING_START: [10, 50, 10],
  THINKING_PULSE: [20],
  SUCCESS: [10, 30, 10],
  ERROR: [50, 100, 50, 100, 50],
  TOOL_EXECUTE: [5, 20, 5],
  UI_INTERACT: [2]
};

class HapticService {
  private enabled: boolean = true;

  constructor() {
    this.enabled = 'vibrate' in navigator;
  }

  public trigger(pattern: number | number[]) {
    if (!this.enabled) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Haptic feedback suppressed by browser/system.");
    }
  }

  public toggle(state: boolean) {
    this.enabled = state && 'vibrate' in navigator;
  }
}

export const haptic = new HapticService();
