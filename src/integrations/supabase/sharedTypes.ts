
import type { Database } from './types';

// Types partagés utilisés par client.ts et profileUtils.ts
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserWithProfile = {
  id: string;
  email?: string;
  profile?: Profile | null;
};
