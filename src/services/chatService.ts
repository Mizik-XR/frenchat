
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { MessageType, MessageMetadata } from '@/integrations/supabase/sharedTypes';
import { APP_STATE } from '@/compatibility/supabaseCompat';
import { AICacheService } from './cacheService';
import { messageMetadataToJson } from '@/integrations/supabase/typesCompatibility';

// Interface pour les messages de chat
interface ChatMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: MessageType;
  message_type: string;
  metadata?: any;
  user_id?: string;
}

// Service de gestion des conversations et des messages
export class ChatService {
  private cacheService: AICacheService;
  
  constructor() {
    this.cacheService = new AICacheService();
  }
  
  // Récupérer les messages d'une conversation
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      console.error(error);
      return [];
    }
  }
  
  // Ajouter un message à une conversation
  async addMessage(conversationId: string, content: string, role: MessageType, metadata?: any): Promise<ChatMessage | null> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const newMessage: ChatMessage = {
        id: uuidv4(),
        conversation_id: conversationId,
        content: content,
        role: role,
        message_type: 'text',
        metadata: metadata,
        user_id: currentUser.id
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMessage])
        .select();
      
      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
      
      return data ? data[0] : null;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      console.error(error);
      return null;
    }
  }
  
  // Générer une réponse de l'IA (avec cache)
  async generateAIResponse(prompt: string, provider: string, conversationId: string, userId: string, metadata?: any): Promise<string | null> {
    try {
      // Vérifier si la réponse est en cache
      const cachedResponse = await this.cacheService.getCachedResponse(prompt, provider, userId);
      if (cachedResponse) {
        console.log('Réponse trouvée dans le cache:', cachedResponse);
        return cachedResponse.response;
      }
      
      // Simuler un appel à l'API de l'IA
      const aiResponse = await this.simulateAIResponse(prompt);
      
      if (!aiResponse) {
        throw new Error('Impossible de générer une réponse de l\'IA');
      }
      
      // Mettre en cache la réponse
      await this.cacheService.cacheResponse(prompt, aiResponse, provider, userId, metadata);
      
      return aiResponse;
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse de l\'IA:', error);
      console.error(error);
      return null;
    }
  }
  
  // Simuler une réponse de l'IA
  private async simulateAIResponse(prompt: string): Promise<string> {
    // Simuler un délai de réponse
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retourner une réponse simulée
    return `Réponse simulée de l'IA pour la question: ${prompt}`;
  }
  
  // Insérer plusieurs messages dans une conversation
  async insertMessages(
    messages: { 
      content: string; 
      role: MessageType; 
      conversation_id: string; 
      message_type: string; 
      metadata?: any 
    }[], 
    conversationId: string
  ): Promise<void> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      for (const message of messages) {
        // Convertir chaque message individuellement
        await supabase
          .from('chat_messages')
          .insert({
            content: message.content,
            role: message.role,
            conversation_id: message.conversation_id,
            message_type: message.message_type,
            metadata: messageMetadataToJson(message.metadata),
            user_id: currentUser.id
          });
      }
    } catch (error) {
      console.error('Erreur lors de l\'insertion des messages:', error);
      console.error(error);
      throw error;
    }
  }

  async insertChatMessages(
    messages: { 
      content: string; 
      role: MessageType; 
      conversation_id: string; 
      message_type: string; 
      metadata?: any 
    }[], 
    conversationId: string
  ): Promise<void> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      for (const message of messages) {
        // Convertir chaque message individuellement
        await supabase
          .from('chat_messages')
          .insert({
            content: message.content,
            role: message.role,
            conversation_id: message.conversation_id,
            message_type: message.message_type,
            metadata: messageMetadataToJson(message.metadata),
            user_id: currentUser.id
          });
      }
    } catch (error) {
      console.error('Erreur lors de l\'insertion des messages:', error);
      console.error(error);
      throw error;
    }
  }
}
