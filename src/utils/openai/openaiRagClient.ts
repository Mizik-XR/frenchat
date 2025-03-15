
import { supabase } from "@/integrations/supabase/client";

/**
 * Client pour utiliser les fonctionnalités RAG d'OpenAI
 * Utilise le nouveau SDK OpenAI pour l'indexation et la recherche
 */
export class OpenAIRagClient {
  private apiKey: string | null = null;
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  /**
   * Initialise le client avec une clé API
   */
  async initialize(): Promise<boolean> {
    try {
      // Récupérer la clé API depuis Supabase
      const { data, error } = await supabase.functions.invoke('secure-api-proxy', {
        body: { 
          action: 'get-openai-api-key',
          userId: this.userId
        }
      });

      if (error || !data.apiKey) {
        console.error("Erreur lors de la récupération de la clé API OpenAI", error);
        return false;
      }

      this.apiKey = data.apiKey;
      return true;
    } catch (error) {
      console.error("Erreur lors de l'initialisation du client OpenAI RAG", error);
      return false;
    }
  }

  /**
   * Crée un fichier pour l'indexation
   */
  async createFile(content: string, filename: string): Promise<string | null> {
    if (!this.apiKey) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('openai-rag-indexing', {
        body: { 
          action: 'create-file',
          content,
          filename,
          userId: this.userId
        }
      });

      if (error) throw error;
      return data.fileId;
    } catch (error) {
      console.error("Erreur lors de la création du fichier pour indexation", error);
      return null;
    }
  }

  /**
   * Crée un assistant avec capacités de récupération de fichiers
   */
  async createAssistant(name: string, instructions: string, fileIds: string[]): Promise<string | null> {
    if (!this.apiKey) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('openai-rag-indexing', {
        body: { 
          action: 'create-assistant',
          name,
          instructions,
          fileIds,
          userId: this.userId
        }
      });

      if (error) throw error;
      return data.assistantId;
    } catch (error) {
      console.error("Erreur lors de la création de l'assistant", error);
      return null;
    }
  }

  /**
   * Crée un thread pour interagir avec l'assistant
   */
  async createThread(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-rag-indexing', {
        body: { 
          action: 'create-thread',
          userId: this.userId
        }
      });

      if (error) throw error;
      return data.threadId;
    } catch (error) {
      console.error("Erreur lors de la création du thread", error);
      return null;
    }
  }

  /**
   * Envoie un message et récupère la réponse de l'assistant
   */
  async sendMessage(
    threadId: string, 
    assistantId: string, 
    content: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-rag-indexing', {
        body: { 
          action: 'send-message',
          threadId,
          assistantId,
          content,
          userId: this.userId
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
      return null;
    }
  }

  /**
   * Fonction simplifiée pour interroger directement un document
   */
  async queryDocument(documentContent: string, query: string): Promise<string | null> {
    try {
      // Créer un fichier temporaire
      const fileId = await this.createFile(documentContent, `query_${Date.now()}.txt`);
      if (!fileId) return null;

      // Créer un assistant temporaire
      const assistantId = await this.createAssistant(
        "Assistant temporaire", 
        "Tu es un assistant qui répond aux questions basées uniquement sur le contenu du document fourni.", 
        [fileId]
      );
      if (!assistantId) return null;

      // Créer un thread
      const threadId = await this.createThread();
      if (!threadId) return null;

      // Envoyer le message et récupérer la réponse
      const response = await this.sendMessage(threadId, assistantId, query);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'interrogation du document", error);
      return null;
    }
  }
}

// Hook pour faciliter l'utilisation du client OpenAI RAG
export function useOpenAIRag(userId?: string) {
  const client = new OpenAIRagClient(userId);

  return {
    queryDocument: async (content: string, query: string): Promise<string | null> => {
      return await client.queryDocument(content, query);
    },
    createFile: async (content: string, filename: string): Promise<string | null> => {
      return await client.createFile(content, filename);
    },
    createAssistant: async (name: string, instructions: string, fileIds: string[]): Promise<string | null> => {
      return await client.createAssistant(name, instructions, fileIds);
    },
    sendMessage: async (threadId: string, assistantId: string, content: string): Promise<string | null> => {
      return await client.sendMessage(threadId, assistantId, content);
    }
  };
}
