
import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { Message, ModelType, Thread } from '../types';
import { sendMessageStreamToGemini } from '../services/geminiService';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { haptic, HapticPattern } from '../services/hapticService';

export function useChat(currentThreadId: string, setCurrentThreadId: (id: string) => void, currentModel: ModelType, setCurrentModel: (model: ModelType) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    if (currentThreadId === 'main') {
      setMessages([]);
      return;
    }

    // Fetch thread info to set the correct model
    const fetchThreadInfo = async () => {
      try {
        const threadDoc = await getDoc(doc(db, 'threads', currentThreadId));
        if (threadDoc.exists()) {
          const data = threadDoc.data() as Thread;
          if (data.modelType) setCurrentModel(data.modelType);
        }
      } catch (e) {
        console.error("Failed to fetch thread info", e);
      }
    };
    fetchThreadInfo();

    const q = query(
      collection(db, `threads/${currentThreadId}/messages`),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          ...data,
          id: doc.id,
          timestamp: new Date(data.timestamp)
        } as Message);
      });

      setMessages(prev => {
        const streamingMessages = prev.filter(m => m.isStreaming);
        const merged = [...loadedMessages];
        streamingMessages.forEach(sm => {
          if (!merged.some(m => m.id === sm.id)) {
            merged.push(sm);
          }
        });
        return merged.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `threads/${currentThreadId}/messages`);
    });

    return () => unsubscribe();
  }, [currentThreadId]);

  const saveMessageToFirestore = async (threadId: string, message: Message) => {
    if (!auth.currentUser) return;
    try {
      const messageData: any = {
        id: message.id,
        threadId: threadId,
        userId: auth.currentUser.uid,
        role: message.role,
        text: message.text || '',
        timestamp: message.timestamp.getTime()
      };
      
      if (message.imageUrl) messageData.imageUrl = message.imageUrl;
      if (message.artifacts) messageData.artifacts = message.artifacts;
      if (message.widgets) messageData.widgets = message.widgets;
      if (message.thinkingSteps) messageData.thinkingSteps = message.thinkingSteps;
      if (message.groundingMetadata) messageData.groundingMetadata = message.groundingMetadata;
      
      await setDoc(doc(db, `threads/${threadId}/messages`, message.id), messageData);
    } catch (e) {
      console.error("Failed to save message", e);
    }
  };

  const handleSend = async (text: string = '', attachment?: string, enabledToolIds: string[] = []) => {
    if (!auth.currentUser) return;
    const safeText = typeof text === 'string' ? text : '';
    haptic.trigger(HapticPattern.UI_INTERACT);
    
    let threadId = currentThreadId;
    if (threadId === 'main') {
      const newThreadId = Date.now().toString();
      try {
        const title = safeText.trim() 
          ? (safeText.substring(0, 40) + (safeText.length > 40 ? '...' : '')) 
          : 'New Conversation';
          
        await setDoc(doc(db, 'threads', newThreadId), {
          id: newThreadId,
          userId: auth.currentUser.uid,
          title: title,
          modelType: currentModel,
          updatedAt: Date.now(),
          createdAt: Date.now()
        });
        threadId = newThreadId;
        setCurrentThreadId(newThreadId);
      } catch (e) {
        console.error("Failed to create thread", e);
        return;
      }
    } else {
      try {
        await setDoc(doc(db, 'threads', threadId), {
          updatedAt: Date.now()
        }, { merge: true });
      } catch (e) {}
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: safeText, imageUrl: attachment, timestamp: new Date(), threadId };
    setMessages(prev => [...prev, userMsg]);
    await saveMessageToFirestore(threadId, userMsg);
    
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'model', text: '', timestamp: new Date(), isStreaming: true, threadId }]);

    try {
      const stream = sendMessageStreamToGemini(messages, safeText, currentModel, attachment, undefined, enabledToolIds);
      let finalMessage: Message | null = null;
      for await (const chunk of stream) {
        setMessages(prev => prev.map(m => {
          if (m.id === assistantId) {
            finalMessage = { 
              ...m, text: chunk.text, 
              artifacts: chunk.artifacts, 
              widgets: chunk.widgets, 
              thinkingSteps: chunk.thinking,
              groundingMetadata: chunk.grounding,
              isStreaming: !chunk.done
            };
            return finalMessage;
          }
          return m;
        }));
      }
      if (finalMessage) {
        await saveMessageToFirestore(threadId, finalMessage);
      }
      haptic.trigger(HapticPattern.SUCCESS);
    } catch (e: any) {
      haptic.trigger(HapticPattern.ERROR);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: e.message, isError: true, isStreaming: false } : m));
    } finally { setIsLoading(false); }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    handleSend,
    clearHistory,
    bottomRef
  };
}
