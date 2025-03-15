
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecureApiProxy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const callApi = async <T>(service: string, endpoint: string, payload?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await supabase.functions.invoke('secure-api-proxy', {
        body: {
          service,
          endpoint,
          payload,
          method
        }
      });

      if (apiError) throw apiError;
      return data as T;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkServiceConfig = async (service: string): Promise<boolean> => {
    try {
      const { data } = await supabase.functions.invoke('manage-service-config', {
        body: { action: 'check', service }
      });
      
      return data?.isConfigured || false;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  return {
    callApi,
    checkServiceConfig,
    isLoading,
    error
  };
};
