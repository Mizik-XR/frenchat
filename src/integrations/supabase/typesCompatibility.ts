
/**
 * Ce fichier fournit des ponts de compatibilité pour les types entre l'application et Supabase
 */
import type { Json } from '@/types/database';
import type { WebUIConfig, MessageMetadata } from '@/types/chat';

/**
 * Convertit WebUIConfig en type Json compatible avec Supabase
 */
export function webUIConfigToJson(config: WebUIConfig): Json {
  return config as unknown as Json;
}

/**
 * Convertit Json de Supabase en WebUIConfig
 */
export function jsonToWebUIConfig(json: Json): WebUIConfig {
  return json as unknown as WebUIConfig;
}

/**
 * Convertit MessageMetadata en Json pour Supabase
 */
export function messageMetadataToJson(metadata: MessageMetadata): Json {
  return metadata as unknown as Json;
}

/**
 * Convertit Json de Supabase en MessageMetadata
 */
export function jsonToMessageMetadata(json: Json): MessageMetadata {
  return json as unknown as MessageMetadata;
}

/**
 * Ajoute les fonctions RPC manquantes au type Database
 */
export function defineCustomRPCFunctions() {
  // Cette fonction est utilisée pour la documentation uniquement
  // Les implémentations réelles sont dans les fichiers spécifiques
}

/**
 * Normalise les dates entre string et number
 */
export function normalizeDate(dateValue: string | number): number {
  if (typeof dateValue === 'string') {
    return new Date(dateValue).getTime();
  }
  return dateValue;
}

/**
 * Convertit un nombre de millisecondes en chaîne de date ISO
 */
export function timestampToISOString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Convertit un type Json en type générique avec vérification
 */
export function jsonToType<T>(json: Json, defaultValue: T): T {
  if (!json) return defaultValue;
  
  try {
    return json as unknown as T;
  } catch (e) {
    console.error('Erreur lors de la conversion Json vers type:', e);
    return defaultValue;
  }
}
