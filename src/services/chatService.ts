
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageType, MessageMetadata } from "@/types/chat";
import { apiConfig } from "./apiConfig";
import { toast } from "@/hooks/use-toast";

export const chatService = {
  async sendUserMessage(
    content: string, 
    conversationId: string,
    type: MessageType = 'text',
    documentId?: string | null,
    metadata?: MessageMetadata
  ): Promise<Message> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        role: 'user',
        content,
        message_type: type,
        conversation_id: conversationId,
        context: documentId || null,
        metadata,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      role: data.role === 'user' ? 'user' : 'assistant',
      content: data.content,
      type: data.message_type as MessageType,
      context: data.context,
      metadata: data.metadata as MessageMetadata,
      conversationId: data.conversation_id,
      timestamp: new Date(data.created_at)
    };
  },

  async sendAssistantMessage(
    content: string, 
    conversationId: string,
    type: MessageType = 'text',
    documentId?: string | null,
    metadata?: MessageMetadata
  ): Promise<Message> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        role: 'assistant',
        content,
        message_type: type,
        conversation_id: conversationId,
        context: documentId || null,
        metadata,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      role: data.role === 'user' ? 'user' : 'assistant',
      content: data.content,
      type: data.message_type as MessageType,
      context: data.context,
      metadata: data.metadata as MessageMetadata,
      conversationId: data.conversation_id,
      timestamp: new Date(data.created_at)
    };
  },

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      // Récupération de la config API
      const headers = await apiConfig.getHeaders();
      const baseURL = apiConfig.baseURL || 'http://localhost:8000';
      
      // Préparation des données avec support du prompt système
      const requestData = {
        prompt,
        system_prompt: systemPrompt || "Tu es un assistant IA qui aide l'utilisateur de manière précise et bienveillante."
      };
      
      // Envoi de la requête avec gestion des erreurs améliorée
      console.log(`Envoi de la requête à ${baseURL}${apiConfig.endpoints.textGeneration}`);
      
      const response = await fetch(`${baseURL}${apiConfig.endpoints.textGeneration}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(30000) // 30 secondes de timeout
      });

      if (!response.ok) {
        // Tentative de récupération du message d'erreur
        try {
          const errorData = await response.json();
          throw new Error(`Erreur du serveur: ${errorData.detail || response.statusText}`);
        } catch (parseError) {
          throw new Error(`Erreur de connexion au serveur (${response.status})`);
        }
      }

      const data = await response.json();
      
      // Vérification de la présence du texte généré
      if (!data.generated_text) {
        throw new Error("Réponse reçue mais sans contenu");
      }
      
      return data.generated_text;
    } catch (error: any) {
      console.error("Erreur lors de la génération:", error);
      
      // Message d'erreur convivial pour l'utilisateur
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        toast({
          title: "Temps de réponse dépassé",
          description: "Le serveur IA met trop de temps à répondre. Essayez à nouveau ou vérifiez la configuration.",
          variant: "destructive"
        });
        throw new Error("Le temps de réponse du serveur IA a été dépassé. Veuillez réessayer.");
      }
      
      if (error.message?.includes('fetch') || error.message?.includes('connexion')) {
        toast({
          title: "Problème de connexion",
          description: "Impossible de se connecter au serveur IA local. Vérifiez que le serveur est démarré.",
          variant: "destructive"
        });
      }
      
      throw error;
    }
  }
};
