
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
      // Create a lazy proxy for the 2D context to avoid initializing it unless used.
      // This prevents conflicts when the user wants to use WebGL (3D).
      let cachedCtx = null;
      const ctx = canvas ? new Proxy({}, {
        get: (target, prop) => {
          if (prop === 'canvas') return canvas;
          if (!cachedCtx) {
            cachedCtx = canvas.getContext('2d');
          }
          if (!cachedCtx) {
            // Return a no-op for functions, undefined for properties if 2D context is unavailable (e.g. WebGL active)
            return typeof HTMLCanvasElement.prototype[prop] === 'function' ? () => {} : undefined;
          }
          const value = cachedCtx[prop];
          return typeof value === 'function' ? value.bind(cachedCtx) : value;
        },
        set: (target, prop, value) => {
          if (!cachedCtx) {
            cachedCtx = canvas.getContext('2d');
          }
          if (!cachedCtx) return false;
          cachedCtx[prop] = value;
          return true;
        }
      }) : null;

      const THREE = window.THREE;
      const React = window.React;
      const ReactDOM = window.ReactDOM;
      const htm = window.htm;
      const html = htm ? htm.bind(React.createElement) : null;
      
      const AURA = {
        get telemetry() { return currentTelemetry; },
        three: THREE,
        react: React,
        reactDOM: ReactDOM,
        html: html,
        angular: window.ng,
        utils: {
          lerp: (a, b, t) => a + (b - a) * t,
          clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
          random: (min, max) => Math.random() * (max - min) + min,
          dist: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
          hsl: (h, s, l) => \`hsl(\${h}, \${s}%, \${l}%)\`,
          rgba: (r, g, b, a) => \`rgba(\${r}, \${g}, \${b}, \${a})\`,
          pulse: (time, freq = 1, amp = 1) => Math.sin(time * 0.001 * freq * Math.PI * 2) * amp,
          glitch: (targetCtx, x, y, w, h, intensity = 1) => {
            let c = targetCtx;
            let _x = x, _y = y, _w = w, _h = h, _i = intensity;
            if (typeof targetCtx === 'number') {
              c = ctx; _x = targetCtx; _y = x; _w = y; _h = w; _i = h;
            } else if (!targetCtx) {
              c = ctx;
            }
            if (!c || !canvas) return;
            const offset = Math.random() * 10 * (_i || 1);
            try {
              c.drawImage(canvas, _x, _y, _w, _h, _x + offset, _y, _w, _h);
              if (Math.random() > 0.9) {
                c.fillStyle = \`rgba(255, 0, 0, \${0.1 * (_i || 1)})\`;
                c.fillRect(_x, _y, _w, _h);
              }
            } catch(e) {}
          },
          neon: (targetCtx, color, blur = 10) => {
            let c = targetCtx;
            let col = color;
            let b = blur;
            if (typeof targetCtx === 'string') {
              c = ctx; col = targetCtx; b = color;
            } else if (!targetCtx) {
              c = ctx;
            }
            if (!c) return;
            c.shadowColor = col;
            c.shadowBlur = b;
          },
          scanline: (targetCtx, color = 'rgba(0, 242, 255, 0.05)', spacing = 4) => {
            let c = targetCtx;
            let col = color;
            let s = spacing;
            if (typeof targetCtx === 'string') {
              c = ctx; col = targetCtx; s = color;
            } else if (!targetCtx) {
              c = ctx;
            }
            if (!c || !canvas) return;
            try {
              c.save();
              c.strokeStyle = col;
              c.lineWidth = 1;
              for (let y = 0; y < canvas.height; y += (s || 4)) {
                c.beginPath(); c.moveTo(0, y); c.lineTo(canvas.width, y); c.stroke();
              }
              c.restore();
            } catch(e) {}
          },
          noise: (targetCtx, intensity = 0.05) => {
            let c = targetCtx;
            let i = intensity;
            if (typeof targetCtx === 'number') {
              c = ctx; i = targetCtx;
            } else if (!targetCtx) {
              c = ctx;
            }
            if (!c || !canvas) return;
            try {
              c.save();
              c.fillStyle = 'rgba(255, 255, 255, ' + (i || 0.05) + ')';
              for (let j = 0; j < 1000; j++) {
                c.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
              }
              c.restore();
            } catch(e) {}
          },
          bloom: (targetCtx, intensity = 15, color = 'white') => {
            let c = targetCtx;
            let i = intensity;
            let col = color;
            if (typeof targetCtx === 'number') {
              c = ctx; i = targetCtx; col = color;
            } else if (!targetCtx) {
              c = ctx;
            }
            if (!c) return;
            c.shadowBlur = i || 15;
            c.shadowColor = col || 'white';
            c.globalCompositeOperation = 'screen';
          },
          grid: (targetCtx, size = 50, color = 'rgba(255, 255, 255, 0.05)') => {
            let c = targetCtx;
            let s = size;
            let col = color;
            if (typeof targetCtx === 'number') {
              c = ctx; s = targetCtx; col = size;
            } else if (typeof targetCtx === 'string') {
              c = ctx; s = 50; col = targetCtx;
            } else if (!targetCtx) {
              c = ctx;
            }
            if (!c || !canvas) return;
            try {
              c.strokeStyle = col || 'rgba(255, 255, 255, 0.05)';
              c.lineWidth = 0.5;
              const step = s || 50;
              for (let x = 0; x <= canvas.width; x += step) {
                c.beginPath(); c.moveTo(x, 0); c.lineTo(x, canvas.height); c.stroke();
              }
              for (let y = 0; y <= canvas.height; y += step) {
                c.beginPath(); c.moveTo(0, y); c.lineTo(canvas.width, y); c.stroke();
              }
            } catch(e) {}
          }
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
          if (!parent) return;
          
          try {
            const containerId = 'aura-spatial-mount';
            let mount = parent.querySelector('#' + containerId);
            
            if (!mount) {
              mount = document.createElement('div');
              mount.id = containerId;
              mount.className = 'absolute inset-0 bg-black flex items-center justify-center p-8 overflow-auto no-scrollbar font-sans text-white z-50';
              if (parent.isConnected || parent.parentNode) {
                parent.appendChild(mount);
              }
            }
            
            mount.innerHTML = '';
            if (typeof element === 'string') {
              mount.innerHTML = element;
            } else if (element instanceof HTMLElement) {
              mount.appendChild(element);
            }
            
            canvas.style.display = 'none';
            
            const cleanup = () => { 
              try {
                if (mount && mount.parentNode) mount.remove(); 
              } catch(e) {}
              try {
                if (canvas && canvas.parentNode) canvas.style.display = 'block'; 
              } catch(e) {}
            };
            registerCleanup(cleanup);
          } catch (err) {
            mockConsole.error("AURA.render failure:", err);
          }
        },
        renderReact: (Component) => {
          if (!canvas || !ReactDOM) return;
          const parent = canvas.parentElement;
          if (!parent) return;

          try {
            let mount = parent.querySelector('[id="aura-react-mount"]');
            if (!mount) {
              mount = document.createElement('div');
              mount.id = 'aura-react-mount';
              mount.className = 'absolute inset-0 bg-black flex items-center justify-center p-8 overflow-auto no-scrollbar font-sans text-white z-50';
              if (parent.isConnected || parent.parentNode) {
                parent.appendChild(mount);
              }
            } else {
              mount.innerHTML = '';
            }
            
            const root = ReactDOM.createRoot(mount);
            root.render(React.createElement(Component));
            canvas.style.display = 'none';
            
            registerCleanup(() => { 
              try { root.unmount(); } catch(e) {}
              try {
                if (mount && mount.parentNode) mount.remove(); 
              } catch(e) {}
              try {
                if (canvas && canvas.parentNode) canvas.style.display = 'block'; 
              } catch(e) {}
            });
          } catch (err) {
            mockConsole.error("AURA.renderReact failure:", err);
          }
        },
        renderAngular: (componentClass, template) => {
          if (!canvas || !window.ng) return;
          const parent = canvas.parentElement;
          if (!parent) return;

          try {
            let mount = parent.querySelector('[id="aura-angular-mount"]');
            if (mount) {
              mount.innerHTML = '';
            } else {
              mount = document.createElement('div');
              mount.id = 'aura-angular-mount';
              mount.className = 'absolute inset-0 bg-black flex items-center justify-center p-8 overflow-auto no-scrollbar font-sans text-white z-50';
              if (parent.isConnected || parent.parentNode) {
                parent.appendChild(mount);
              }
            }
            
            const { Component, NgModule } = window.ng.core;
            const { BrowserModule } = window.ng.platformBrowser;
            const { platformBrowserDynamic } = window.ng.platformBrowserDynamic;

            const AppComp = Component({
              selector: 'aura-angular-mount',
              template: template || '<div>Angular Substrate Active</div>'
            })(componentClass || class {});

            const AppModule = NgModule({
              imports: [BrowserModule],
              declarations: [AppComp],
              bootstrap: [AppComp]
            })(class {});

            platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {
              registerCleanup(() => { 
                try { ref.destroy(); } catch(e) {}
                try {
                  if (mount && mount.parentNode) mount.remove(); 
                } catch(e) {}
                try {
                  if (canvas && canvas.parentNode) canvas.style.display = 'block'; 
                } catch(e) {}
              });
            });
            canvas.style.display = 'none';
          } catch (err) {
            mockConsole.error("AURA.renderAngular failure:", err);
          }
        },
        render3D: (setupFn) => {
           if (!canvas || !THREE) return;
           
           let targetCanvas = canvas;
           
           // If the canvas already has a 2D context, we must replace it to get a WebGL context
           if (cachedCtx || canvas.getContext('2d')) {
             const parent = canvas.parentElement;
             if (parent && canvas.parentNode === parent) {
               const newCanvas = document.createElement('canvas');
               newCanvas.width = canvas.width;
               newCanvas.height = canvas.height;
               newCanvas.className = canvas.className;
               newCanvas.style.cssText = canvas.style.cssText;
               try {
                 if (parent.contains(canvas)) {
                   parent.replaceChild(newCanvas, canvas);
                   targetCanvas = newCanvas;
                 }
               } catch (e) {
                 mockConsole.error("Canvas replacement failed:", e);
                 targetCanvas = canvas;
               }
               // Update the local reference for the rest of the execution
               // Note: This only affects the 3D renderer's target
             }
           }

           try {
             const scene = new THREE.Scene();
             const camera = new THREE.PerspectiveCamera(75, targetCanvas.width / targetCanvas.height, 0.1, 1000);
             const renderer = new THREE.WebGLRenderer({ 
               canvas: targetCanvas, 
               antialias: true, 
               alpha: true,
               preserveDrawingBuffer: true
             });
             renderer.setSize(targetCanvas.width, targetCanvas.height, false);
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
               renderer.forceContextLoss();
               // If we replaced the canvas, we might want to put the old one back or just let it be
               // For now, replacing it is enough to fix the immediate error.
             });
           } catch (e) {
             mockConsole.error("WebGL Initialization Error:", e);
             if (e.message?.includes('already has a context')) {
                mockConsole.error("Tip: A 2D context is already active. The AURA.render3D utility attempted to replace the canvas, but failed.");
             }
           }
        },
        animate: (fn) => {
          let active = true;
          let frameId;
          const loop = (time) => { 
            if(!active) return;
            try {
              fn(time, { telemetry: currentTelemetry }); 
              frameId = requestAnimationFrame(loop); 
            } catch (e) {
              mockConsole.error("Animation Loop Error:", e);
              active = false;
            }
          };
          frameId = requestAnimationFrame(loop);
          registerCleanup(() => { active = false; cancelAnimationFrame(frameId); });
        },
        vibrate: (p) => navigator.vibrate?.(p || 100),
        clear: () => {
          if (!canvas) return;
          // Only clear if 2D context is ALREADY active. 
          // We don't want to call getContext('2d') if it might trigger a conflict.
          // Since we can't check without calling it, we'll use our cachedCtx if available.
          if (cachedCtx) {
            cachedCtx.clearRect(0, 0, canvas.width, canvas.height);
          } else {
            // If no cachedCtx, we check if we can get one WITHOUT forcing it if WebGL is active
            // Actually, the safest way is to just not clear if we haven't used 2D yet.
            // Or we can try to get it but catch the error.
            try {
              const actualCtx = canvas.getContext('2d');
              if (actualCtx) actualCtx.clearRect(0, 0, canvas.width, canvas.height);
            } catch (e) {}
          }
        },
        log: (...args) => mockConsole.log(...args),
        onCleanup: (fn) => registerCleanup(fn)
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
