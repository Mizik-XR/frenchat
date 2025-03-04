
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

// Fonctions de chiffrement et déchiffrement des tokens
export function encryptToken(token: string, tokenEncryptionKey: string): string {
  try {
    if (!tokenEncryptionKey) {
      console.error("Erreur: TOKEN_ENCRYPTION_KEY non définie");
      throw new Error("Configuration de chiffrement manquante");
    }

    // Dérivation de la clé à partir de la clé principale
    const key = scryptSync(tokenEncryptionKey, 'salt', 32);
    
    // Génération d'un vecteur d'initialisation aléatoire
    const iv = randomBytes(16);
    
    // Création du chiffreur
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    
    // Chiffrement du token
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Concaténation de l'IV et du texte chiffré pour stockage
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error("Erreur lors du chiffrement du token:", error);
    throw new Error("Échec du chiffrement");
  }
}

export function decryptToken(encryptedToken: string, tokenEncryptionKey: string): string {
  try {
    if (!tokenEncryptionKey) {
      console.error("Erreur: TOKEN_ENCRYPTION_KEY non définie");
      throw new Error("Configuration de chiffrement manquante");
    }

    // Séparation de l'IV et du texte chiffré
    const parts = encryptedToken.split(':');
    if (parts.length !== 2) {
      throw new Error("Format de token chiffré invalide");
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Dérivation de la clé (identique à celle utilisée pour le chiffrement)
    const key = scryptSync(tokenEncryptionKey, 'salt', 32);
    
    // Création du déchiffreur
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    
    // Déchiffrement du token
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Erreur lors du déchiffrement du token:", error);
    throw new Error("Échec du déchiffrement");
  }
}
