
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AIProvider, WebUIConfig } from "@/types/chat";
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversations } from '@/hooks/useConversations';
import { useChatLogic } from '@/hooks/useChatLogic';
import { ChatHeader } from "./chat/ChatHeader";
import { ChatInput } from "./chat/ChatInput";
import { SettingsPanel } from "./chat/SettingsPanel";
import { MessageList } from "./chat/MessageList";
import { ConversationList } from "./chat/ConversationList";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";

export const Chat = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [input, setInput] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const [webUIConfig, setWebUIConfig] = useState<WebUIConfig>({
    mode: 'auto',
    model: 'huggingface',
    maxTokens: 2000,
    temperature: 0.7,
    streamResponse: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { messages } = useChatMessages(selectedConversationId);
  const { conversations, createNewConversation, updateConversation } = useConversations();
  const { isLoading, processMessage } = useChatLogic(selectedConversationId);

  const handleProviderChange = (provider: AIProvider) => {
    setWebUIConfig(prev => ({ ...prev, model: provider }));
  };

  const handleWebUIConfigChange = (config: Partial<WebUIConfig>) => {
    setWebUIConfig(prev => ({ ...prev, ...config }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      if (!selectedConversationId) {
        const newConv = await createNewConversation(webUIConfig);
        setSelectedConversationId(newConv.id);
      }

      const message = input;
      setInput('');
      await processMessage(message, webUIConfig, selectedDocumentId);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  useEffect(() => {
    if (conversations?.length) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="animate-pulse">
            Chargement...
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Connexion requise</h2>
          <p className="text-gray-600">Veuillez vous connecter pour accéder au chat</p>
          <Button onClick={() => navigate('/auth')} className="gap-2">
            <LogIn className="w-4 h-4" />
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          onNew={() => createNewConversation(webUIConfig)}
          onUpdateConversation={updateConversation}
        />
        
        <div className="flex-1 p-4">
          <Card className="flex flex-col h-full p-4 relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg">
            <ChatHeader 
              mode={webUIConfig.mode}
              onModeChange={(mode) => handleWebUIConfigChange({ mode })}
              onToggleSettings={() => setShowSettings(!showSettings)} 
            />

            {showSettings && (
              <SettingsPanel
                webUIConfig={webUIConfig}
                onWebUIConfigChange={handleWebUIConfigChange}
                onProviderChange={handleProviderChange}
              />
            )}

            <div className="flex-1 overflow-y-auto mb-4 bg-white/60 rounded-lg p-4">
              <MessageList 
                messages={messages} 
                isLoading={isLoading}
              />
            </div>

            <ChatInput
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              selectedDocumentId={selectedDocumentId}
              onSubmit={handleSubmit}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
