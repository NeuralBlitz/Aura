
import React, { useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import InputArea from './components/InputArea';
import ChatMessage from './components/ChatMessage';
import StartDashboard from './components/views/StartDashboard';
import ProfilePanel from './components/ProfilePanel';
import ArtifactCanvas from './components/ArtifactCanvas';
import BottomNav from './components/BottomNav';
import ForgeView from './components/views/ForgeView';
import SearchView from './components/views/SearchView';
import Marketplace from './components/ModuleRegistry';
import NexusView from './components/views/NexusView';
import ProjectsView from './components/views/ProjectsView';
import NotesView from './components/views/NotesView';
import NewsView from './components/views/NewsView';
import ForumsView from './components/views/ForumsView';
import ScriptoriumView from './components/views/ScriptoriumView';
import LiveView from './components/views/LiveView';
import ChangelogView from './components/views/ChangelogView';
import FocusView from './components/views/FocusView';
import NetworkView from './components/views/NetworkView';
import UtilityView from './components/views/UtilityView';
import TranslateView from './components/views/TranslateView';
import HealthView from './components/views/HealthView';
import MarketView from './components/views/MarketView';
import SonicView from './components/views/SonicView';
import WeatherView from './components/views/WeatherView';
import CalendarView from './components/views/CalendarView';
import BrowserView from './components/views/BrowserView';
import WebhookView from './components/views/WebhookView';
import DreamStreamView from './components/views/DreamStreamView';
// New Standalone Modules
import CipherView from './components/views/CipherView';
import VoidView from './components/views/VoidView';
import CapsuleView from './components/views/CapsuleView';
import BioLinkView from './components/views/BioLinkView';
import EchoView from './components/views/EchoView';
import ZenithView from './components/views/ZenithView';
import SignalView from './components/views/SignalView';
import StyleView from './components/views/StyleView';
import LoomView from './components/views/LoomView';

import FloatingChat from './components/FloatingChat';
import AuraSplash from './components/AuraSplash';
import OnboardingFlow from './components/OnboardingFlow';
import GlobalCommandPalette from './components/GlobalCommandPalette';
import AuthScreen from './components/AuthScreen';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import PromptManager from './components/PromptManager';
import { Message, ModelType, Artifact, UserPreferences, UserProfile, Tab, MorphingState, Thread, CustomPrompt } from './types';
import { sendMessageStreamToGemini } from './services/geminiService';
import { telemetryService, TelemetryData } from './services/telemetryService';
import { haptic, HapticPattern } from './services/hapticService';
import { storageService } from './services/storageService';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelType>(ModelType.GEMINI_FLASH);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromptManagerOpen, setIsPromptManagerOpen] = useState(false);
  const [forgeCode, setForgeCode] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [morphingState, setMorphingState] = useState<MorphingState>('standby');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'Explorer', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aura', bio: 'AURA OS v9.0 Architect', level: 9, exp: 14200
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultModel: ModelType.GEMINI_FLASH, theme: 'dark', accentColor: 'blue',
    notificationsEnabled: true, autoOpenArtifacts: true, installedModules: ['news', 'forums', 'focus', 'network', 'utility', 'translate', 'health', 'projects', 'notes', 'market', 'sonic', 'dreamstream', 'cipher', 'biolink'], isVaultEnabled: false
  });

  useEffect(() => { 
    storageService.init();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    telemetryService.subscribe(setTelemetry);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserProfile(prev => ({
          ...prev,
          username: user.displayName || user.email?.split('@')[0] || 'Explorer',
          avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
        }));
        
        // Ensure user document exists
        try {
          const userData: any = {
            uid: user.uid,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: Date.now()
          };
          if (user.email) userData.email = user.email;
          
          await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        } catch (e) {
          console.error("Failed to sync user profile to Firestore:", e);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthChecking(false);
    }, (error) => {
      console.error("Auth State Error:", error);
      setIsAuthChecking(false);
    });
    
    // Safety timeout for auth check
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) return;
    
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
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [currentThreadId, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'home') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeTab]);

  const saveMessageToFirestore = async (threadId: string, message: Message) => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, `threads/${threadId}/messages`, message.id), {
        id: message.id,
        threadId: threadId,
        userId: auth.currentUser.uid,
        role: message.role,
        text: message.text || '',
        timestamp: message.timestamp.getTime()
      });
    } catch (e) {
      console.error("Failed to save message", e);
    }
  };

  const handleSend = async (text: string = '', attachment?: string) => {
    if (!auth.currentUser) return;
    const safeText = text || '';
    haptic.trigger(HapticPattern.UI_INTERACT);
    
    let threadId = currentThreadId;
    if (threadId === 'main') {
      const newThreadId = Date.now().toString();
      try {
        await setDoc(doc(db, 'threads', newThreadId), {
          id: newThreadId,
          userId: auth.currentUser.uid,
          title: safeText.substring(0, 40) + (safeText.length > 40 ? '...' : '') || 'New Conversation',
          modelType: currentModel,
          updatedAt: Date.now(),
          createdAt: Date.now()
        });
        threadId = newThreadId;
        setCurrentThreadId(newThreadId);
      } catch (e) {
        console.error("Failed to create thread", e);
        return; // Don't proceed if thread creation failed
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
      const stream = sendMessageStreamToGemini(messages, safeText, currentModel, attachment);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'nexus': return <NexusView preferences={preferences} userProfile={userProfile} onLaunch={(id: any) => setActiveTab(id)} />;
      case 'news': return <NewsView />;
      case 'translate': return <TranslateView />;
      case 'health': return <HealthView />;
      case 'forums': return <ForumsView />;
      case 'projects': return <ProjectsView />;
      case 'notes': return <NotesView />;
      case 'scriptorium': return <ScriptoriumView />;
      case 'changelog': return <ChangelogView />;
      case 'focus': return <FocusView />;
      case 'network': return <NetworkView />;
      case 'utility': return <UtilityView />;
      case 'market': return <MarketView />;
      case 'sonic': return <SonicView />;
      case 'weather': return <WeatherView />;
      case 'calendar': return <CalendarView />;
      case 'browser': return <BrowserView />;
      case 'webhook': return <WebhookView />;
      case 'dreamstream': return <DreamStreamView />;
      // Independent Apps
      case 'cipher': return <CipherView />;
      case 'void': return <VoidView />;
      case 'capsule': return <CapsuleView />;
      case 'biolink': return <BioLinkView />;
      case 'echo': return <EchoView />;
      case 'zenith': return <ZenithView />;
      case 'signal': return <SignalView />;
      case 'style': return <StyleView />;
      case 'loom': return <LoomView />;
      case 'live': return <LiveView onClose={() => setActiveTab('home')} />;
      
      case 'search': return <SearchView onNavigateToScriptorium={() => setActiveTab('scriptorium')} />;
      case 'forge': return <ForgeView initialCode={forgeCode} onClearInjected={() => setForgeCode(null)} />;
      case 'marketplace': return <Marketplace installedIds={preferences.installedModules} onInstall={(id) => setPreferences(p => ({ ...p, installedModules: [...p.installedModules, id] }))} onLaunch={(id) => setActiveTab(id as Tab)} />;
      default:
        return messages.length === 0 ? (
          <StartDashboard onAction={(p, m, t) => { 
            if (t === 'live') {
              setActiveTab('live');
            } else if (t === 'prompts') {
              setIsPromptManagerOpen(true);
            } else {
              if (m) setCurrentModel(m as ModelType); 
              handleSend(p); 
            }
          }} userParams={userProfile} />
        ) : (
          <div className="pb-8">
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} isLast={i === messages.length - 1} onOpenArtifact={(art) => { setActiveArtifact(art); setIsArtifactOpen(true); }} />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        );
    }
  };

  if (showSplash) return <AuraSplash onComplete={() => setShowSplash(false)} />;
  if (isAuthChecking) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <AuthScreen onSuccess={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex flex-col h-[100dvh] bg-black overflow-hidden select-none relative transition-all duration-1000">
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      <div className="absolute inset-0 bg-aurora pointer-events-none" />
      <TopBar 
        currentModel={currentModel} 
        onModelChange={setCurrentModel} 
        onNewChat={() => { setCurrentThreadId('main'); setMessages([]); setActiveTab('home'); }} 
        onOpenProfile={() => setIsProfileOpen(true)} 
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPrompts={() => setIsPromptManagerOpen(true)}
        theme={preferences.theme} 
        userProfile={userProfile} 
      />
      <ChatHistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        currentThreadId={currentThreadId} 
        onSelectThread={(id) => { 
          setCurrentThreadId(id); 
          setActiveTab('home'); 
        }} 
        onNewChat={() => { setCurrentThreadId('main'); setMessages([]); setActiveTab('home'); }} 
      />
      <PromptManager 
        isOpen={isPromptManagerOpen} 
        onClose={() => setIsPromptManagerOpen(false)} 
        onSelectPrompt={(prompt) => {
          setCurrentThreadId('main');
          setMessages([]);
          setActiveTab('home');
          handleSend(prompt);
        }}
      />
      <ArtifactCanvas 
        artifact={activeArtifact} 
        isOpen={isArtifactOpen} 
        onClose={() => setIsArtifactOpen(false)} 
        onOpenInForge={(code) => {
          setForgeCode(code);
          setActiveTab('forge');
          setIsArtifactOpen(false);
        }}
      />
      <GlobalCommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onNavigate={setActiveTab} onExecute={handleSend} />
      <ProfilePanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={userProfile} 
        onUpdateProfile={(updates) => setUserProfile(prev => ({ ...prev, ...updates }))} 
        preferences={preferences} 
        onUpdatePreferences={(updates) => setPreferences(prev => ({ ...prev, ...updates }))} 
        onClearHistory={() => setMessages([])} 
        messages={messages} 
        vaultStatus="uninitialized" 
        onVaultStatusChange={() => {}} 
        hasPlatformKey={true} 
        onSelectKey={() => {}} 
        onLaunchTool={(view) => setActiveTab(view)} 
        onSignOut={() => auth.signOut()}
      />
      <main className={`flex-1 overflow-y-auto pt-16 pb-48 no-scrollbar scroll-smooth relative z-10 ${activeTab === 'home' ? 'bg-black' : 'bg-[#050505]'}`}>
        {renderContent()}
      </main>
      {activeTab === 'home' && (
        <div className="fixed bottom-16 left-0 right-0 z-[70] px-6 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <InputArea onSend={(text, attach) => handleSend(text, attach)} isLoading={isLoading} />
          </div>
        </div>
      )}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <FloatingChat />
    </div>
  );
}
