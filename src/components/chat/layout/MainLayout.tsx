
import { useState  } from '@/core/reactInstance';
import { ChatContainer } from './ChatContainer';
import { ConversationSidebar } from '../ConversationSidebar';
import { PriorityTopicsPanel } from '../PriorityTopicsPanel';
import { WebUIConfig } from '@/types/chat';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversations } from '@/hooks/useConversations';

export const MainLayout = () => {
  const [config, setConfig] = useState<WebUIConfig>({
    model: 'huggingface',
    provider: 'huggingface',
    temperature: 0.7,
    maxTokens: 500,
    analysisMode: 'default',
    useMemory: false
  });

  const [showTopics, setShowTopics] = useState(false);
  const { activeConversation } = useConversations();
  const { messages } = useChatMessages(activeConversation?.id || null);

  const handleTopicSelect = (messageId: string) => {
    console.log('Selected topic message:', messageId);
    // Implement message selection logic
  };

  const handleTopicsClose = () => {
    setShowTopics(false);
  };

  return (
    <div className="flex h-screen">
      <ConversationSidebar showTopics={showTopics} setShowTopics={setShowTopics} />
      <div className="flex-1 flex overflow-hidden">
        <ChatContainer config={config} setConfig={setConfig} />
        {showTopics && (
          <PriorityTopicsPanel 
            messages={messages || []}
            onTopicSelect={handleTopicSelect}
            onClose={handleTopicsClose}
          />
        )}
      </div>
    </div>
  );
};
