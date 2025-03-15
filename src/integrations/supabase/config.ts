
// Configuration values for Supabase
import { getBaseUrl } from '@/utils/environment';

// Prioritize environment variables if defined
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dbdueopvtlanxgumenpu.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk";

// Export SITE_URL for OAuth redirects
export const SITE_URL = getBaseUrl();
