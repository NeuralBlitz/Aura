
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Message, ModelType, Artifact, UserPreferences, UserProfile, 
  Tab, MorphingState, Thread, CustomPrompt 
} from './types';

// Components
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
import AgentView from './components/views/AgentView';
import ChangelogView from './components/views/ChangelogView';
import FocusView from './components/views/FocusView';
import NetworkView from './components/views/NetworkView';
import UtilityView from './components/views/UtilityView';
import TranslateView from './components/views/TranslateView';
import HealthView from './components/views/HealthView';
import MarketView from './components/views/MarketView';
import SonicView from './components/views/SonicView';
import SonicWidget from './components/SonicWidget';
import WeatherView from './components/views/WeatherView';
import CalendarView from './components/views/CalendarView';
import BrowserView from './components/views/BrowserView';
import WebhookView from './components/views/WebhookView';
import DreamStreamView from './components/views/DreamStreamView';
import CipherView from './components/views/CipherView';
import VoidView from './components/views/VoidView';
import CapsuleView from './components/views/CapsuleView';
import BioLinkView from './components/views/BioLinkView';
import EchoView from './components/views/EchoView';
import ZenithView from './components/views/ZenithView';
import SignalView from './components/views/SignalView';
import StyleView from './components/views/StyleView';
import CanvasView from './components/views/CanvasView';
import { controlPlane } from './services/agentRuntime';
import LoomView from './components/views/LoomView';
import FloatingChat from './components/FloatingChat';
import AuraSplash from './components/AuraSplash';
import AuraBackground from './components/AuraBackground';
import OnboardingFlow from './components/OnboardingFlow';
import GlobalCommandPalette from './components/GlobalCommandPalette';
import AuthScreen from './components/AuthScreen';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import PromptManager from './components/PromptManager';

// Hooks & Services
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { telemetryService, TelemetryData } from './services/telemetryService';
import { haptic, HapticPattern } from './services/hapticService';
import { storageService } from './services/storageService';

