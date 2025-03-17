import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui';
import { AICacheService } from '@/services/cacheService';
import { buildRAGPrompt } from './promptBuilder';
import { getRagContext, insertChatMessage } from '@/integrations/supabase/rpcFunctions';

/**
 * Gère la réponse de l'IA, met à jour l'état du chat et insère le message dans la base de données.
 * @param {string} response - La réponse de l'IA.
 * @param {string} conversationId - L'ID de la conversation.
 * @param {string} prompt - Le prompt de l'utilisateur.
 * @param {string} provider - Le fournisseur d'IA utilisé.
 * @param {number} tokensUsed - Le nombre de tokens utilisés.
 * @param {number} estimatedCost - Le coût estimé de la requête.
 * @param {any} metadata - Les métadonnées de la réponse.
 * @param {Function} setChatMessages - La fonction pour mettre à jour les messages du chat.
 * @param {Function} setIsLoading - La fonction pour gérer l'état de chargement.
 */
export const handleAIResponse = async (
  response: any,
  conversationId: string,
  prompt: string,
  provider: string,
  tokensUsed: number,
  estimatedCost: number,
  metadata: any,
  setChatMessages: Function,
  setIsLoading: Function
) => {
  try {
    const messageId = uuidv4();
    const cacheService = new AICacheService();
    
    // Récupérer le contexte RAG pour la conversation
    const ragContext = await getRagContext(conversationId);
    const error = !ragContext;
    
    if (error) {
      console.error('Erreur lors de la récupération du contexte RAG:', error);
      toast({
        title: "Erreur de contexte",
        description: "Impossible de récupérer le contexte RAG pour cette conversation.",
        variant: "destructive"
      });
    }
    
    // Construire le prompt RAG
    const ragPrompt = buildRAGPrompt(ragContext.context);
    
    // Mettre à jour les messages du chat avec la réponse de l'IA
    setChatMessages((prevChatMessages: any) => [
      ...prevChatMessages,
      {
        id: messageId,
        conversation_id: conversationId,
        content: response.content,
        role: 'assistant',
        createdAt: new Date(),
        metadata: response.metadata || {}
      }
    ]);
    
    // Insérer le message de l'assistant dans la base de données
    await insertChatMessage({
      id: messageId,
      role: 'assistant',
      content: response.content,
      conversationId: conversationId,
      metadata: response.metadata || {},
      timestamp: new Date()
    });
    
    // Mettre à jour le cache avec la réponse de l'IA
    await cacheService.upsertCache({
      hash: conversationId,
      prompt: ragPrompt,
      response: response.content,
      provider: provider,
      tokensUsed: tokensUsed,
      estimatedCost: estimatedCost,
      metadata: metadata,
      userId: 'user_id' // TODO: Récupérer l'ID de l'utilisateur
    });
  } catch (dbError: any) {
    console.error("Erreur lors de l'insertion du message dans la base de données:", dbError);
    toast({
      title: "Erreur de base de données",
      description: "Impossible de sauvegarder le message dans la base de données.",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};
