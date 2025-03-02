
import { useState, useCallback } from 'react';
import { supabase, EdgeFunctionResponse } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Hook pour appeler des APIs externes de façon sécurisée via une Edge Function
 * Les clés API ne sont jamais exposées au client
 */
export const useSecureApiProxy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Appelle un service API externe de façon sécurisée
   * @param service Le nom du service (ex: 'openai', 'anthropic')
   * @param endpoint Le endpoint de l'API (sans le domaine de base)
   * @param payload Les données à envoyer
   * @param method La méthode HTTP à utiliser
   * @returns Les données de réponse de l'API
   */
  const callApi = useCallback(async <T>(
    service: string,
    endpoint: string,
    payload?: any,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('secure-api-proxy', {
        body: {
          service,
          endpoint,
          payload,
          method
        }
      }) as EdgeFunctionResponse<T>;

      if (error) {
        throw new Error(`Erreur du proxy API sécurisé: ${error.message}`);
      }

      return data as T;
    } catch (err) {
      console.error("Erreur lors de l'appel API sécurisé:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      
      // Notification utilisateur
      toast({
        title: "Erreur API",
        description: `Impossible d'appeler le service ${service}: ${errorMessage}`,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Vérifie si un service a une configuration valide
   * @param service Le service à vérifier
   * @returns Vrai si le service est configuré
   */
  const checkServiceConfig = useCallback(async (service: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('service_configurations')
        .select('id, status')
        .eq('service_type', service)
        .maybeSingle();

      if (error) {
        console.error(`Erreur lors de la vérification de la configuration ${service}:`, error);
        return false;
      }

      return data?.status === 'configured';
    } catch (err) {
      console.error(`Erreur lors de la vérification de la configuration ${service}:`, err);
      return false;
    }
  }, []);

  return {
    callApi,
    checkServiceConfig,
    isLoading,
    error
  };
};
