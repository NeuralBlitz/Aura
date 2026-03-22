import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory database for demonstration
  const db: Record<string, any[]> = {
    projects: [],
    notes: [],
    settings: [],
    forums: [
      { 
        id: 'p1', 
        user: "Aura_System", 
        title: "Official: Substrate v4.5 Deployment Notes", 
        content: "The latest update introduces a zero-latency causal loop in the Gemini 3 Flash weights. Please report any temporal drift encountered in the Forge.",
        tag: "System",
        comments: [
          { id: 'c1', user: 'Protocol_Watcher', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=watch', text: 'Stability looks good on the West Coast nodes.', time: '1h ago', likes: 12 }
        ],
        likes: 1240,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura",
        time: "2h ago",
        isPinned: true
      }
    ],
    news: [],
    health: [],
    messages: [],
    tasks: [],
    inventory: [],
    contacts: [],
    mail: [
      { id: 1, sender: "Aura Support", subject: "Welcome to Aura Pro", preview: "Thanks for upgrading! Here are some tips to get started with advanced reasoning...", time: "10:30 AM", unread: true, avatar: "AS" },
      { id: 2, sender: "Google Cloud", subject: "Billing Alert", preview: "Your monthly statement for July is ready to view. Total amount: $0.00", time: "Yesterday", unread: false, avatar: "GC" },
    ],
  };

  // Generic API for all modules
  app.get("/api/store/:collection", (req, res) => {
    const { collection } = req.params;
    res.json(db[collection] || []);
  });

  app.post("/api/store/:collection", (req, res) => {
    const { collection } = req.params;
    const item = req.body;
    if (!db[collection]) db[collection] = [];
    
    const index = db[collection].findIndex((i: any) => i.id === item.id);
    if (index !== -1) {
      db[collection][index] = { ...db[collection][index], ...item };
    } else {
      db[collection].push({ ...item, id: item.id || Date.now().toString() });
    }
    res.json({ success: true, item });
  });

  app.delete("/api/store/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (db[collection]) {
      db[collection] = db[collection].filter((i: any) => i.id !== id);
    }
    res.json({ success: true });
  });

  // Specific Module: News (Server-side fetching)
  app.get("/api/news", async (req, res) => {
    try {
      // In a real app, you'd use a news API or Gemini here
      // For now, return the stored news or some defaults
      if (db.news.length === 0) {
        db.news = [
          { id: '1', title: "Gemini 3 Pro Architecture Unveiled", source: "NeuralBlitz", category: "AI & Tech", summary: "Researchers have successfully established a zero-latency causal loop.", time: "10m ago", url: "#", sentiment: 'bullish' },
          { id: '2', title: "Quantum Entanglement Networking", source: "ScienceDaily", category: "Science", summary: "New protocols allow instant data transfer across nodes.", time: "1h ago", url: "#", sentiment: 'neutral' },
        ];
      }
      res.json(db.news);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Specific Module: Weather
  app.get("/api/weather", (req, res) => {
    res.json({
      temp: 72,
      condition: "Clear",
      location: "Neo-Tokyo",
      forecast: [
        { day: "Mon", temp: 75, icon: "Sun" },
        { day: "Tue", temp: 70, icon: "Cloud" },
        { day: "Wed", temp: 68, icon: "CloudRain" },
      ]
    });
  });

  // Specific Module: System Status
  app.get("/api/system/status", (req, res) => {
    res.json({
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: "9.0.4-aura",
      nodes: 14203,
      latency: "14ms"
    });
  });

  app.get("/api/system/health", (req, res) => {
    res.json({
      reports: [
        { label: 'Identity Enclave', status: 'ok', value: 'AES-GCM Secure' },
        { label: 'Neural Coherence', status: 'ok', value: '99.4%' },
        { label: 'Database Integrity', status: 'ok', value: 'GoldenDAG Verified' },
        { label: 'Network Proxy', status: 'warn', value: `Latency ${Math.floor(Math.random() * 50)}ms` },
        { label: 'Memory Leakage', status: 'ok', value: 'None' },
      ]
    });
  });

  app.get("/api/market/prices", (req, res) => {
    const base = 65000;
    res.json({
      btc: base + Math.random() * 2000 - 1000,
      eth: 3500 + Math.random() * 200 - 100,
      sol: 145 + Math.random() * 10 - 5,
      nvda: 124 + Math.random() * 5 - 2.5,
      history: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        BTC: base + Math.random() * 2000 - 1000,
        ETH: 3500 + Math.random() * 200 - 100,
        SOL: 145 + Math.random() * 10 - 5
      }))
    });
  });

  app.get("/api/bio/sync", (req, res) => {
    const hour = new Date().getHours();
    const isDay = hour > 6 && hour < 18;
    res.json({
      isDay,
      energyLevel: isDay ? 85 : 40,
      peakFocus: "10:00 AM",
      recharge: "11:00 PM",
      cycle: isDay ? 'Solar Cycle' : 'Lunar Cycle'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aura OS Server running on http://localhost:${PORT}`);
  });
}

startServer();