export default function App() {
  // Auth & Profile
  const { 
    isAuthenticated, isAuthChecking, userProfile, 
    updateProfile, signOut 
  } = useAuth();

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentThreadId, setCurrentThreadId] = useState<string>('main');
  const [currentModel, setCurrentModel] = useState<ModelType>(ModelType.GEMINI_FLASH);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPromptManagerOpen, setIsPromptManagerOpen] = useState(false);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [forgeCode, setForgeCode] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSonicActive, setIsSonicActive] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  
  const mainRef = useRef<HTMLDivElement>(null);

  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultModel: ModelType.GEMINI_FLASH, 
    theme: 'dark', 
    accentColor: 'blue',
    notificationsEnabled: true, 
    autoOpenArtifacts: true, 
    installedModules: [
      'news', 'forums', 'focus', 'network', 'utility', 'translate', 
      'health', 'projects', 'notes', 'market', 'sonic', 'dreamstream', 
      'cipher', 'biolink'
    ], 
    isVaultEnabled: false
  });

  const [hasPlatformKey, setHasPlatformKey] = useState(false);

  // Chat Hook
  const { 
    messages, isLoading, handleSend, clearHistory, bottomRef 
  } = useChat(currentThreadId, setCurrentThreadId, currentModel, setCurrentModel);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasPlatformKey(hasKey);
      } else {
        setHasPlatformKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasPlatformKey(true);
    }
  };

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

  // Sync currentModel with preferences.defaultModel
  useEffect(() => {
    setCurrentModel(preferences.defaultModel);
  }, [preferences.defaultModel]);

  // Improved Scroll Logic
  useEffect(() => {
    if (activeTab === 'home' && messages.length > 0) {
      const main = mainRef.current;
      if (!main) return;

      const isNearBottom = main.scrollHeight - main.scrollTop - main.clientHeight < 250;
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role === 'user' || isNearBottom) {
        bottomRef.current?.scrollIntoView({ 
          behavior: lastMessage.role === 'user' ? 'smooth' : 'auto',
          block: 'end'
        });
      }
    }
  }, [messages, activeTab, bottomRef]);

  const handleRetry = (messageId: string) => {
    const failedMsgIndex = messages.findIndex(m => m.id === messageId);
    if (failedMsgIndex === -1) return;

    const lastUserMsg = [...messages.slice(0, failedMsgIndex)].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    handleSend(lastUserMsg.text, lastUserMsg.imageUrl, preferences.enabledTools);
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
      case 'sonic': return <SonicView isSonicActive={isSonicActive} setIsSonicActive={setIsSonicActive} />;
      case 'weather': return <WeatherView />;
      case 'calendar': return <CalendarView />;
      case 'browser': return <BrowserView />;
      case 'webhook': return <WebhookView />;
      case 'dreamstream': return <DreamStreamView />;
      case 'cipher': return <CipherView />;
      case 'void': return <VoidView />;
      case 'capsule': return <CapsuleView />;
      case 'biolink': return <BioLinkView />;
      case 'echo': return <EchoView />;
      case 'zenith': return <ZenithView />;
      case 'signal': return <SignalView />;
      case 'style': return <StyleView />;
      case 'canvas': return <CanvasView />;
      case 'loom': return <LoomView />;
      case 'live': return <LiveView onClose={() => setActiveTab('home')} hasPlatformKey={hasPlatformKey} onSelectKey={handleSelectKey} />;
      case 'agent': return <AgentView />;
      case 'search': return <SearchView onNavigateToScriptorium={() => setActiveTab('scriptorium')} />;
      case 'forge': return <ForgeView initialCode={forgeCode} onClearInjected={() => setForgeCode(null)} onClose={() => setActiveTab('home')} />;
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
              handleSend(p, undefined, preferences.enabledTools); 
            }
          }} userParams={userProfile} />
        ) : (
          <div className="pb-8">
            {messages.map((msg, i) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isLast={i === messages.length - 1} 
                onRetry={() => handleRetry(msg.id)}
                onOpenArtifact={(art) => { setActiveArtifact(art); setIsArtifactOpen(true); }} 
              />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        );
    }
  };

  if (showSplash) return <AuraSplash onComplete={() => setShowSplash(false)} />;
  if (isAuthChecking) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <AuthScreen onSuccess={() => {}} />;

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative transition-all duration-1000 ${
      preferences.theme === 'light' ? 'theme-light bg-white text-black' : 
      preferences.theme === 'oled' ? 'bg-black text-white' : 
      preferences.theme === 'ghost' ? 'bg-neutral-900/50 text-white/90 backdrop-blur-3xl' :
      preferences.theme === 'zen' ? 'bg-[#fdf6e3] text-[#586e75]' :
      'bg-black text-white'
    } ${
      preferences.fontFamily === 'mono' ? 'font-mono' : 
      preferences.fontFamily === 'serif' ? 'font-serif' : 
      'font-sans'
    } accent-${preferences.accentColor || 'blue'}`}>
      <AuraBackground />
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      <TopBar 
        currentModel={currentModel} 
        onModelChange={setCurrentModel} 
        onNewChat={() => { setCurrentThreadId('main'); clearHistory(); setActiveTab('home'); }} 
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
        onNewChat={() => { setCurrentThreadId('main'); clearHistory(); setActiveTab('home'); }} 
      />
      <PromptManager 
        isOpen={isPromptManagerOpen} 
        onClose={() => setIsPromptManagerOpen(false)} 
        onSelectPrompt={(prompt) => {
          setCurrentThreadId('main');
          clearHistory();
          setActiveTab('home');
          handleSend(prompt, undefined, preferences.enabledTools);
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
      <GlobalCommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onNavigate={setActiveTab} onExecute={(text) => handleSend(text, undefined, preferences.enabledTools)} />
      <ProfilePanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={userProfile} 
        onUpdateProfile={updateProfile} 
        preferences={preferences} 
        onUpdatePreferences={(updates) => setPreferences(prev => ({ ...prev, ...updates }))} 
        onClearHistory={clearHistory} 
        messages={messages} 
        vaultStatus="uninitialized" 
        onVaultStatusChange={() => {}} 
        hasPlatformKey={hasPlatformKey} 
        onSelectKey={handleSelectKey} 
        onLaunchTool={(view) => setActiveTab(view)} 
        onSignOut={signOut}
      />
      <main 
        ref={mainRef}
        className={`flex-1 overflow-y-auto relative z-10 touch-pan-y overscroll-contain transition-all duration-500 ${activeTab === 'home' ? 'pt-16 pb-48' : 'pt-16 pb-0'}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      {activeTab === 'home' && (
        <div className="fixed bottom-32 left-0 right-0 z-[70] px-6 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <InputArea onSend={(text, attach) => handleSend(text, attach, preferences.enabledTools)} isLoading={isLoading} />
          </div>
        </div>
      )}
      {activeTab === 'home' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      <FloatingChat onNavigate={setActiveTab} currentTab={activeTab} />
      <SonicWidget isActive={isSonicActive} onClose={() => setIsSonicActive(false)} />
    </div>
  );
}
