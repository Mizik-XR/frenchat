
import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Tests d\'intégration - OAuth et Google Drive', () => {
  let userId: string;

  beforeEach(async () => {
    const { data } = await supabase.auth.getSession();
    userId = data.session?.user.id as string;
  });

  it('devrait gérer correctement le flux OAuth Google', async () => {
    // Vérification de la configuration OAuth
    const { data: config, error: configError } = await supabase
      .from('service_configurations')
      .select('*')
      .eq('service_type', 'GOOGLE_OAUTH')
      .single();

    expect(configError).toBeNull();
    expect(config.status).toBe('configured');

    // Vérification des tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .maybeSingle();

    if (tokens) {
      expect(tokensError).toBeNull();
      expect(tokens.access_token).toBeDefined();
      expect(new Date(tokens.expires_at as string)).toBeGreaterThan(new Date());
    }
  });

  it('devrait gérer les erreurs de configuration OAuth', async () => {
    const { error } = await supabase.functions.invoke('google-oauth', {
      body: { code: 'invalid_code' }
    });

    expect(error).toBeDefined();
  });
});
