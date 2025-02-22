
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
      // Conversion des dates en timestamps pour la comparaison
      const expiresAtTimestamp = new Date(tokens.expires_at as string).getTime();
      const nowTimestamp = Date.now();
      expect(expiresAtTimestamp).toBeGreaterThan(nowTimestamp);
    }
  });

  it('devrait gérer la suppression des tokens sans affecter la session', async () => {
    // Suppression du token
    const { error: deleteError } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google');

    expect(deleteError).toBeNull();

    // Vérification que la session est toujours active
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    expect(sessionError).toBeNull();
    expect(session.session).toBeDefined();
    expect(session.session?.user.id).toBe(userId);

    // Vérification que le token a bien été supprimé
    const { data: tokens } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google');

    expect(tokens).toHaveLength(0);
  });

  it('devrait gérer les erreurs de configuration OAuth', async () => {
    const { error } = await supabase.functions.invoke('google-oauth', {
      body: { code: 'invalid_code' }
    });

    expect(error).toBeDefined();
  });
});
