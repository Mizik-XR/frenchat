
/// <reference types="vitest" />

import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { LLMConfig } from '@/types/config';

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
});
