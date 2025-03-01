
/**
 * Service analysis utilities for diagnostic reporting
 */
import { supabase } from '@/integrations/supabase/client';
import { checkLocalService } from '../aiServiceUtils';

/**
 * Tests the cloud service availability and response time
 * @returns Object with availability status and response time
 */
export const testCloudService = async (): Promise<{ available: boolean, responseTime: number | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('ping-cloud-service', { 
      body: { timestamp: new Date().toISOString() }
    });
    
    if (error) throw error;
    
    return {
      available: true,
      responseTime: data?.responseTime || null
    };
  } catch (e) {
    console.error("Erreur lors du test du service cloud:", e);
    return {
      available: false,
      responseTime: null
    };
  }
};

/**
 * Determines the recommended AI service mode based on analysis
 * @param isLocalAvailable Whether local service is available
 * @param systemCapabilities System capabilities analysis result
 * @returns Recommended mode: 'local', 'cloud', or 'hybrid'
 */
export const determineRecommendedMode = (
  isLocalAvailable: boolean, 
  systemCapabilities: { recommendLocalExecution: boolean }
): 'local' | 'cloud' | 'hybrid' => {
  if (isLocalAvailable && systemCapabilities.recommendLocalExecution) {
    return 'local';
  } else if (isLocalAvailable) {
    return 'hybrid';
  } else {
    return 'cloud';
  }
};
