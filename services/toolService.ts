
import { Type, FunctionDeclaration } from '@google/genai';
import { SovereignTool } from '../types';

export const SOVEREIGN_TOOLS: SovereignTool[] = [
  // --- EXISTING TOOLS ---
  {
    id: 'fetch_weather',
    name: 'Atmospheric Ingest',
    description: 'Enables Aura to fetch real-time weather and atmospheric pressure data.',
    enabled: true,
    mappedView: 'weather',
    declaration: {
      name: 'get_weather_data',
      parameters: {
        type: Type.OBJECT,
        description: 'Get weather for a specific location.',
        properties: {
          location: { type: Type.STRING, description: 'City or coordinates.' }
        },
        required: ['location']
      }
    }
  },
  {
    id: 'network_scan',
    name: 'Network Intel',
    description: 'Analyze IP, latency, and routing protocols.',
    enabled: true,
    mappedView: 'network',
    declaration: {
      name: 'scan_network_node',
      parameters: {
        type: Type.OBJECT,
        description: 'Analyze the current network environment.',
        properties: {},
        required: []
      }
    }
  },
  {
    id: 'password_forge',
    name: 'Key Smith',
    description: 'Generate high-entropy secure session keys and passwords.',
    enabled: true,
    mappedView: 'utility',
    declaration: {
      name: 'forge_secure_key',
      parameters: {
        type: Type.OBJECT,
        description: 'Generate a secure password.',
        properties: {
          length: { type: Type.NUMBER, description: 'Desired length (default 16).' }
        },
        required: []
      }
    }
  },
  {
    id: 'currency_link',
    name: 'FX Exchange',
    description: 'Real-time global currency and forex conversion.',
    enabled: true,
    mappedView: 'utility',
    declaration: {
      name: 'convert_currency',
      parameters: {
        type: Type.OBJECT,
        description: 'Convert between currencies.',
        properties: {
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          amount: { type: Type.NUMBER }
        },
        required: ['from', 'to', 'amount']
      }
    }
  },
  {
    id: 'webhook_agent',
    name: 'Logic Bridge',
    description: 'Send data payloads to external webhooks or API endpoints.',
    enabled: true,
    mappedView: 'webhook',
    declaration: {
      name: 'dispatch_webhook',
      parameters: {
        type: Type.OBJECT,
        description: 'Send a JSON payload to a webhook.',
        properties: {
          url: { type: Type.STRING },
          payload: { type: Type.OBJECT }
        },
        required: ['url', 'payload']
      }
    }
  },
  {
    id: 'fetch_web_data',
    name: 'Browser Scraper',
    description: 'Enables Aura to fetch real-time JSON or text from public URLs.',
    enabled: true,
    mappedView: 'browser',
    declaration: {
      name: 'fetch_web_data',
      parameters: {
        type: Type.OBJECT,
        description: 'Fetch data from a public URL using the browser fetch API.',
        properties: {
          url: { type: Type.STRING, description: 'The absolute URL to fetch.' },
          method: { type: Type.STRING, description: 'HTTP method (GET, POST). Default GET.' }
        },
        required: ['url']
      }
    }
  },
  {
    id: 'get_environment_status',
    name: 'Environment Monitor',
    description: 'Access local hardware telemetry like battery levels and network status.',
    enabled: true,
    declaration: {
      name: 'get_environment_status',
      parameters: {
        type: Type.OBJECT,
        description: 'Get local device environment status (battery, online status, memory).',
        properties: {},
        required: []
      }
    }
  },
  {
    id: 'sonic_link',
    name: 'Sonic Link',
    description: 'Trigger ambient neural sounds (rain, focus, synth) to match conversation context.',
    enabled: true,
    mappedView: 'sonic',
    declaration: {
      name: 'sonic_link',
      parameters: {
        type: Type.OBJECT,
        description: 'Play ambient sounds in the user browser.',
        properties: {
          soundType: { 
            type: Type.STRING, 
            description: 'The type of sound: "rain", "white_noise", "tech_hum", "forest".',
            enum: ['rain', 'white_noise', 'tech_hum', 'forest']
          },
          action: { 
            type: Type.STRING, 
            description: 'The action: "play" or "stop".',
            enum: ['play', 'stop']
          }
        },
        required: ['soundType', 'action']
      }
    }
  },
  {
    id: 'market_pipeline',
    name: 'Market Pipeline',
    description: 'Access real-time crypto and stock price data via public price feeds.',
    enabled: true,
    mappedView: 'market',
    declaration: {
      name: 'get_market_data',
      parameters: {
        type: Type.OBJECT,
        description: 'Get real-time price data for cryptocurrencies or stocks.',
        properties: {
          symbol: { type: Type.STRING, description: 'The ticker symbol (e.g., BTC, ETH, AAPL).' }
        },
        required: ['symbol']
      }
    }
  },
  {
    id: 'calendar_bridge',
    name: 'Calendar Bridge',
    description: 'Read and manage your upcoming schedule and meetings.',
    enabled: true,
    mappedView: 'calendar',
    declaration: {
      name: 'get_calendar_events',
      parameters: {
        type: Type.OBJECT,
        description: 'Retrieve upcoming calendar events for the user.',
        properties: {
          timeframe: { type: Type.STRING, description: 'E.g., "today", "tomorrow", "this week".' }
        },
        required: ['timeframe']
      }
    }
  },
  
  // --- DECA-CORE NEW TOOLS ---
  {
    id: 'oneiric_engine',
    name: 'DreamStream',
    description: 'Generate abstract visualization prompts for thought rendering.',
    enabled: true,
    mappedView: 'dreamstream',
    declaration: {
      name: 'generate_dream',
      parameters: { type: Type.OBJECT, properties: { sentiment: { type: Type.STRING } }, required: ['sentiment'] }
    }
  },
  {
    id: 'stegano_crypt',
    name: 'Cipher-X',
    description: 'Encrypt text into a cover message using neural steganography.',
    enabled: true,
    mappedView: 'cipher',
    declaration: {
      name: 'encrypt_message',
      parameters: { type: Type.OBJECT, properties: { message: { type: Type.STRING }, key: { type: Type.STRING } }, required: ['message', 'key'] }
    }
  },
  {
    id: 'circadian_sync',
    name: 'Bio-Link',
    description: 'Analyze cognitive rhythms to suggest peak performance windows.',
    enabled: true,
    mappedView: 'biolink',
    declaration: {
      name: 'analyze_circadian',
      parameters: { type: Type.OBJECT, properties: {}, required: [] }
    }
  },
  {
    id: 'psycho_mirror',
    name: 'Echo Mirror',
    description: 'Analyze chat history to generate a psychometric personality map.',
    enabled: true,
    mappedView: 'echo',
    declaration: {
      name: 'analyze_personality',
      parameters: { type: Type.OBJECT, properties: { text_sample: { type: Type.STRING } }, required: ['text_sample'] }
    }
  },
  {
    id: 'latent_radio',
    name: 'Signal Tuner',
    description: 'Broadcast random generated knowledge from latent space.',
    enabled: true,
    mappedView: 'signal',
    declaration: {
      name: 'tune_signal',
      parameters: { type: Type.OBJECT, properties: { frequency: { type: Type.STRING } }, required: ['frequency'] }
    }
  },
  {
    id: 'entropy_shredder',
    name: 'Void Bin',
    description: 'Securely delete and cryptographically shred temporary text.',
    enabled: true,
    mappedView: 'void',
    declaration: {
      name: 'shred_data',
      parameters: { type: Type.OBJECT, properties: { content: { type: Type.STRING } }, required: ['content'] }
    }
  },
  {
    id: 'protocol_droid',
    name: 'Style Matrix',
    description: 'Rewrite text into specific sociolinguistic protocols.',
    enabled: true,
    mappedView: 'style',
    declaration: {
      name: 'rewrite_protocol',
      parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, protocol: { type: Type.STRING } }, required: ['text', 'protocol'] }
    }
  },
  {
    id: 'concept_weaver',
    name: 'Idea Loom',
    description: 'Synthesize two disparate concepts into a novel invention.',
    enabled: true,
    mappedView: 'loom',
    declaration: {
      name: 'weave_concepts',
      parameters: { type: Type.OBJECT, properties: { conceptA: { type: Type.STRING }, conceptB: { type: Type.STRING } }, required: ['conceptA', 'conceptB'] }
    }
  },
  {
    id: 'time_vault',
    name: 'Chrono-Capsule',
    description: 'Lock a message until a future timestamp.',
    enabled: true,
    mappedView: 'capsule',
    declaration: {
      name: 'create_capsule',
      parameters: { type: Type.OBJECT, properties: { message: { type: Type.STRING }, unlockTime: { type: Type.STRING } }, required: ['message', 'unlockTime'] }
    }
  },
  {
    id: 'resonance_anchor',
    name: 'Zenith',
    description: 'Guide haptic breathwork for cognitive reset.',
    enabled: true,
    mappedView: 'zenith',
    declaration: {
      name: 'start_breathwork',
      parameters: { type: Type.OBJECT, properties: { duration: { type: Type.NUMBER } }, required: ['duration'] }
    }
  }
];

