
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "https://deno.land/std@0.177.0/node/crypto.ts";

// Constantes pour le chiffrement
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT = 'filechat-secure-storage'; // Sel pour la dérivation de clé

/**
 * Dérive une clé de chiffrement à partir d'une clé maître
 * @param masterKey - Clé maître (secret d'environnement)
 * @returns Clé dérivée
 */
function deriveKey(masterKey: string): Uint8Array {
  try {
    return scryptSync(masterKey, SALT, KEY_LENGTH);
  } catch (error) {
    console.error("Erreur lors de la dérivation de la clé:", error);
    throw new Error("Impossible de dériver la clé de chiffrement");
  }
}

/**
 * Chiffre une chaîne en utilisant AES-256-GCM
 * @param text - Texte à chiffrer
 * @param masterKey - Clé maître
 * @returns Chaîne chiffrée au format BASE64(IV):BASE64(TAG):BASE64(DATA)
 */
export function encrypt(text: string, masterKey: string): string {
  try {
    // Générer un IV aléatoire
    const iv = randomBytes(IV_LENGTH);
    
    // Dériver la clé de chiffrement
    const key = deriveKey(masterKey);
    
    // Créer le chiffreur
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Chiffrer les données
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Récupérer le tag d'authentification
    const authTag = cipher.getAuthTag();
    
    // Retourner le résultat au format IV:TAG:DATA
    return `${Buffer.from(iv).toString('base64')}:${Buffer.from(authTag).toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error("Erreur lors du chiffrement:", error);
    throw new Error("Échec du chiffrement");
  }
}

/**
 * Déchiffre une chaîne chiffrée avec AES-256-GCM
 * @param encryptedText - Texte chiffré au format BASE64(IV):BASE64(TAG):BASE64(DATA)
 * @param masterKey - Clé maître
 * @returns Texte déchiffré
 */
export function decrypt(encryptedText: string, masterKey: string): string {
  try {
    // Séparer IV, tag et données chiffrées
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error("Format de données chiffrées invalide");
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    
    // Dériver la clé de déchiffrement
    const key = deriveKey(masterKey);
    
    // Créer le déchiffreur
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    // Configurer le tag d'authentification
    decipher.setAuthTag(authTag);
    
    // Déchiffrer les données
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Erreur lors du déchiffrement:", error);
    throw new Error("Échec du déchiffrement");
  }
}
