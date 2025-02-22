
import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { ServiceType } from '@/types/config';

describe('Tests d\'intégration - Flux d\'authentification et configuration', () => {
  let testEmail: string;
  let testPassword: string;

  beforeEach(() => {
    testEmail = `test${Date.now()}@example.com`;
    testPassword = 'testPassword123!';
  });

  it('devrait permettre l\'inscription, la connexion et la configuration initiale', async () => {
    // Test d'inscription
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    expect(signUpError).toBeNull();
    expect(signUpData.user).toBeDefined();
    
    // Test de connexion
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    expect(signInError).toBeNull();
    expect(signInData.user).toBeDefined();

    // Vérification du profil créé
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user?.id)
      .single();

    expect(profileError).toBeNull();
    expect(profile).toBeDefined();
    expect(profile.is_first_login).toBe(true);

    // Test de configuration du service LLM
    const llmConfig = {
      provider: 'huggingface' as ServiceType,
      model: 'mistral-7b',
      apiKey: 'test-key'
    };

    const { error: configError } = await supabase
      .from('service_configurations')
      .insert({
        service_type: 'huggingface',
        config: llmConfig,
        status: 'configured'
      });

    expect(configError).toBeNull();

    // Vérification des tokens OAuth
    const { data: oauthTokens, error: oauthError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', signInData.user?.id);

    expect(oauthError).toBeNull();
    expect(oauthTokens).toBeDefined();
  });

  it('devrait gérer les erreurs de connexion correctement', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });

    expect(error).toBeDefined();
    expect(data.user).toBeNull();
  });

  it('devrait vérifier la configuration Google Drive', async () => {
    const { data: configData, error: configError } = await supabase
      .from('service_configurations')
      .select('*')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single();

    expect(configError).toBeNull();
    expect(configData).toBeDefined();
    expect(configData.config).toHaveProperty('client_id');
  });
});