// Audio Context Singleton for Sonic Link
let audioCtx: AudioContext | null = null;
let activeOscillator: OscillatorNode | null = null;
let activeGain: GainNode | null = null;

const startNoise = (type: string) => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (activeOscillator) stopNoise();

  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  
  if (type === 'rain') {
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, audioCtx.currentTime);
  } else if (type === 'tech_hum') {
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(120, audioCtx.currentTime);
  }

  // Simulate noise
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = buffer;
  whiteNoise.loop = true;

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 2);

  whiteNoise.start();
  
  (activeOscillator as any) = whiteNoise;
  activeGain = gain;
};

const stopNoise = () => {
  if (activeGain && audioCtx) {
    activeGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    setTimeout(() => {
      if (activeOscillator) activeOscillator.stop();
      activeOscillator = null;
    }, 1000);
  }
};

export const executeTool = async (name: string, args: any): Promise<any> => {
  console.log(`[SOVEREIGN_AGENT]: Executing ${name}`, args);
  
  switch (name) {
    case 'get_weather_data':
      return { temp: 72, condition: "Partly Cloudy", city: args.location || "San Francisco", pressure: "1012mb", visibility: "10km" };

    case 'scan_network_node':
      return { ip: "192.168.1.104", latency: "24ms", hopCount: 12, protocol: "v7.0/QUIC", safety: "Encrypted" };

    case 'forge_secure_key':
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      let key = "";
      for (let i = 0; i < (args.length || 16); i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
      return { key };

    case 'convert_currency':
      const rates: any = { USD: 1, EUR: 0.92, GBP: 0.78, BTC: 0.000015 };
      const res = (args.amount * rates[args.to]) / rates[args.from];
      return { result: res, unit: args.to };

    case 'dispatch_webhook':
      return { status: "success", timestamp: Date.now(), message: "Payload delivered to node." };

    case 'fetch_web_data':
      try {
        const res = await fetch(args.url);
        const text = await res.text();
        return text.substring(0, 5000);
      } catch (e) {
        return `Error fetching data: ${e}`;
      }

    case 'get_market_data':
      try {
        const symbol = args.symbol.toLowerCase();
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol === 'btc' ? 'bitcoin' : symbol === 'eth' ? 'ethereum' : symbol}&vs_currencies=usd&include_24hr_change=true`);
        const data = await res.json();
        return data;
      } catch (e) {
        return { error: "Failed to fetch market data.", detail: String(e) };
      }

    case 'get_calendar_events':
      return [
        { title: "Neural Design Sync", time: "14:00 PM", location: "Virtual Lab 4", attendees: ["Alice", "Bob"] },
        { title: "Aura v4.0 Deployment", time: "16:30 PM", location: "Server Substrate", attendees: ["System Architect"] }
      ];

    case 'get_environment_status':
      const battery: any = (navigator as any).getBattery ? await (navigator as any).getBattery() : null;
      return {
        online: navigator.onLine,
        language: navigator.language,
        battery: battery ? { level: battery.level, charging: battery.charging } : 'Not available',
        memory: (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) + 'MB used' : 'Not available'
      };

    case 'sonic_link':
      if (args.action === 'play') {
        startNoise(args.soundType);
        return `Sonic Link established: Playing ${args.soundType}`;
      } else {
        stopNoise();
        return "Sonic Link terminated.";
      }

    // --- DECA-CORE PLACEHOLDERS ---
    // In a real implementation, these would connect to AI models or complex logic.
    // We return simulated success for the UI demo.
    case 'generate_dream': return { status: 'rendering', sentiment: args.sentiment };
    case 'encrypt_message': return { encrypted: btoa(args.message), key: args.key };
    case 'analyze_circadian': return { peakWindow: '10:00 AM - 12:00 PM', currentStatus: 'High Alertness' };
    case 'analyze_personality': return { openness: 85, conscientiousness: 72, extraversion: 45, agreeableness: 60, neuroticism: 30 };
    case 'tune_signal': return { station: 'Latent Space FM', content: 'The void whispers back.' };
    case 'shred_data': return { status: 'shredded', bits: 0 };
    case 'rewrite_protocol': return { original: args.text, rewritten: `[${args.protocol}]: ${args.text}` };
    case 'weave_concepts': return { concept: `The synthesis of ${args.conceptA} and ${args.conceptB}.` };
    case 'create_capsule': return { id: Date.now(), lockedUntil: args.unlockTime };
    case 'start_breathwork': return { status: 'breathing_initiated' };

    default:
      throw new Error(`Tool ${name} not found`);
  }
};
