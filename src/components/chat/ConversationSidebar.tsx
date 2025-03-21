
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConversationList } from './ConversationList';
import { useConversations } from '@/hooks/useConversations';
import { adaptConversation } from '@/integrations/supabase/adapters';
import { Conversation } from '@/integrations/supabase/adapters';

export const ConversationSidebar = () => {
  const navigate = useNavigate();
  const { 
    conversations, 
    isLoading, 
    createNewConversation, 
    activeConversation, 
    setActiveConversation 
  } = useConversations();
  
  const handleNewConversation = async () => {
    const conversation = await createNewConversation();
    if (conversation) {
      // Utiliser l'adaptateur pour convertir en type Conversation
      const adaptedConversation = adaptConversation(conversation);
      navigate(`/chat/${adaptedConversation.id}`);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <Button onClick={handleNewConversation} className="mb-4 w-full">
          Nouvelle Conversation
        </Button>
        {isLoading ? (
          <div>Chargement des conversations...</div>
        ) : (
          <ConversationList 
            conversations={conversations || []} 
            currentConversation={activeConversation} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationSidebar;
