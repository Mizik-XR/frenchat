import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatHeader } from './ChatHeader';
import { MessageArea } from './MessageArea';
import { ChatInputContainer } from './ChatInputContainer';
import { useChatLogic } from '@/hooks/useChatLogic';
import { Conversation } from '@/integrations/supabase/adapters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

export const ChatContainer = () => {
  const { conversationId } = useParams();
  const { messages, sendMessage, isLoading, currentConversation, updateConversationTitle, isGenerating } = useChatLogic();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  useEffect(() => {
    if (currentConversation) {
      document.title = `${currentConversation.title} - FileChat`;
    } else {
      document.title = "FileChat - Conversation";
    }
  }, [currentConversation]);
  
  const handleStartEdit = () => {
    if (currentConversation) {
      setEditedTitle(currentConversation.title);
      setIsEditing(true);
    }
  };
  
  const handleSaveTitle = () => {
    if (currentConversation && editedTitle.trim()) {
      updateConversationTitle(currentConversation.id, editedTitle);
      setIsEditing(false);
    }
  };
  
  const formatDate = (conversation: Conversation) => {
    if (!conversation.updatedAt) return '';
    const date = new Date(conversation.updatedAt);
    return `Modifié le ${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
  };
  
  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        conversation={currentConversation}
        isEditing={isEditing}
        editedTitle={editedTitle}
        onStartEdit={handleStartEdit}
        onSaveTitle={handleSaveTitle}
        onTitleChange={(e) => setEditedTitle(e.target.value)}
      />
      <MessageArea messages={messages} isLoading={isLoading} />
      <ChatInputContainer sendMessage={sendMessage} isGenerating={isGenerating} />
    </div>
  );
};
