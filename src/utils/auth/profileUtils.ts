import { supabase } from '@/compatibility/supabaseCompat';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function updateProfile(userId: string, data: ProfileUpdate) {
  return supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);
} 