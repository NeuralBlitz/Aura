
import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, Play, RotateCcw, Sparkles, Zap, Cpu, 
  Settings2, Activity, Check, ChevronRight, Layout, 
  Fingerprint, Gauge, Layers, Maximize2, Minimize2, 
  Share2, AlertTriangle, Send, Bot, User, Code2, 
  Brain, ListChecks, TerminalSquare, Trash2, X,
  ZapOff, Monitor, Trash, RefreshCw, Save, History
} from 'lucide-react';
import { executeCode } from '../../services/forgeExecution';
import ForgeConsole from '../ForgeConsole';
import { LogEntry, ModelType, ForgeParam } from '../../types';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { auth, db } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import ModuleLayout from '../ui/ModuleLayout';

const MemoizedConsole = React.memo(ForgeConsole);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface ForgeViewProps {
  initialCode: string | null;
  onClearInjected?: () => void;
}

interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  thought?: string;
  code?: string;
  status?: 'thinking' | 'writing' | 'running' | 'debugging' | 'complete' | 'error';
}

interface AgentPlanStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

const DEFAULT_CODE = `// AURA OS v9.0 // UNIFIED SUBSTRATE FORGE
// Interactive Spatial Canvas: Neural Flow

AURA.clear();

// Simulation Parameters
// /* @param {min: 10, max: 200} */
const speed = 50;

// /* @param {min: 1, max: 100} */
const nodeCount = 40;

AURA.animate((time, { telemetry }) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw Background Grid
  AURA.utils.grid(ctx, 100, 'rgba(0, 242, 255, 0.03)');
  
  for(let i = 0; i < nodeCount; i++) {
    const pulse = AURA.utils.pulse(time, 0.5, 20);
    const angle = (i / nodeCount) * Math.PI * 2 + time / (10000 / speed);
    const x = canvas.width / 2 + Math.cos(angle) * (150 + pulse);
    const y = canvas.height / 2 + Math.sin(angle) * (150 + pulse);
    
    AURA.utils.neon(ctx, AURA.utils.hsl((time / 10 + i * 5) % 360, 70, 60), 15);
    ctx.fillStyle = AURA.utils.hsl((time / 10 + i * 5) % 360, 70, 60);
    ctx.beginPath();
    ctx.arc(x, y, 5 + Math.sin(time/200 + i) * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Occasional Glitch
    if (Math.random() > 0.99) {
      AURA.utils.glitch(ctx, x-20, y-20, 40, 40, 2);
    }
  }
});`;

