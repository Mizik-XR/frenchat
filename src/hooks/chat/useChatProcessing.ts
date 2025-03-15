
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIProvider, AnalysisMode, Message, MessageMetadata, WebUIConfig } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { useSecureApiProxy } from '@/hooks/useSecureApiProxy';
import { useAuth } from '@/components/AuthProvider';
import { v4 as uuidv4 } from 'uuid';

interface SendMessageOptions {
  content: string;
  conversationId: string;
  files?: File[];
  fileUrls?: string[];
  replyTo?: { id: string; content: string; role: 'user' | 'assistant' };
  config: WebUIConfig;
}

export const useChatProcessing = () => {
  const { user } = useAuth();
  const secureApiProxy = useSecureApiProxy();
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, conversationId, files = [], fileUrls = [], replyTo, config }: SendMessageOptions) => {
      if (!user) throw new Error('User not authenticated');
      
      setIsProcessing(true);
      
      try {
        // Créer le message utilisateur
        const userMessageId = uuidv4();
        const timestamp = new Date();
        
        const userMessageMetadata: MessageMetadata = {};
        
        if (replyTo) {
          userMessageMetadata.replyTo = replyTo;
        }
        
        // Upload des fichiers si nécessaire
        const processedFileUrls = [...fileUrls];
        
        if (files.length > 0) {
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            
            const { data, error } = await supabase.functions.invoke('process-upload', {
              body: formData,
              headers: {
                Accept: 'multipart/form-data',
              },
            });
            
            if (error) throw error;
            if (data?.url) {
              processedFileUrls.push(data.url);
            }
          }
        }
        
        // Si des fichiers sont attachés, ajoutez-les aux métadonnées
        if (processedFileUrls.length > 0) {
          userMessageMetadata.documentId = processedFileUrls.join(',');
        }
        
        // Enregistrer le message utilisateur
        const { error: insertError } = await supabase
          .from('chat_messages')
          .insert({
            id: userMessageId,
            role: 'user',
            content,
            conversation_id: conversationId,
            user_id: user.id,
            metadata: userMessageMetadata,
          });
        
        if (insertError) throw insertError;
        
        // Construire le message IA
        const aiMessageId = uuidv4();
        const aiMessageMetadata: MessageMetadata = {
          provider: config.provider,
          analysisMode: config.analysisMode,
          aiService: {
            type: 'hybrid',
            endpoint: 'auto',
            actualServiceUsed: 'cloud'
          }
        };
        
        // Préparer la requête pour l'API
        let response;
        const provider = config.provider as string;
        
        switch (provider) {
          case 'openai':
          case 'mistral':
          case 'anthropic':
          case 'google':
          case 'deepseek':
          case 'deepseek-v2':
          case 'gemma-3':
          case 'huggingface':
            // Use secureApiProxy for text generation
            response = await secureApiProxy.callApi(
              'ai', 
              'generate-text', 
              {
                provider: config.provider,
                prompt: content,
                conversationId,
                messageId: aiMessageId,
                options: {
                  temperature: config.temperature,
                  max_tokens: config.maxTokens,
                  useMemory: config.useMemory || false,
                  analysisMode: config.analysisMode
                }
              }
            );
            break;
          default:
            // Fallback to local service
            const { data } = await supabase.functions.invoke('text-generation', {
              body: {
                prompt: content,
                model: config.model,
                temperature: config.temperature,
                max_tokens: config.maxTokens
              }
            });
            response = data?.generated_text || "Je n'ai pas pu générer de réponse.";
        }
        
        // Enregistrer la réponse de l'IA
        const { error: aiInsertError } = await supabase
          .from('chat_messages')
          .insert({
            id: aiMessageId,
            role: 'assistant',
            content: response,
            conversation_id: conversationId,
            user_id: user.id,
            metadata: aiMessageMetadata,
          });
        
        if (aiInsertError) throw aiInsertError;
        
        return {
          userMessage: {
            id: userMessageId,
            role: 'user',
            content,
            conversationId,
            metadata: userMessageMetadata,
            timestamp
          },
          assistantMessage: {
            id: aiMessageId,
            role: 'assistant',
            content: response,
            conversationId,
            metadata: aiMessageMetadata,
            timestamp: new Date()
          }
        };
      } catch (error) {
        console.error('Error processing chat:', error);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors du traitement du message.',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    isProcessing,
    isSuccess: sendMessageMutation.isSuccess,
    isError: sendMessageMutation.isError,
    error: sendMessageMutation.error,
    reset: sendMessageMutation.reset,
  };
};
