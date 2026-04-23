
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { AutomatedAgent, AgentSession } from '../types';

export class AgentService {
  private static COLLECTION = 'automated_agents';
  private static SESSIONS = 'agent_sessions';

  static async createAgent(agent: Omit<AutomatedAgent, 'id' | 'runCount' | 'userId'>): Promise<string> {
    if (!auth.currentUser) throw new Error("Authentication Required");

    const newAgent: Omit<AutomatedAgent, 'id'> = {
      ...agent,
      userId: auth.currentUser.uid,
      runCount: 0,
      status: 'idle'
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), newAgent);
    return docRef.id;
  }

  static subscribeToAgents(callback: (agents: AutomatedAgent[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, this.COLLECTION),
      where('userId', '==', auth.currentUser.uid)
    );

    return onSnapshot(q, (snapshot) => {
      const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AutomatedAgent));
      callback(agents);
    });
  }

  static async updateAgent(agentId: string, updates: Partial<AutomatedAgent>) {
    const ref = doc(db, this.COLLECTION, agentId);
    await updateDoc(ref, updates);
  }

  static async deleteAgent(agentId: string) {
    await deleteDoc(doc(db, this.COLLECTION, agentId));
  }

  static async runAgent(agentId: string) {
    // In a real environment, this would trigger an edge function or background worker
    console.log(`[AGENT_SERVICE]: Executing Agent ${agentId}...`);
    
    const session: Omit<AgentSession, 'id'> = {
      agentId,
      status: 'running',
      logs: ['[SYSTEM]: Neutral handshake initiated...', '[SYSTEM]: Checking trigger conditions...'],
      startTime: Date.now()
    };

    const sessionRef = await addDoc(collection(db, this.SESSIONS), session);
    
    // Simulate progression
    setTimeout(async () => {
      await updateDoc(doc(db, this.SESSIONS, sessionRef.id), {
        status: 'completed',
        logs: [...session.logs, '[SYSTEM]: Task chain executed successfully.', '[SYSTEM]: Artifacts synced.'],
        endTime: Date.now()
      });

      const agentRef = doc(db, this.COLLECTION, agentId);
      await updateDoc(agentRef, {
        lastRun: Date.now(),
        runCount: (await (await getDocs(query(collection(db, this.COLLECTION), where('id', '==', agentId)))).docs[0]?.data().runCount || 0) + 1
      });
    }, 3000);

    return sessionRef.id;
  }
}