const SNIPPETS = [
  { 
    id: 'particles', 
    label: 'Particle Flux', 
    code: `// Particle Flux Substrate
const particles = [];
for(let i=0; i<100; i++) particles.push({
  x: Math.random()*canvas.width, 
  y: Math.random()*canvas.height, 
  vx: Math.random()*2-1, 
  vy: Math.random()*2-1,
  hue: Math.random() * 60 + 180
});

AURA.animate((time) => {
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0,0,canvas.width, canvas.height);
  
  AURA.utils.grid(ctx, 80, 'rgba(0, 242, 255, 0.02)');
  
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
    
    AURA.utils.neon(ctx, AURA.utils.hsl(p.hue, 100, 50), 10);
    ctx.fillStyle = AURA.utils.hsl(p.hue, 100, 50);
    ctx.fillRect(p.x, p.y, 2, 2);
  });
});`
  },
  {
    id: 'interactive',
    label: 'Neural Touch',
    code: `// Neural Touch Interaction
let mouse = {x: 0, y: 0};
AURA.onInput('mousemove', (pos) => mouse = pos);

AURA.animate((time) => {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0,0,canvas.width, canvas.height);
  
  const pulse = AURA.utils.pulse(time, 2, 10);
  
  AURA.utils.neon(ctx, '#00f2ff', 20 + pulse);
  ctx.strokeStyle = '#00f2ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 50 + pulse, 0, Math.PI*2);
  ctx.stroke();
  
  // Glitch effect on hover
  AURA.utils.glitch(ctx, mouse.x - 60, mouse.y - 60, 120, 120, 0.5);
});`
  },
  {
    id: 'threejs',
    label: '3D Core',
    code: `// 3D Neural Core
AURA.render3D((scene, camera, THREE) => {
  const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
  const material = new THREE.MeshPhongMaterial({ 
    color: 0x00f2ff, 
    wireframe: true,
    emissive: 0x004444
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(0, 0, 20);
  scene.add(light);

  AURA.animate((time) => {
    mesh.rotation.x = time / 1000;
    mesh.rotation.y = time / 1500;
    mesh.scale.setScalar(1 + AURA.utils.pulse(time, 0.5, 0.1));
  });
});`
  },
  {
    id: 'neural-grid',
    label: 'Neural Grid',
    code: `// Neural Grid Substrate
AURA.animate((time) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Base Grid
  AURA.utils.grid(ctx, 40, 'rgba(0, 242, 255, 0.05)');
  
  // Scanlines
  AURA.utils.scanline(ctx, 'rgba(0, 242, 255, 0.03)', 4);
  
  // Noise
  AURA.utils.noise(ctx, 0.02);
  
  // Pulsing Core
  const pulse = AURA.utils.pulse(time, 0.5, 50);
  AURA.utils.bloom(ctx, 30 + pulse, '#00f2ff');
  ctx.strokeStyle = '#00f2ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, 100 + pulse, 0, Math.PI*2);
  ctx.stroke();
  
  // Reset composite for other elements
  ctx.globalCompositeOperation = 'source-over';
});`
  },
  {
    id: 'react',
    label: 'React Substrate',
    code: `// React Neural Substrate
const { useState, useEffect } = AURA.react;
const html = AURA.html;

function App() {
  const [count, setCount] = useState(0);
  
  return html\`
    <div className="text-center space-y-8 p-12 glass-morphic rounded-[3rem] border-blue-500/30">
      <h1 className="text-4xl font-black tracking-tighter text-blue-400">React Substrate</h1>
      <p className="text-neutral-400 font-mono">Neural Pulse Count: \${count}</p>
      <button 
        onClick=\${() => setCount(c => c + 1)}
        className="px-8 py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95"
      >
        Increment Pulse
      </button>
    </div>
  \`;
}

AURA.renderReact(App);`
  },
  {
    id: 'angular',
    label: 'Angular Substrate',
    code: `// Angular Neural Substrate
const template = \`
  <div class="text-center space-y-8 p-12 glass-morphic rounded-[3rem] border-purple-500/30">
    <h1 class="text-4xl font-black tracking-tighter text-purple-400">Angular Substrate</h1>
    <p class="text-neutral-400 font-mono">Neural Flux: {{ flux }}</p>
    <button 
      (click)="increment()"
      class="px-8 py-4 bg-purple-600 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-500 transition-all active:scale-95"
    >
      Amplify Flux
    </button>
  </div>
\`;

class AppComponent {
  flux = 0;
  increment() {
    this.flux++;
  }
}

AURA.renderAngular(AppComponent, template);`
  }
];

