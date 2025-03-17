
import { useState, useEffect } from 'react';
import { MainChatContainer } from './MainChatContainer';
import { ChatInputContainer } from './ChatInputContainer';
import { useConversations } from '@/hooks/useConversations';
import { ChatHeader } from '../ChatHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { WebUIConfig, AnalysisMode, AIProvider } from '@/types/chat';
import { useChatState } from '@/hooks/useChatState';
import { useAIMode, AIMode } from '@/hooks/useAIMode';
import { Conversation } from '@/integrations/supabase/sharedTypes';

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
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [modelSource, setModelSource] = useState<'cloud' | 'local'>('cloud');
  
  // Utiliser le hook useAIMode pour accéder aux fonctionnalités de mode IA
  const { currentMode, isLocalAvailable, changeMode } = useAIMode();

  useEffect(() => {
    // Si un ID est fourni dans l'URL mais qu'il n'y a pas de conversation active
    if (id && !activeConversation) {
      const conversation = conversations?.find((conv) => conv.id === id);
      if (conversation) {
        setActiveConversation(conversation);
      } else {
        // Si l'ID n'existe pas, rediriger vers la page de chat principale
        navigate('/chat');
      }
    }
    
    // Si aucun ID n'est fourni et qu'il y a des conversations
    if (!id && conversations?.length > 0 && !activeConversation) {
      const mostRecentConversation = [...(conversations || [])].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      if (mostRecentConversation) {
        navigate(`/chat/${mostRecentConversation.id}`);
      }
    }
    
    // Si aucun ID n'est fourni et qu'il n'y a pas de conversations, créer une nouvelle conversation
    if (!id && (!conversations || conversations.length === 0) && !activeConversation) {
      handleNewChat();
    }
  }, [id, conversations, activeConversation, navigate]);

  const handleNewChat = async () => {
    const newConversation = await createNewConversation(config);
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
  
  const handleModeChange = (newMode: 'auto' | 'manual') => {
    setMode(newMode);
  };

  const handleModelSourceChange = (source: 'cloud' | 'local') => {
    setModelSource(source);
  };
  
  // Gérer le changement de mode AI via le hook useAIMode
  const handleAIModeChange = (mode: AIMode) => {
    changeMode(mode);
  };

  const handleResetConversation = () => {
    // Reset conversation logic here
    console.log("Resetting conversation");
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-background overflow-hidden">
      {activeConversation ? (
        <>
          <ChatHeader 
            mode={mode}
            onModeChange={handleModeChange}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onResetConversation={handleResetConversation}
            setShowUploader={setShowUploader}
            modelSource={modelSource}
            onModelSourceChange={handleModelSourceChange}
            currentAIMode={currentMode}
            isLocalAvailable={isLocalAvailable}
            onAIModeChange={handleAIModeChange}
          />
          <MainChatContainer 
            conversation={activeConversation}
            messages={[]} 
            isLoading={false}
            iaMode={modelSource === 'local' ? 'local' : 'cloud'}
            selectedModel={config.provider}
            onIAModeChange={(mode) => setModelSource(mode === 'local' ? 'local' : 'cloud')}
            onModelChange={handleModelChange}
            onSendMessage={() => {}}
            onFileUpload={async () => {}}
            onCreateNewConversation={handleNewChat}
          />
          <ChatInputContainer 
            input={inputValue}
            setInput={setInputValue}
            isLoading={false}
            selectedDocumentId={null}
            onSubmit={(e) => e.preventDefault()}
            mode={mode}
            model={config.provider}
            showUploader={showUploader}
            setShowUploader={setShowUploader}
            onFilesSelected={async () => {}}
            modelSource={modelSource}
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
