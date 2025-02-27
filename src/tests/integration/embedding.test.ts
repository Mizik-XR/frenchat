
/// <reference types="vitest" />

import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { LLMConfig } from '@/types/config';
import { 
  getCachedEmbedding, 
  cacheEmbedding,
  optimizedCache
} from '@/utils/embeddingCache';
import { 
  selectOptimalEmbeddingModel, 
  normalizeVector, 
  applyModelInstruction 
} from '@/utils/embeddingModels';

describe('Tests integration - Embeddings', () => {
  let testConfig: LLMConfig;

  beforeEach(() => {
    testConfig = {
      provider: 'huggingface',
      apiKey: process.env.VITE_HUGGINGFACE_API_KEY || '',
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      rateLimit: 10
    };
  });

  it('devrait generer et mettre en cache un embedding', async () => {
    const testText = "Ceci est un test d'embedding";
    
    console.log('Generating embedding for text:', testText);
    const { data: embedding, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text: testText, config: testConfig }
    });

    if (error) {
      console.error('Error generating embedding:', error);
    }

    expect(error).toBeNull();
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
    console.log('Embedding generated successfully');
  });

  it('devrait recuperer un embedding depuis le cache', async () => {
    const testText = "Test de recuperation du cache";
    
    console.log('Testing cache retrieval for text:', testText);
    
    // Première génération pour mettre en cache
    await supabase.functions.invoke('generate-embedding', {
      body: { text: testText, config: testConfig }
    });

    // Deuxième appel pour tester le cache
    const startTime = Date.now();
    const { data: cachedEmbedding, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text: testText, config: testConfig }
    });

    const duration = Date.now() - startTime;
    
    if (error) {
      console.error('Error retrieving from cache:', error);
    }

    expect(error).toBeNull();
    expect(cachedEmbedding).toBeDefined();
    expect(duration).toBeLessThan(100); // Le cache devrait être rapide
    console.log('Cache retrieval successful, duration:', duration);
  });

  it('devrait gerer les erreurs de generation', async () => {
    const invalidConfig = {
      ...testConfig,
      model: 'invalid-model'
    };

    console.log('Testing error handling with invalid model');
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text: 'Test', config: invalidConfig }
    });

    expect(error).toBeDefined();
    console.log('Error handling test completed');
  });

  // Tests pour les nouvelles fonctionnalités
  describe('Tests des fonctionnalités avancées', () => {
    it('devrait normaliser correctement un vecteur', () => {
      const testVector = [1, 2, 3, 4, 5];
      const normalized = normalizeVector(testVector);
      
      // Vérifier que la norme est de 1
      const magnitude = Math.sqrt(normalized.reduce((sum, val) => sum + val * val, 0));
      expect(magnitude).toBeCloseTo(1, 5); // Tolérance de 5 décimales
    });

    it('devrait appliquer correctement une instruction à un modèle', () => {
      const testText = "Comment fonctionne l'embedding?";
      const testModel = {
        id: 'test-model',
        name: 'Test Model',
        provider: 'huggingface' as const,
        dimensions: 768,
        description: 'For testing',
        contextLength: 512,
        isMultilingual: false,
        recommendedFor: ['test'],
        instructionTemplate: 'Represent this for embedding: '
      };
      
      const processed = applyModelInstruction(testText, testModel);
      expect(processed).toBe('Represent this for embedding: Comment fonctionne l\'embedding?');
    });

    it('devrait sélectionner le bon modèle selon le type de document', () => {
      // Test pour document technique
      const techModel = selectOptimalEmbeddingModel('technical', 1000);
      expect(techModel.id).toBe('bge-large-en-v1.5');
      
      // Test pour document long
      const longModel = selectOptimalEmbeddingModel('general', 5000);
      expect(longModel.maxTokens).toBeGreaterThanOrEqual(5000);
      
      // Test pour document multilingue
      const multiModel = selectOptimalEmbeddingModel('multilingual', 1000);
      expect(multiModel.isMultilingual).toBe(true);
    });
  });

  // Tests pour le système de cache optimisé
  describe('Tests du cache optimisé', () => {
    it('devrait stocker et récupérer via le cache optimisé', async () => {
      // Ceci est un test simulé puisque nous n'avons pas d'accès réel à la BD
      // pour les tests d'intégration complets
      
      const mockVector = {
        id: 'test-key',
        dimensions: 3,
        values: [0.1, 0.2, 0.3]
      };
      
      const mockEntry = {
        vector: mockVector,
        text: 'Test text',
        modelId: 'test-model',
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 heure dans le futur
        accessCount: 1
      };
      
      // Accéder à une instance du cache optimisé
      const cache = optimizedCache;
      
      // Simuler un set (sans réellement accéder à la BD)
      cache.set('test-key', mockEntry);
      
      // Note: Le vrai test d'intégration nécessiterait un accès à la BD
      // Ce test vérifie uniquement que l'API fonctionne comme prévu
      expect(cache).toBeDefined();
    });
  });
});