const ForgeView: React.FC<ForgeViewProps> = ({ initialCode, onClearInjected }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCode, setCurrentCode] = useState(initialCode || DEFAULT_CODE);
  const [plan, setPlan] = useState<AgentPlanStep[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [showCRT, setShowCRT] = useState(true);
  const [params, setParams] = useState<ForgeParam[]>([]);
  const [activeRightTab, setActiveRightTab] = useState<'editor' | 'config'>('editor');
  const [activeView, setActiveView] = useState<'agent' | 'editor' | 'preview' | 'console'>('agent');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRunTimer = useRef<any>(null);

  useEffect(() => {
    if (initialCode) {
      setCurrentCode(initialCode);
      if (onClearInjected) onClearInjected();
    }
  }, [initialCode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Persistence: Load Session
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    const loadSession = async () => {
      const docRef = doc(db, 'forge_sessions', userId);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentCode(data.code || DEFAULT_CODE);
          setMessages(data.messages || []);
          setPlan(data.plan || []);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `forge_sessions/${userId}`);
      }
    };

    loadSession();
  }, [isAuthReady, userId]);

  // Persistence: Save Session
  useEffect(() => {
    if (!isAuthReady || !userId || isProcessing) return;

    const saveSession = async () => {
      setIsSaving(true);
      const docRef = doc(db, 'forge_sessions', userId);
      try {
        await setDoc(docRef, {
          id: userId,
          userId,
          code: currentCode,
          messages,
          plan,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `forge_sessions/${userId}`);
      } finally {
        setIsSaving(false);
      }
    };

    const timeout = setTimeout(saveSession, 3000); // Debounce saves
    return () => clearTimeout(timeout);
  }, [currentCode, messages, plan, isAuthReady, userId, isProcessing]);

  // Parameter Extraction (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const lines = currentCode.split('\n');
      const newParams: ForgeParam[] = [];
      lines.forEach((line, idx) => {
        const match = line.match(/\/\/\s*\/\*\s*@param\s*(\{.*?\})\s*\*\//);
        if (match) {
          try {
            const config = JSON.parse(match[1]);
            const nextLine = lines[idx + 1];
            const valMatch = nextLine?.match(/(?:const|let|var)\s+(\w+)\s*=\s*([\d.]+)/);
            if (valMatch) {
              newParams.push({
                id: valMatch[1], label: valMatch[1],
                min: config.min ?? 0, max: config.max ?? 100,
                value: parseFloat(valMatch[2]), line: idx + 1
              });
            }
          } catch (e) {}
        }
      });
      setParams(newParams);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentCode]);

  useEffect(() => {
    if (autoRun) {
      if (autoRunTimer.current) clearTimeout(autoRunTimer.current);
      autoRunTimer.current = setTimeout(() => handleRun(currentCode), 800);
    }
  }, [currentCode, autoRun]);

  const handleRun = async (codeToRun: string) => {
    if (!canvasRef.current) return;
    setIsRunning(true);
    
    // Auto-switch to preview on mobile when running
    if (window.innerWidth < 1024) setActiveView('preview');
    
    const newLogs = await executeCode(codeToRun, canvasRef.current, setLogs);
    setLogs(newLogs);
    setIsRunning(false);
    return newLogs;
  };

  const safeGenerateContent = async (params: any, modelIndex = 0) => {
    const models = ['gemini-3.1-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
    if (modelIndex >= models.length) throw new Error('All neural models exhausted.');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        ...params,
        model: models[modelIndex]
      });
      return response;
    } catch (e: any) {
      console.warn(`Model ${models[modelIndex]} failed: ${e.message}. Falling back...`);
      return safeGenerateContent(params, modelIndex + 1);
    }
  };

  const handleReset = async () => {
    setMessages([]);
    setPlan([]);
    if (userId) {
      const docRef = doc(db, 'forge_sessions', userId);
      try {
        await setDoc(docRef, { messages: [], plan: [] }, { merge: true });
      } catch (e) {
        console.error('Failed to clear remote session:', e);
      }
    }
  };

  const resumeAgentLoop = () => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'agent' && lastMsg.status !== 'complete' && lastMsg.status !== 'error') {
      // Find where we left off
      const activeStep = plan.find(p => p.status === 'active' || p.status === 'pending');
      if (activeStep) {
        // We could resume here, but for now let's just re-trigger the loop with the last user prompt
        const lastUserPrompt = [...messages].reverse().find(m => m.role === 'user')?.content;
        if (lastUserPrompt) processAgentLoop(lastUserPrompt);
      }
    }
  };

  const processAgentLoop = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setIsProcessing(true);
    const userMsg: AgentMessage = { id: Date.now().toString(), role: 'user', content: userPrompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const agentId = (Date.now() + 1).toString();
    const initialAgentMsg: AgentMessage = { 
      id: agentId, 
      role: 'agent', 
      content: 'Initializing Neural Substrate...', 
      status: 'thinking' 
    };
    setMessages(prev => [...prev, initialAgentMsg]);

    try {
      const AURA_API_DOCS = `
      AURA SPATIAL SUBSTRATE API:
      - AURA.clear(): Clears the 2D canvas.
      - AURA.animate((time, { telemetry }) => { ... }): Main animation loop.
      - AURA.render(htmlString): Renders HTML overlay.
      - AURA.renderReact(Component): Renders a React component (use AURA.react and AURA.html).
      - AURA.renderAngular(ComponentClass, template): Renders an Angular component.
      - AURA.render3D((scene, camera, THREE) => { ... }): Initializes Three.js.
      - AURA.onInput(type, ({x, y}) => { ... }): Handles 'mousedown', 'mousemove', 'touchstart', etc.
      - AURA.vibrate(pattern): Triggers haptics.
      - AURA.log(...args): Logs to the Neural Log.
      - AURA.react: Access to React (useState, useEffect, etc).
      - AURA.html: Access to htm for React (use as html\`...\`).
      - AURA.angular: Access to Angular core.
      - AURA.utils: { 
          lerp(a,b,t), 
          clamp(v,min,max), 
          random(min,max), 
          hsl(h,s,l), 
          rgba(r,g,b,a),
          pulse(time, freq, amp),
          glitch(ctx, x, y, w, h, intensity),
          neon(ctx, color, blur),
          grid(ctx, size, color),
          scanline(ctx, color, spacing),
          noise(ctx, intensity),
          bloom(ctx, intensity, color)
        }
      - ctx: 2D Canvas Context.
      - canvas: HTMLCanvasElement (1280x720).
      - window.THREE: Three.js access.
      
      THEMATIC GUIDELINES:
      - Aesthetic: Cyberpunk, high-tech, neural, neon, glitchy.
      - Colors: Cyan (#00f2ff), Magenta (#ff00ff), Emerald (#10b981), Amber (#f59e0b).
      - Effects: Use AURA.utils.neon for glow, AURA.utils.glitch for digital artifacts, and AURA.utils.grid for structure.
      - Interactivity: Use AURA.onInput to make the substrate responsive to the user.
      - Frameworks: Prefer React (AURA.renderReact) for complex UI. Use AURA.html for JSX-like syntax.
      `;

      // Phase 1: Planning
      setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: 'Architecting multi-phase neural solution...', status: 'thinking' } : m));
      
      const planResponse = await safeGenerateContent({
        contents: `You are Aura Codex, the supreme architect of the spatial substrate.
        Task: ${userPrompt}
        
        ${AURA_API_DOCS}
        
        Create a comprehensive, logical plan. Break it into 3-5 distinct technical phases.
        Maintain the high-tech, neural aesthetic in your descriptions.
        Return the plan in JSON format: 
        { "plan": [ { "id": "1", "title": "Phase Title", "description": "Detailed technical goal" } ] }`,
        config: { responseMimeType: 'application/json' }
      });

      const planData = JSON.parse(planResponse.text);
      setPlan(planData.plan.map((p: any) => ({ ...p, status: 'pending' })));

      // Phase 2: Implementation Loop
      let code = currentCode + '\n\n// Aura Codex Modification\n';
      
      for (let i = 0; i < planData.plan.length; i++) {
        const step = planData.plan[i];
        setPlan(prev => prev.map(p => p.id === step.id ? { ...p, status: 'active' } : p));
        setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Implementing Phase ${i+1}: ${step.title}\n> ${step.description}`, status: 'writing' } : m));

        const codeResponse = await safeGenerateContent({
          contents: `
          SYSTEM: You are Aura Codex.
          CONTEXT: Building a spatial substrate for: ${userPrompt}
          PLAN: ${JSON.stringify(planData.plan)}
          CURRENT PHASE: ${step.title} (${step.description})
          EXISTING CODE: 
          ${code}
          
          ${AURA_API_DOCS}
          
          TASK: Write the code for this phase. Integrate it seamlessly with the existing code.
          If this is the final phase, ensure AURA.animate or AURA.render is fully implemented.
          Return ONLY the code. No markdown, no explanations.`,
        });

        const newCodeSegment = codeResponse.text.replace(/```javascript/g, '').replace(/```/g, '').trim();
        
        // Refinement Phase: Self-Review
        setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Reviewing Phase ${i+1} for logical consistency...`, status: 'thinking' } : m));
        const reviewResponse = await safeGenerateContent({
          contents: `
          Review this code segment for bugs, syntax errors, or API misuse:
          ${newCodeSegment}
          
          If there are issues, provide the corrected code. 
          If it is perfect, return the original code.
          Return ONLY the code.`,
        });

        code = reviewResponse.text.replace(/```javascript/g, '').replace(/```/g, '').trim();
        setCurrentCode(code);
        setPlan(prev => prev.map(p => p.id === step.id ? { ...p, status: 'completed' } : p));
      }

      // Phase 3: Final Validation & Iterative Healing
      setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: 'Finalizing substrate and performing runtime validation...', status: 'running' } : m));
      
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;

      while (attempts < maxAttempts && !success) {
        const runLogs = await handleRun(code);
        const errors = runLogs?.filter(l => l.type === 'error') || [];

        if (errors.length === 0) {
          success = true;
        } else {
          attempts++;
          setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Runtime error detected (Attempt ${attempts}/${maxAttempts}). Initiating neural repair...`, status: 'debugging' } : m));
          
          const healResponse = await safeGenerateContent({
            contents: `
            RUNTIME ERROR DETECTED.
            CODE:
            ${code}
            
            ERRORS:
            ${errors.map(e => e.content.join(' ')).join('\n')}
            
            ${AURA_API_DOCS}
            
            TASK: Fix the code. Ensure all variables are defined and AURA APIs are used correctly.
            Return ONLY the full corrected code.`,
          });
          
          code = healResponse.text.replace(/```javascript/g, '').replace(/```/g, '').trim();
          setCurrentCode(code);
        }
      }

      if (success) {
        setMessages(prev => prev.map(m => m.id === agentId ? { 
          ...m, 
          content: 'Substrate fabrication successful. All systems nominal. Spatial artifact is now live.', 
          status: 'complete',
          code: code
        } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === agentId ? { 
          ...m, 
          content: 'Substrate fabrication failed after multiple healing attempts. Manual intervention required.', 
          status: 'error',
          code: code
        } : m));
      }

    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === agentId ? { ...m, content: `Neural Link Severed: ${e.message}`, status: 'error' } : m));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ModuleLayout 
      title="Substrate Forge" 
      subtitle="Neural Code Synthesis" 
      status={isProcessing ? "SYNTHESIZING" : "SYSTEM NOMINAL"} 
      icon={Terminal} 
      color="blue"
    >
      <div className="flex flex-col lg:flex-row h-full bg-black/20 text-white font-mono selection:bg-blue-500/30 overflow-hidden relative w-full">
      {/* --- Left Sidebar: Agent Control (Desktop) / Agent Tab (Mobile) --- */}
      <div className={`
        w-full lg:w-96 border-r border-white/10 flex flex-col bg-black/40 backdrop-blur-xl z-20 transition-all duration-300
        ${activeView === 'agent' ? 'flex' : 'hidden lg:flex'}
      `}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Codex Agent</h2>
          </div>
          <div className="flex items-center gap-1 relative">
            {messages.length > 0 && messages[messages.length - 1]?.status !== 'complete' && messages[messages.length - 1]?.status !== 'error' && !isProcessing && (
              <button 
                onClick={resumeAgentLoop}
                className="p-2 hover:bg-white/5 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                title="Resume Interrupted Task"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            {showResetConfirm ? (
              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                <button 
                  onClick={() => { handleReset(); setShowResetConfirm(false); }}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded transition-all"
                >
                  Confirm Purge
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="p-1 hover:bg-white/5 rounded text-neutral-500 hover:text-white transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-600 hover:text-red-400 transition-all"
                title="Reset Codex Memory"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Plan Section */}
        {plan.length > 0 && (
          <div className="p-6 border-b border-white/10 bg-blue-600/5">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Mission Parameters</span>
            </div>
            <div className="space-y-3">
              {plan.map(step => (
                <div key={step.id} className="flex items-center gap-3 group">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                    step.status === 'completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                    step.status === 'active' ? 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 
                    'bg-neutral-800'
                  }`} />
                  <span className={`text-[10px] font-bold transition-colors ${
                    step.status === 'completed' ? 'text-neutral-500 line-through' : 
                    step.status === 'active' ? 'text-blue-400' : 
                    'text-neutral-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <Sparkles className="w-12 h-12 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Standby for instructions</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-1.5 rounded-lg bg-neutral-900 border border-white/10 ${msg.role === 'agent' ? 'text-blue-500' : 'text-emerald-500'}`}>
                  {msg.role === 'agent' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">
                  {msg.role === 'agent' ? 'Aura Codex' : 'Architect'}
                </span>
              </div>
              <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] leading-relaxed ${
                msg.role === 'user' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100' : 'bg-white/5 border border-white/5 text-neutral-300'
              }`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.status && msg.status !== 'complete' && (
                  <div className="mt-3 flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                    {msg.status}...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-black/60">
          <div className="relative group">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if(!isProcessing) processAgentLoop(input); } }}
              placeholder="Command the Codex..."
              className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-xs font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none h-24 no-scrollbar"
              disabled={isProcessing}
            />
            {isProcessing ? (
              <button 
                onClick={() => window.location.reload()}
                className="absolute right-3 bottom-3 p-2 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600/30 transition-all border border-red-500/20 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => processAgentLoop(input)}
                disabled={!input.trim()}
                className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-all active:scale-90"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Right Main Area: IDE --- */}
      <div className={`flex-1 flex flex-col min-w-0 ${activeView !== 'agent' ? 'flex' : 'hidden lg:flex'}`}>
        {/* Top Bar */}
        <div className="h-16 border-b border-white/10 bg-black/80 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white hidden sm:inline">Substrate Forge</span>
            </div>
            {isSaving && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] text-blue-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>SYNCING</span>
              </div>
            )}
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1 lg:gap-2">
              <button 
                onClick={() => setActiveRightTab('editor')}
                className={`px-2 lg:px-3 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeRightTab === 'editor' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Editor
              </button>
              <button 
                onClick={() => setActiveRightTab('config')}
                className={`px-2 lg:px-3 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeRightTab === 'config' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Config
              </button>
            </div>
            <div className="h-4 w-px bg-white/10 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-2">
              {SNIPPETS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setCurrentCode(s.code); handleRun(s.code); }}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-[8px] font-black uppercase tracking-widest text-neutral-500 hover:text-blue-400 transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
             <button 
               onClick={() => setAutoRun(!autoRun)}
               className={`p-2 rounded-lg transition-all border ${autoRun ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-transparent border-transparent text-neutral-600 hover:text-white'}`}
               title="Auto-Run Link"
             >
               {autoRun ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
             </button>
             <button onClick={() => handleRun(currentCode)} className="flex items-center gap-2 px-3 lg:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                <Play className="w-3 h-3 fill-current" /> Run
             </button>
          </div>
        </div>

        {/* Editor & Preview Split */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Editor / Config */}
          <div className={`flex-1 bg-[#050505] relative overflow-hidden flex ${activeView === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
            {activeRightTab === 'editor' ? (
              <>
                <div className="w-10 lg:w-12 bg-black border-r border-white/5 flex flex-col items-end py-6 pr-2 lg:pr-3 text-[9px] lg:text-[10px] text-neutral-700 select-none font-mono leading-relaxed pt-[26px]">
                  {currentCode.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea 
                  value={currentCode}
                  onChange={e => setCurrentCode(e.target.value)}
                  className="flex-1 bg-transparent p-4 lg:p-6 font-mono text-[12px] lg:text-[13px] leading-relaxed text-blue-100 resize-none focus:outline-none no-scrollbar selection:bg-blue-500/30"
                  spellCheck={false}
                />
              </>
            ) : (
              <div className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar">
                <div className="max-w-xl mx-auto space-y-6 lg:space-y-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <Settings2 className="w-5 h-5 text-purple-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Runtime Parameters</h3>
                  </div>
                  <div className="space-y-6 lg:space-y-8">
                    {params.length > 0 ? params.map(p => (
                      <div key={p.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] lg:text-[10px] font-black uppercase text-neutral-500 tracking-widest">{p.label}</span>
                          <span className="text-xs font-mono text-purple-400">{p.value}</span>
                        </div>
                        <input 
                          type="range" min={p.min} max={p.max} step={(p.max - p.min) / 100}
                          value={p.value} onChange={(e) => {
                            const lines = currentCode.split('\n');
                            lines[p.line] = lines[p.line].replace(/=\s*([\d.]+)/, `= ${e.target.value}`);
                            setCurrentCode(lines.join('\n'));
                          }}
                          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500"
                        />
                      </div>
                    )) : (
                      <div className="text-center py-12 text-neutral-600">
                        <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No dynamic tags found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview & Console */}
          <div className={`h-full lg:h-[40%] border-t border-white/10 flex flex-col lg:flex-row bg-black ${activeView === 'preview' || activeView === 'console' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Preview */}
            <div className={`flex-1 border-r border-white/10 relative overflow-hidden flex items-center justify-center bg-[#080808] ${activeView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
               <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                    <Monitor className="w-3 h-3" />
                    Visual Substrate
                  </div>
                  <button onClick={() => setShowCRT(!showCRT)} className={`px-2 py-1 rounded-md border text-[9px] font-bold ${showCRT ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-black/60 border-white/10 text-neutral-500'}`}>CRT</button>
               </div>
               <canvas 
                 ref={canvasRef} 
                 width={800} 
                 height={600} 
                 className={`max-w-full max-h-full object-contain shadow-2xl ${showCRT ? 'crt-effect' : ''}`}
               />
               {showCRT && (
                 <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />
               )}
            </div>

            {/* Console */}
            <div className={`w-full lg:w-96 flex flex-col bg-[#050505] ${activeView === 'console' ? 'flex' : 'hidden lg:flex'}`}>
               <div className="h-10 bg-neutral-900/50 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2">
                     <TerminalSquare className="w-3 h-3 text-neutral-400" />
                     <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Neural Log</span>
                  </div>
                  <button onClick={() => setLogs([])} className="p-1.5 hover:bg-white/10 rounded text-neutral-500 hover:text-red-400 transition-colors">
                     <Trash2 className="w-3 h-3" />
                  </button>
               </div>
               <div className="flex-1 overflow-hidden relative">
                  <MemoizedConsole logs={logs} isRunning={isRunning} onClear={() => setLogs([])} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Mobile Sub-Navigation --- */}
      <div className="lg:hidden h-16 bg-black border-t border-white/10 flex items-center justify-around px-2 z-[90] shrink-0">
        {[
          { id: 'agent', icon: Brain, label: 'Agent' },
          { id: 'editor', icon: Code2, label: 'Code' },
          { id: 'preview', icon: Monitor, label: 'Visual' },
          { id: 'console', icon: TerminalSquare, label: 'Log' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${activeView === tab.id ? 'text-blue-500' : 'text-neutral-600'}`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        .crt-effect {
          filter: contrast(1.1) brightness(1.1) saturate(1.2);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      </div>
    </ModuleLayout>
  );
};

export default ForgeView;
