
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
    if (!this.enabled || !pattern) return;
    try {
      // Ensure pattern is valid for the vibrate API (must be number or array of numbers)
      const validPattern = Array.isArray(pattern) 
        ? (pattern.length > 0 ? pattern : null)
        : pattern;
      
      if (validPattern !== null) {
        navigator.vibrate(validPattern as any);
      }
    } catch (e) {
      console.warn("Haptic feedback suppressed by browser/system:", e);
    }
  }

  public toggle(state: boolean) {
    this.enabled = state && 'vibrate' in navigator;
  }
}

export const haptic = new HapticService();
