
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Session and Presence Management
const sessions = new Map<string, { id: string; userId: string; lastSeen: number; status: string }>();
const agents = new Map<string, { id: string; name: string; type: string; status: string; capabilities: string[] }>();

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", gateway: "Aura-Control-Plane-v5.0" });
});

app.get("/api/sessions", (req, res) => {
  res.json(Array.from(sessions.values()));
});

app.get("/api/agents", (req, res) => {
  res.json(Array.from(agents.values()));
});

// Socket.io Logic
io.on("connection", (socket) => {
  console.log(`[GATEWAY]: Client Connected - ${socket.id}`);
  
  socket.on("session:register", (data) => {
    const sessionId = data.sessionId || uuidv4();
    sessions.set(sessionId, {
      id: sessionId,
      userId: data.userId || "anonymous",
      lastSeen: Date.now(),
      status: "online"
    });
    socket.join(sessionId);
    socket.emit("session:ready", { sessionId });
    io.emit("presence:update", Array.from(sessions.values()));
  });

  socket.on("rpc:invoke", (data) => {
    console.log(`[RPC]: Invoking ${data.method}`, data.params);
    // Logic for agent to agent RPC calls
    socket.to(data.targetSessionId).emit("rpc:call", {
      method: data.method,
      params: data.params,
      callerId: socket.id
    });
  });

  socket.on("disconnect", () => {
    console.log(`[GATEWAY]: Client Disconnected - ${socket.id}`);
  });
});

// Vite Middleware for Dev
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`[AURA OS]: Gateway Socket Control Plane active on port ${PORT}`);
});
