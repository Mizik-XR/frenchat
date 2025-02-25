
import { ConversationList } from "../ConversationList";
import { ChatContainer } from "./ChatContainer";
import { PriorityTopicsPanel } from "../PriorityTopicsPanel";
import { Conversation, Message, WebUIConfig, AIProvider, AnalysisMode } from "@/types/chat";

interface MainLayoutProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  llmStatus: string;
  webUIConfig: WebUIConfig;
  input: string;
  selectedDocumentId: string | null;
  showSettings: boolean;
  showUploader: boolean;
  showPriorityTopics: boolean;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => Promise<void>;
  onUpdateConversation: (params: { id: string; title?: string; isPinned?: boolean; isArchived?: boolean }) => void;
  onModeChange: (mode: 'auto' | 'manual') => void;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  setInput: (input: string) => void;
  setShowSettings: (show: boolean) => void;
  setShowUploader: (show: boolean) => void;
  setShowPriorityTopics: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
  onTopicSelect: (messageId: string) => void;
  onResetConversation: () => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
}

export const MainLayout = ({
  conversations,
  selectedConversationId,
  messages,
  isLoading,
  llmStatus,
  webUIConfig,
  input,
  selectedDocumentId,
  showSettings,
  showUploader,
  showPriorityTopics,
  onConversationSelect,
  onNewConversation,
  onUpdateConversation,
  onModeChange,
  onWebUIConfigChange,
  onProviderChange,
  setInput,
  setShowSettings,
  setShowUploader,
  setShowPriorityTopics,
  onSubmit,
  onFilesSelected,
  onTopicSelect,
  onResetConversation,
  onAnalysisModeChange
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen overflow-hidden">
        <div className="hidden sm:block">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={onConversationSelect}
            onNew={onNewConversation}
            onUpdateConversation={onUpdateConversation}
          />
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              llmStatus={llmStatus}
              webUIConfig={webUIConfig}
              input={input}
              selectedDocumentId={selectedDocumentId}
              showSettings={showSettings}
              showUploader={showUploader}
              onModeChange={onModeChange}
              onWebUIConfigChange={onWebUIConfigChange}
              onProviderChange={onProviderChange}
              setInput={setInput}
              setShowSettings={setShowSettings}
              setShowUploader={setShowUploader}
              onSubmit={onSubmit}
              onFilesSelected={onFilesSelected}
              onResetConversation={onResetConversation}
              onAnalysisModeChange={onAnalysisModeChange}
            />
          </div>

          {showPriorityTopics && (
            <div className="w-80 border-l border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg animate-slide-in-right">
              <PriorityTopicsPanel
                messages={messages}
                onClose={() => setShowPriorityTopics(false)}
                onQuote={setInput}
                onTopicSelect={onTopicSelect}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
