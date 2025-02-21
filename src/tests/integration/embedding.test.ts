
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { LLMConfig } from '@/types/config';

describe('Tests d'intégration - Embeddings', () => {
  let testConfig: LLMConfig;

  beforeEach(() => {
    testConfig = {
      provider: 'huggingface',
      apiKey: process.env.VITE_HUGGINGFACE_API_KEY || '',
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      rateLimit: 10
    };
  });

  it('devrait générer et mettre en cache un embedding', async () => {
    const testText = "Ceci est un test d'embedding";
    
    const { data: embedding, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text: testText, config: testConfig }
    });

    expect(error).toBeNull();
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
  });

  it('devrait récupérer un embedding depuis le cache', async () => {
    const testText = "Test de récupération du cache";
    
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
    
    expect(error).toBeNull();
    expect(cachedEmbedding).toBeDefined();
    expect(duration).toBeLessThan(100); // Le cache devrait être rapide
  });
});
