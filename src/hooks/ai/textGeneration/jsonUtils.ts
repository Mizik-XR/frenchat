
/**
 * Utilitaires pour la manipulation sécurisée de JSON avec TypeScript
 */
import { Json } from '@/integrations/supabase/types';

// Conversion sécurisée d'un objet en type Json (pour Supabase)
export function toJson<T>(data: T): Json {
  return data as unknown as Json;
}

// Conversion sécurisée d'un type Json en objet typé
export function fromJson<T>(json: Json): T {
  return json as unknown as T;
}

// Construit un objet avec index signature
export function createIndexed<T>(): { [key: string]: T } {
  return {};
}

// Convertit un objet quelconque en objet avec index signature
export function asIndexed<T>(obj: any): { [key: string]: T } {
  return obj as { [key: string]: T };
}

// Création d'une interface à partir d'un objet Json
export interface JsonObject extends Record<string, Json> {}

// Helper pour assurer la conformité d'un objet avec l'interface JsonObject
export function ensureJsonObject(obj: any): JsonObject {
  if (typeof obj !== 'object' || obj === null) {
    return {};
  }
  return obj as JsonObject;
}

export default {
  toJson,
  fromJson,
  createIndexed,
  asIndexed,
  ensureJsonObject
};
