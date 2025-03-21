
/**
 * Utilitaires pour la gestion des profils utilisateurs dans Supabase
 * 
 * Ce fichier sert désormais uniquement à réexporter les fonctions de client.ts
 * pour éviter une dépendance circulaire.
 */

import { handleProfileQuery, checkSupabaseConnection } from './client';
import type { UserProfile } from './supabaseModels';

// Réexportation des fonctions pour maintenir la compatibilité API
export { handleProfileQuery, checkSupabaseConnection };

// Réexportation des types pour maintenir la compatibilité API
export type { UserProfile };

// Définition du type pour la compatibilité avec les consommateurs existants
export interface ProfileQueryResult {
  data: UserProfile | null;
  error: { message: string } | null;
}
