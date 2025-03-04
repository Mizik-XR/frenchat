
import { ConversationList } from "../ConversationList";
import { ChatContainer } from "./ChatContainer";
import { PriorityTopicsPanel } from "../PriorityTopicsPanel";
import { AIProvider, WebUIConfig, AnalysisMode, Message } from "@/types/chat";
import { Conversation } from "@/hooks/useConversations";

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
  replyToMessage: Message | null;
  onClearReply: () => void;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onUpdateConversation: (id: string, data: Partial<Conversation>) => void;
  onModeChange: (mode: 'auto' | 'manual') => void;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  onReplyToMessage: (message: Message) => void;
  setInput: (input: string) => void;
  setShowSettings: (show: boolean) => void;
  setShowUploader: (show: boolean) => void;
  setShowPriorityTopics: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
  onTopicSelect: (id: string) => void;
  onResetConversation: () => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  modelSource?: 'cloud' | 'local';
  onModelSourceChange?: (source: 'cloud' | 'local') => void;
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
  replyToMessage,
  onClearReply,
  onConversationSelect,
  onNewConversation,
  onUpdateConversation,
  onModeChange,
  onWebUIConfigChange,
  onProviderChange,
  onReplyToMessage,
  setInput,
  setShowSettings,
  setShowUploader,
  setShowPriorityTopics,
  onSubmit,
  onFilesSelected,
  onTopicSelect,
  onResetConversation,
  onAnalysisModeChange,
  modelSource = 'cloud',
  onModelSourceChange = () => {}
}: MainLayoutProps) => {
  return (
    <div className="flex h-full">
      <div className="w-72 border-r bg-gray-50 dark:bg-gray-900">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onConversationSelect={onConversationSelect}
          onNewConversation={onNewConversation}
          onUpdateConversation={onUpdateConversation}
        />
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1 h-full relative max-h-full">
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            llmStatus={llmStatus}
            webUIConfig={webUIConfig}
            input={input}
            selectedDocumentId={selectedDocumentId}
            showSettings={showSettings}
            showUploader={showUploader}
            replyToMessage={replyToMessage}
            onClearReply={onClearReply}
            onModeChange={onModeChange}
            onWebUIConfigChange={onWebUIConfigChange}
            onProviderChange={onProviderChange}
            onReplyToMessage={onReplyToMessage}
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
          <div className="w-72 border-l bg-gray-50 dark:bg-gray-900">
            <PriorityTopicsPanel
              onClose={() => setShowPriorityTopics(false)}
              onTopicSelect={onTopicSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};
