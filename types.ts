
import { FunctionDeclaration } from '@google/genai';

export enum ModelType {
  GEMINI_FLASH = 'gemini-3-flash-preview',
  GEMINI_PRO = 'gemini-3-pro-preview',
  GEMINI_IMAGE = 'gemini-2.5-flash-image',
  GEMINI_INTELLIGENCE = 'gemini-2.5-flash-native-audio-preview-12-2025',
  CREATIVE_WRITING = 'creative-writing',
  CODING_ASSISTANT = 'coding-assistant',
  GENERAL_KNOWLEDGE = 'general-knowledge'
}

export interface GroundingSource {
  title: string;
  uri: string;
  type: 'web' | 'maps';
}

export interface Thread {
  id: string;
  title: string;
  updatedAt: number;
}

export type VaultStatus = 'uninitialized' | 'locked' | 'unlocked';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  imageUrl?: string; 
  isError?: boolean;
  isStreaming?: boolean;
  artifacts?: Artifact[];
  widgets?: Widget[];
  groundingMetadata?: GroundingSource[];
  memories?: MemoryRetrieval[];
  thinkingSteps?: ReasoningStep[];
  threadId?: string;
  moduleId?: string;
}

export interface ReasoningStep {
  id: string;
  title: string;
  content: string;
  status: 'complete' | 'active' | 'pending';
}

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'markdown' | 'html' | 'spatial' | 'presentation' | 'project' | 'note';
  content: string;
  language?: string;
  metadata?: any;
}

export interface Widget {
  id: string;
  type: 'checklist' | 'dashboard' | 'projection' | 'quiz' | 'flashcard' | 'slide' | 'kanban' | 'market' | 'weather' | 'focus';
  data: any;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'viewer';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: number;
  assignees?: string[]; // IDs of ProjectMember
  subtasks?: Subtask[];
  comments?: TaskComment[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  members: ProjectMember[];
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  updatedAt: number;
}

export interface MemoryRetrieval {
  id: number;
  text: string;
  similarity: number;
  timestamp: Date;
  role: 'user' | 'model';
}

export type Theme = 'light' | 'dark' | 'ghost' | 'zen' | 'oled';
export type MorphingState = 'standby' | 'reasoning' | 'fabrication' | 'critical' | 'creative' | 'ghost';

export type Tab = 'home' | 'nexus' | 'marketplace' | 'projects' | 'notes' | 'forge' | 'search' | 'news' | 'forums' | 'scriptorium' | 'changelog' | 'focus' | 'vault' | 'network' | 'utility' | 'translate' | 'health' | 'library' | 'market' | 'sonic' | 'weather' | 'calendar' | 'browser' | 'webhook' | 'dreamstream' | 'cipher' | 'biolink' | 'echo' | 'signal' | 'void' | 'style' | 'loom' | 'capsule' | 'zenith' | 'live' | 'agent';

export type QuickActionType = 'aura-live' | 'nearby-search' | 'create-image' | 'analyze-data' | 'settings';

export interface UserProfile {
  username: string;
  avatarUrl: string;
  bio?: string;
  level: number;
  exp: number;
}

export interface UserPreferences {
  defaultModel: ModelType;
  theme: Theme;
  accentColor: string;
  installedModules: string[];
  isVaultEnabled: boolean;
  autoOpenArtifacts: boolean;
  notificationsEnabled: boolean;
  enabledTools?: string[];
  connectedIntegrations?: string[];
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: 'productivity' | 'creative' | 'technical' | 'personal' | 'community' | 'system' | 'utility' | 'health';
  isBeta?: boolean;
}

export interface SovereignTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  declaration: FunctionDeclaration;
  mappedView?: Tab; // New property to map tools to views
}

export interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info' | 'result';
  content: string[];
  timestamp: number;
}

export interface ForgeParam {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  line: number;
}
