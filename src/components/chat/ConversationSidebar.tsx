import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConversationList } from './ConversationList';
import { useConversations } from '@/hooks/useConversations';
import { adaptConversation } from '@/integrations/supabase/adapters';

export const ConversationSidebar = () => {
  const navigate = useNavigate();
  const { conversations, isLoading, error, createConversation, currentConversation } = useConversations();
  
  const handleNewConversation = async () => {
    const conversation = await createConversation();
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
        ) : error ? (
          <div>Erreur: {error.message}</div>
        ) : (
          <ConversationList conversations={conversations} currentConversation={currentConversation} />
        )}
      </CardContent>
    </Card>
  );
};
