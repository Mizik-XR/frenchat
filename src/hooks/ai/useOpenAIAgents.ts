
import { useState  } from '@/core/reactInstance';
import { toast } from '@/hooks/use-toast';
import { useSecureApiProxy } from '@/hooks/useSecureApiProxy';
import { OpenAIAssistant, OpenAIThread, OpenAIMessage, OpenAIRun } from '@/types/openai';
import { useAuth } from '@/components/AuthProvider';

export function useOpenAIAgents() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { callApi } = useSecureApiProxy();
  const { user } = useAuth();

  /**
   * Vérifie si l'API OpenAI Assistants est configurée
   */
  const checkAssistantsApiAccess = async (): Promise<boolean> => {
    try {
      const isConfigured = await callApi<boolean>('openai', 'assistants', {}, 'GET');
      return isConfigured;
    } catch (err) {
      console.warn("Erreur lors de la vérification de l'accès à l'API Assistants:", err);
      return false;
    }
  };

  /**
   * Crée un nouvel assistant OpenAI
   */
  const createAssistant = async (
    name: string,
    instructions: string,
    tools: ('code_interpreter' | 'retrieval' | 'function')[],
    model: string = 'gpt-4o',
    fileIds: string[] = []
  ): Promise<OpenAIAssistant | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedTools = tools.map(tool => ({ type: tool }));
      
      const assistant = await callApi<OpenAIAssistant>('openai', 'assistants', {
        name,
        instructions,
        tools: formattedTools,
        model,
        file_ids: fileIds
      });
      
      return assistant;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Erreur lors de la création de l'assistant",
        description: err.message || "Une erreur s'est produite",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crée un nouveau thread de conversation
   */
  const createThread = async (): Promise<OpenAIThread | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const thread = await callApi<OpenAIThread>('openai', 'threads', {});
      return thread;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Erreur lors de la création du thread",
        description: err.message || "Une erreur s'est produite",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envoie un message à un thread et lance l'exécution de l'assistant
   */
  const sendMessageAndRun = async (
    threadId: string,
    assistantId: string,
    content: string,
    fileIds: string[] = []
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Ajouter le message au thread
      await callApi<OpenAIMessage>('openai', `threads/${threadId}/messages`, {
        role: 'user',
        content,
        file_ids: fileIds
      });

      // 2. Exécuter l'assistant sur le thread
      const run = await callApi<OpenAIRun>('openai', `threads/${threadId}/runs`, {
        assistant_id: assistantId
      });

      // 3. Attendre que l'exécution soit terminée (polling)
      const response = await pollRunStatus(threadId, run.id);
      return response;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Erreur lors de l'envoi du message",
        description: err.message || "Une erreur s'est produite",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérifie régulièrement l'état d'une exécution jusqu'à ce qu'elle soit terminée
   */
  const pollRunStatus = async (threadId: string, runId: string): Promise<string | null> => {
    const maxRetries = 30; // Maximum 30 tentatives (~ 1 minute)
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const run = await callApi<OpenAIRun>('openai', `threads/${threadId}/runs/${runId}`, {}, 'GET');

        if (run.status === 'completed') {
          // L'exécution est terminée, récupérer les messages
          const messages = await callApi<{ data: OpenAIMessage[] }>(
            'openai',
            `threads/${threadId}/messages`,
            {},
            'GET'
          );

          // Trouver le dernier message de l'assistant
          const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
          if (assistantMessages.length > 0) {
            // Extraire et renvoyer le contenu textuel
            const latestMessage = assistantMessages[0];
            if (latestMessage.content[0]?.type === 'text') {
              return latestMessage.content[0].text.value;
            }
          }
          return null;
        } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
          throw new Error(`Exécution terminée avec le statut: ${run.status}. ${run.last_error?.message || ''}`);
        }

        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      } catch (err) {
        throw err;
      }
    }

    throw new Error("L'exécution a pris trop de temps");
  };

  /**
   * Envoie un fichier à OpenAI pour utilisation avec les assistants
   */
  const uploadFileForAssistant = async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convertir le fichier en Base64
      const fileContent = await readFileAsBase64(file);
      
      const response = await callApi<{ id: string }>('openai', 'files', {
        file: fileContent,
        filename: file.name,
        purpose: 'assistants'
      });
      
      return response.id;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Erreur lors de l'envoi du fichier",
        description: err.message || "Une erreur s'est produite",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Utilitaire pour lire un fichier en Base64
   */
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extraire uniquement la partie base64 du Data URL
        const base64Content = result.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  /**
   * Fonction simplifiée pour utiliser un agent OpenAI à des fins de RAG
   */
  const askAgentWithContext = async (
    context: string,
    question: string,
    options?: {
      modelName?: string;
      instructions?: string;
    }
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Créer un assistant temporaire
      const assistant = await createAssistant(
        "Assistant RAG temporaire",
        options?.instructions || `Utilise le contexte fourni pour répondre à la question de l'utilisateur. 
        Si la réponse ne peut pas être déterminée à partir du contexte, indique-le clairement.
        
        Contexte:
        ${context}`,
        ["retrieval"],
        options?.modelName || "gpt-4o"
      );

      if (!assistant) {
        throw new Error("Impossible de créer l'assistant");
      }

      // Créer un thread
      const thread = await createThread();
      if (!thread) {
        throw new Error("Impossible de créer le thread");
      }

      // Envoyer la question et attendre la réponse
      const response = await sendMessageAndRun(thread.id, assistant.id, question);
      return response;
    } catch (err: any) {
      setError(err);
      toast({
        title: "Erreur lors de l'utilisation de l'agent",
        description: err.message || "Une erreur s'est produite",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAssistant,
    createThread,
    sendMessageAndRun,
    uploadFileForAssistant,
    askAgentWithContext,
    checkAssistantsApiAccess,
    isLoading,
    error
  };
}
