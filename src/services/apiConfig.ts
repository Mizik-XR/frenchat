
import { supabase } from "@/integrations/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

export const apiConfig = {
  baseURL: API_URL,
  isProduction: ENVIRONMENT === 'production',
  
  async getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
    };
  },

  endpoints: {
    textGeneration: '/generate',
    modelInfo: '/model-info',
  }
};

export const isLocalDevelopment = () => ENVIRONMENT === 'development';
