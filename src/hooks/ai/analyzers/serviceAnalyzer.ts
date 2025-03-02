
/**
 * Module d'analyse et de test des services IA
 * Ce module teste les services IA et recommande le meilleur mode d'exécution
 */

import { AIServiceType } from '../types';
import { estimateSystemCapabilities } from './systemCapabilities';
import { testResponseTime } from './networkAnalyzer';

// Test du service cloud pour vérifier sa disponibilité
export const testCloudService = async (): Promise<{
  available: boolean;
  responseTimeMs?: number;
  error?: string;
}> => {
  try {
    const startTime = Date.now();
    
    // Test simple vers l'API Hugging Face
    const response = await fetch('https://api-inference.huggingface.co/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Court timeout pour ne pas bloquer l'interface
      signal: AbortSignal.timeout(3000),
    });
    
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    
    if (response.ok) {
      return {
        available: true,
        responseTimeMs,
      };
    } else {
      return {
        available: false,
        responseTimeMs,
        error: `Statut HTTP: ${response.status}`,
      };
    }
  } catch (error: any) {
    return {
      available: false,
      error: error.message || 'Erreur inconnue',
    };
  }
};

// Test du service Ollama
export const testOllamaService = async (): Promise<{
  available: boolean;
  responseTimeMs?: number;
  error?: string;
}> => {
  try {
    const startTime = Date.now();
    
    // Test sur le port standard d'Ollama
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      // Court timeout pour ne pas bloquer l'interface
      signal: AbortSignal.timeout(2000),
    });
    
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    
    if (response.ok) {
      // Lire les modèles disponibles
      const data = await response.json();
      const hasModels = data.models && data.models.length > 0;
      
      return {
        available: true,
        responseTimeMs,
      };
    } else {
      return {
        available: false,
        responseTimeMs,
        error: `Statut HTTP: ${response.status}`,
      };
    }
  } catch (error: any) {
    const isConnectionRefused = error.message?.includes('ECONNREFUSED') || 
                               error.message?.includes('Failed to fetch');
    
    return {
      available: false,
      error: isConnectionRefused 
        ? "Ollama n'est pas démarré sur ce système" 
        : (error.message || 'Erreur inconnue'),
    };
  }
};

// Test du service IA local standard
export const testLocalService = async (url: string = 'http://localhost:8000'): Promise<{
  available: boolean;
  responseTimeMs?: number;
  error?: string;
}> => {
  try {
    const startTime = Date.now();
    
    // Test simple vers notre API locale
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      // Court timeout pour ne pas bloquer l'interface
      signal: AbortSignal.timeout(2000),
    });
    
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    
    if (response.ok) {
      return {
        available: true,
        responseTimeMs,
      };
    } else {
      return {
        available: false,
        responseTimeMs,
        error: `Statut HTTP: ${response.status}`,
      };
    }
  } catch (error: any) {
    const isConnectionRefused = error.message?.includes('ECONNREFUSED') || 
                               error.message?.includes('Failed to fetch');
    
    return {
      available: false,
      error: isConnectionRefused 
        ? "Le service IA local n'est pas démarré" 
        : (error.message || 'Erreur inconnue'),
    };
  }
};

// Détermine le mode recommandé en fonction de l'analyse du système et des services
export const determineRecommendedMode = async (): Promise<{
  recommendedMode: AIServiceType;
  reason: string;
  localAvailable: boolean;
  cloudAvailable: boolean;
  systemCapable: boolean;
}> => {
  // Analyse des capacités système
  const systemCapabilities = await estimateSystemCapabilities();
  const systemCapable = systemCapabilities.recommendLocalExecution;
  
  // Test du service local standard
  const localServiceResult = await testLocalService();
  const localPythonAvailable = localServiceResult.available;
  
  // Test d'Ollama
  const ollamaServiceResult = await testOllamaService();
  const ollamaAvailable = ollamaServiceResult.available;
  
  // Test du service cloud
  const cloudServiceResult = await testCloudService();
  const cloudAvailable = cloudServiceResult.available;
  
  // Un service local est disponible si l'un des deux est disponible
  const localAvailable = localPythonAvailable || ollamaAvailable;
  
  // Logique de recommandation
  if (localAvailable && systemCapable) {
    return {
      recommendedMode: 'local',
      reason: ollamaAvailable 
        ? "Ollama est disponible et votre système est compatible"
        : "Service IA local disponible et votre système est compatible",
      localAvailable,
      cloudAvailable,
      systemCapable
    };
  } else if (localAvailable && !systemCapable) {
    return {
      recommendedMode: 'cloud',
      reason: "Service local détecté mais ressources système limitées. Mode cloud recommandé pour de meilleures performances.",
      localAvailable,
      cloudAvailable,
      systemCapable
    };
  } else if (!localAvailable && cloudAvailable) {
    return {
      recommendedMode: 'cloud',
      reason: "Aucun service local détecté. Utilisation du mode cloud.",
      localAvailable,
      cloudAvailable,
      systemCapable
    };
  } else {
    // Cas où aucun service n'est disponible
    return {
      recommendedMode: 'cloud',
      reason: "Services IA non détectés. Mode cloud recommandé par défaut (API key requise).",
      localAvailable,
      cloudAvailable,
      systemCapable
    };
  }
};
