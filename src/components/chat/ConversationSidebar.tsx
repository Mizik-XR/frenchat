
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConversationList } from './ConversationList';
import { useConversations } from '@/hooks/useConversations';
import { adaptConversation } from '@/integrations/supabase/adapters';
import { Conversation } from '@/types/chat';  // Importation depuis types/chat pour assurer la compatibilité des types

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
      
      // Convertir à la structure de Conversation dans types/chat 
      // (notamment convertir les timestamps string en number)
      const typedConversation: Conversation = {
        ...adaptedConversation,
        createdAt: new Date(adaptedConversation.createdAt).getTime(),
        updatedAt: new Date(adaptedConversation.updatedAt).getTime(),
        archiveDate: adaptedConversation.archiveDate ? new Date(adaptedConversation.archiveDate).getTime() : undefined
      } as Conversation;
      
      navigate(`/chat/${typedConversation.id}`);
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
            conversations={conversations?.map(conv => ({
              ...conv,
              createdAt: new Date(conv.createdAt).getTime(),
              updatedAt: new Date(conv.updatedAt).getTime(),
              archiveDate: conv.archiveDate ? new Date(conv.archiveDate).getTime() : undefined
            }))} 
            currentConversation={activeConversation ? {
              ...activeConversation,
              createdAt: new Date(activeConversation.createdAt).getTime(), 
              updatedAt: new Date(activeConversation.updatedAt).getTime(),
              archiveDate: activeConversation.archiveDate ? new Date(activeConversation.archiveDate).getTime() : undefined
            } as Conversation : null} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationSidebar;
