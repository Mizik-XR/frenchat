
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SupportedProvider, ServiceProvider } from "@/types/documents";

export const useDocumentProviders = (userId: string | undefined) => {
  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ['supported-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supported_providers')
        .select('*')
        .eq('enabled', true);

      if (error) throw error;
      return data as SupportedProvider[];
    },
  });

  const { data: connectedServices = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['service-providers', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as ServiceProvider[];
    },
    enabled: !!userId,
  });

  const isProviderConnected = (providerCode: string) => {
    return connectedServices.some(
      service => service.provider_type === providerCode && service.status === 'connected'
    );
  };

  return {
    providers,
    connectedServices,
    isProviderConnected,
    isLoading: isLoadingProviders || isLoadingServices,
  };
};
