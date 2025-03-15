
import { useState } from 'react';
import { ChatContainer } from './ChatContainer';
import { ConversationSidebar } from '../ConversationSidebar';
import { PriorityTopicsPanel } from '../PriorityTopicsPanel';
import { WebUIConfig } from '@/types/chat';

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

  return (
    <div className="flex h-screen">
      <ConversationSidebar showTopics={showTopics} setShowTopics={setShowTopics} />
      <div className="flex-1 flex overflow-hidden">
        <ChatContainer config={config} setConfig={setConfig} />
        {showTopics && <PriorityTopicsPanel />}
      </div>
    </div>
  );
};
