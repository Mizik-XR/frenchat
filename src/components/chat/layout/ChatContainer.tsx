
import { useState, useEffect } from 'react';
import { MainChatContainer } from './MainChatContainer';
import { ChatInputContainer } from './ChatInputContainer';
import { useConversations } from '@/hooks/useConversations';
import { ChatHeader } from '../ChatHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { WebUIConfig, AnalysisMode, AIProvider } from '@/types/chat';

interface ChatContainerProps {
  config: WebUIConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebUIConfig>>;
}

export const ChatContainer = ({ config, setConfig }: ChatContainerProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversations, activeConversation, setActiveConversation, createNewConversation } = useConversations();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Si un ID est fourni dans l'URL mais qu'il n'y a pas de conversation active
    if (id && !activeConversation) {
      const conversation = conversations.find((conv) => conv.id === id);
      if (conversation) {
        setActiveConversation(conversation);
      } else {
        // Si l'ID n'existe pas, rediriger vers la page de chat principale
        navigate('/chat');
      }
    }
    
    // Si aucun ID n'est fourni et qu'il y a des conversations
    if (!id && conversations.length > 0 && !activeConversation) {
      const mostRecentConversation = [...conversations].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0];
      
      if (mostRecentConversation) {
        navigate(`/chat/${mostRecentConversation.id}`);
      }
    }
    
    // Si aucun ID n'est fourni et qu'il n'y a pas de conversations, créer une nouvelle conversation
    if (!id && conversations.length === 0 && !activeConversation) {
      handleNewChat();
    }
  }, [id, conversations, activeConversation, navigate]);

  const handleNewChat = async () => {
    const newConversation = await createNewConversation();
    if (newConversation) {
      navigate(`/chat/${newConversation.id}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleModelChange = (model: AIProvider) => {
    setConfig((prev) => ({ ...prev, provider: model, model: model }));
  };

  const handleAnalysisModeChange = (mode: AnalysisMode) => {
    setConfig((prev) => ({ ...prev, analysisMode: mode }));
  };

  const handleTemperatureChange = (temp: number) => {
    setConfig((prev) => ({ ...prev, temperature: temp }));
  };

  const handleMaxTokensChange = (tokens: number) => {
    setConfig((prev) => ({ ...prev, maxTokens: tokens }));
  };

  const handleUseMemoryChange = (useMemory: boolean) => {
    setConfig((prev) => ({ ...prev, useMemory }));
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-background overflow-hidden">
      {activeConversation ? (
        <>
          <ChatHeader 
            conversation={activeConversation} 
            onNewChat={handleNewChat} 
            selectedProvider={config.provider}
            onProviderChange={handleModelChange}
            selectedAnalysisMode={config.analysisMode}
            onAnalysisModeChange={handleAnalysisModeChange}
          />
          <MainChatContainer conversationId={activeConversation.id} isTyping={isTyping} />
          <ChatInputContainer 
            conversationId={activeConversation.id}
            value={inputValue}
            onChange={handleInputChange}
            setInputValue={setInputValue}
            setIsTyping={setIsTyping}
            selectedModel={config.provider}
            onModelChange={handleModelChange}
            temperature={config.temperature}
            onTemperatureChange={handleTemperatureChange}
            maxTokens={config.maxTokens}
            onMaxTokensChange={handleMaxTokensChange}
            selectedAnalysisMode={config.analysisMode}
            onAnalysisModeChange={handleAnalysisModeChange}
            useMemory={config.useMemory || false}
            onUseMemoryChange={handleUseMemoryChange}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground">Chargement de la conversation...</p>
        </div>
      )}
    </div>
  );
};
