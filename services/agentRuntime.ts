
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { INTEGRATION_MESH } from "./toolRegistry";

class ControlPlane {
  private socket: Socket;
  private sessionId: string;
  private userId: string;

  private presenceStatus: 'online' | 'away' | 'offline' = 'offline';
  private kronJobs: Map<string, any> = new Map();

  constructor() {
    this.sessionId = localStorage.getItem("aura_session_id") || uuidv4();
    this.userId = localStorage.getItem("aura_user_id") || "agent_host";
    localStorage.setItem("aura_session_id", this.sessionId);
    
    this.socket = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    this.initHandlers();
    this.initKron();
  }

  private initKron() {
    // Schedule periodic maintenance or tasks (Kron)
    const heartbeatId = setInterval(() => {
      this.socket.emit("presence:heartbeat", { sessionId: this.sessionId, status: this.presenceStatus });
    }, 60000);
    this.kronJobs.set('heartbeat', heartbeatId);
  }

  public setPresence(status: 'online' | 'away' | 'offline') {
    this.presenceStatus = status;
    this.socket.emit("presence:manual_update", { status });
  }

  public async registerWebhook(url: string, events: string[]) {
    this.socket.emit("config:webhook_register", { url, events });
  }

  private initHandlers() {
    this.socket.on("connect", () => {
      console.log("[CONTROL-PLANE]: Connected to Gateway");
      this.socket.emit("session:register", {
        sessionId: this.sessionId,
        userId: this.userId
      });
    });

    this.socket.on("rpc:call", (data) => {
      console.log("[RPC]: Received remote call", data);
      // Execute local agent action
    });

    this.socket.on("presence:update", (sessions) => {
      console.log("[PRESENCE]: Update", sessions);
    });
  }

  public invokeRemote(targetSessionId: string, method: string, params: any) {
    this.socket.emit("rpc:invoke", {
      targetSessionId,
      method,
      params
    });
  }

  public getSessionId() {
    return this.sessionId;
  }
}

export const controlPlane = new ControlPlane();

export class AgentRuntime {
  public static async executeTool(toolId: string, params: any) {
    console.log(`[RUNTIME]: Executing ${toolId}`, params);
    
    // Dispatch to the correct integration
    const tool = INTEGRATION_MESH.find(t => t.id === toolId);
    if (!tool) throw new Error(`Integration ${toolId} not found in the mesh.`);

    // Mock successful execution
    return {
      status: "success",
      timestamp: Date.now(),
      data: `Simulated response from ${tool.name}`,
      payload: params
    };
  }
}
