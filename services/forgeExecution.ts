
import { LogEntry } from '../types';
import { telemetryService } from './telemetryService';

let activeCleanups: (() => void)[] = [];
let lastFlush = 0;

const safeStringify = (obj: any, depth = 0): string => {
  if (depth > 3) return '[Max Depth]';
  if (obj === null) return 'null';
  if (typeof obj === 'undefined') return 'undefined';
  if (typeof obj === 'function') return `[Function: ${obj.name || 'anon'}]`;
  if (obj instanceof Error) return obj.message;
  if (typeof obj !== 'object') return String(obj);
  try { return JSON.stringify(obj, null, 2); } catch (e) { return '[Circular]'; }
};

export const executeCode = async (
  code: string, 
  canvas?: HTMLCanvasElement, 
  onLogUpdate?: (logs: LogEntry[]) => void
): Promise<LogEntry[]> => {
  const logs: LogEntry[] = [];
  
  activeCleanups.forEach(cleanup => {
    try { cleanup(); } catch (e) {}
  });
  activeCleanups = [];

  const addLog = (type: LogEntry['type'], args: any[]) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: args.map(a => safeStringify(a)),
      timestamp: Date.now()
    };
    logs.push(entry);
    if (onLogUpdate) onLogUpdate([...logs]);
  };

  const mockConsole = {
    log: (...args: any[]) => addLog('log', args),
    error: (...args: any[]) => addLog('error', args),
    warn: (...args: any[]) => addLog('warn', args),
    info: (...args: any[]) => addLog('info', args),
    clear: () => { logs.length = 0; if(onLogUpdate) onLogUpdate([]); },
  };

  try {
    const cleanCode = code.replace(/```(javascript|js|ts|spatial)/g, '').replace(/```/g, '').trim();
    let currentTelemetry: any = {};
    const unsubscribe = telemetryService.subscribe(data => { currentTelemetry = data; });
    activeCleanups.push(unsubscribe);

    const body = `
      const ctx = canvas ? canvas.getContext('2d') : null;
      const THREE = window.THREE;
      
      const AURA = {
        get telemetry() { return currentTelemetry; },
        three: THREE,
        utils: {
          lerp: (a, b, t) => a + (b - a) * t,
          clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
          random: (min, max) => Math.random() * (max - min) + min,
          hsl: (h, s, l) => \`hsl(\${h}, \${s}%, \${l}%)\`,
          rgba: (r, g, b, a) => \`rgba(\${r}, \${g}, \${b}, \${a})\`,
        },
        onInput: (type, callback) => {
          if (!canvas) return;
          const handler = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
            const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
            callback({ x, y, originalEvent: e });
          };
          canvas.addEventListener(type, handler);
          registerCleanup(() => canvas.removeEventListener(type, handler));
        },
        render: (element) => {
          if (!canvas) return;
          const parent = canvas.parentElement;
          const existing = parent.querySelector('#aura-spatial-mount');
          if (existing) existing.remove();
          
          const mount = document.createElement('div');
          mount.id = 'aura-spatial-mount';
          mount.className = 'absolute inset-0 bg-black flex items-center justify-center p-8 overflow-auto no-scrollbar font-sans text-white';
          parent.appendChild(mount);
          
          if (typeof element === 'string') mount.innerHTML = element;
          else if (element instanceof HTMLElement) mount.appendChild(element);
          
          canvas.style.display = 'none';
          registerCleanup(() => { mount.remove(); canvas.style.display = 'block'; });
        },
        render3D: (setupFn) => {
           if (!canvas || !THREE) return;
           const scene = new THREE.Scene();
           const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
           const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
           renderer.setSize(canvas.width, canvas.height, false);
           setupFn(scene, camera, THREE);
           let frameId;
           const animate = () => {
             frameId = requestAnimationFrame(animate);
             renderer.render(scene, camera);
           };
           animate();
           registerCleanup(() => {
             cancelAnimationFrame(frameId);
             renderer.dispose();
           });
        },
        animate: (fn) => {
          let active = true;
          let frameId;
          const loop = (time) => { 
            if(!active) return;
            try {
              fn(time, { telemetry: currentTelemetry }); 
            } catch (e) {
              mockConsole.error("Animation Loop Error:", e);
              active = false;
            }
            frameId = requestAnimationFrame(loop); 
          };
          frameId = requestAnimationFrame(loop);
          registerCleanup(() => { active = false; cancelAnimationFrame(frameId); });
        },
        vibrate: (p) => navigator.vibrate?.(p || 100),
        clear: () => ctx?.clearRect(0, 0, canvas.width, canvas.height),
        log: (...args) => mockConsole.log(...args)
      };

      return (async () => {
        try {
          ${cleanCode}
          return "Spatial Substrate Active.";
        } catch (err) { throw err; }
      })();
    `;
    
    const registerCleanup = (fn: () => void) => activeCleanups.push(fn);
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const func = new AsyncFunction('console', 'canvas', 'registerCleanup', 'currentTelemetry', body);
    await func(mockConsole, canvas, registerCleanup, currentTelemetry);
  } catch (err: any) {
    addLog('error', [err]);
  }
  return logs;
};
