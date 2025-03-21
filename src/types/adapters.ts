
// Update the file to make types compatible
import { Json } from './database';

// Type pour assurer la compatibilité entre les différentes sources de données
export interface Conversation {
  id: string;
  title: string;
  userId: string;
  folderId: string | null;
  createdAt: number; // Format timestamp unifié
  updatedAt: number; // Format timestamp unifié
  isArchived: boolean;
  isPinned: boolean;
  archiveDate: number | null; // Format timestamp unifié
  settings: any;
}

// Interface pour configurer l'UI de l'application
export interface WebUIConfig {
  provider: string;
  theme: string;
  layout: string;
  sidebarCollapsed: boolean;
  fontSize: string;
  showTimestamp: boolean;
  autoGenerateTitle: boolean;
  messageStyle: string;
  model?: string;
}

// Type pour l'état global de l'application
export type AppStateConfig = {
  isOfflineMode: boolean;
  isCloudMode: boolean;
  isDevMode: boolean;
  isLocalAIAvailable: boolean;
  isSupabaseAvailable: boolean;
  userAgent: string;
  platformInfo: {
    os: string;
    browser: string;
    version: string;
  };
  config: {
    allowAnonymousUsers: boolean;
    requireLogin: boolean;
    disableLocalStorage: boolean;
    enforceStrictMode: boolean;
  };
  setOfflineMode: (mode: boolean) => void;
};

// Interface pour les composants de mise en page du chat
export interface ChatHeaderProps {
  conversation?: any;
  isEditing?: boolean;
  editedTitle?: string;
  onStartEdit?: () => void;
  onSaveTitle?: () => void;
  onTitleChange?: (e: any) => void;
  iaMode?: "cloud" | "auto" | "local";
  onIAModeChange?: (mode: "cloud" | "auto" | "local") => void;
  onResetConversation?: () => void;
}

export interface MessageAreaProps {
  messages: any[];
  isLoading?: boolean;
}

export interface ChatInputContainerProps {
  sendMessage?: (content: string, convoId: string, replyToId?: string) => Promise<void>;
  isGenerating?: boolean;
}

// Interface pour la réponse de l'Edge Function
export interface EdgeFunctionResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

// Interface pour StatusIndicator
export interface StatusIndicatorProps {
  isOnline?: boolean;
  isLoading?: boolean;
  serviceType?: string;
  mode?: "auto" | "manual";
  model?: string;
  modelSource?: "local" | "cloud";
}

// Interface pour le composant ConversationSidebar
export interface PriorityTopicsPanelProps {
  showTopics: boolean;
  setShowTopics: React.Dispatch<React.SetStateAction<boolean>>;
  messages?: any[];
  onTopicSelect?: (messageId: string) => void;
  onClose?: () => void;
}

export interface SettingsPanelProps {
  config: WebUIConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebUIConfig>>;
}

// Interface pour les métadonnées des messages
export interface MessageMetadata {
  [key: string]: Json;
}

// Ajout des interfaces pour les types de conversation dans /types/chat
export interface ConversationSidebarProps {
  showTopics: boolean;
  setShowTopics: React.Dispatch<React.SetStateAction<boolean>>;
}

