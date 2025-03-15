
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encrypt, decrypt } from "./utils/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cette fonction de hachage minimise l'exposition de la valeur en clair dans les logs
function hashValue(value: string): string {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash |= 0; // Convert to 32bit integer
    }
    
    return hash.toString(16);
  } catch (error) {
    console.error("Erreur de hachage:", error);
    return "hash-error";
  }
}

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser le client Supabase avec les variables d'environnement
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer l'utilisateur à partir du token d'autorisation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Non autorisé: Token manquant');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Non autorisé: Utilisateur non authentifié');
    }

    // Récupérer les données de la requête
    const { action, serviceType, apiKey, config } = await req.json();
    
    // Récupérer la clé principale de chiffrement depuis les variables d'environnement
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('Configuration de sécurité manquante');
    }

    console.log(`Action demandée: ${action}, Service: ${serviceType}`);

    // Actions disponibles
    switch (action) {
      case 'store': {
        if (!apiKey && !config) {
          throw new Error('Données manquantes pour le stockage');
        }

        let secureConfig = {};

        // Si une API key est fournie, la chiffrer
        if (apiKey) {
          // Log sécurisé qui n'expose pas la clé
          console.log(`Stockage de clé API pour service ${serviceType}, hash: ${hashValue(apiKey)}`);
          
          const encryptedApiKey = encrypt(apiKey, encryptionKey);
          secureConfig = { ...secureConfig, apiKey: encryptedApiKey };
        }

        // Chiffrer d'autres configurations si présentes
        if (config) {
          // Chiffrer chaque élément de config qui requiert sécurité
          const secureItems = {};
          for (const [key, value] of Object.entries(config)) {
            if (typeof value === 'string' && 
                (key.includes('key') || key.includes('token') || key.includes('secret') || key.includes('password'))) {
              secureItems[key] = encrypt(value as string, encryptionKey);
            } else {
              secureItems[key] = value;
            }
          }
          secureConfig = { ...secureConfig, ...secureItems };
        }

        // Stocker la configuration sécurisée en base de données
        const { error: insertError } = await supabaseClient
          .from('service_configurations')
          .upsert({
            user_id: user.id,
            service_type: serviceType,
            config: secureConfig,
            updated_at: new Date().toISOString(),
            last_tested_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,service_type'
          });

        if (insertError) throw insertError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Configuration stockée avec succès' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'retrieve': {
        // Récupérer la configuration chiffrée
        const { data: configData, error: fetchError } = await supabaseClient
          .from('service_configurations')
          .select('config')
          .eq('user_id', user.id)
          .eq('service_type', serviceType)
          .single();

        if (fetchError) {
          // Si c'est une erreur "not found", retourner un résultat vide plutôt qu'une erreur
          if (fetchError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ success: true, config: null }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          throw fetchError;
        }

        // Déchiffrer les éléments sécurisés
        const decryptedConfig = {};
        
        if (configData?.config) {
          for (const [key, value] of Object.entries(configData.config)) {
            if (typeof value === 'string' && 
                (key.includes('key') || key.includes('token') || key.includes('secret') || key.includes('password'))) {
              try {
                decryptedConfig[key] = decrypt(value, encryptionKey);
              } catch (e) {
                console.error(`Erreur de déchiffrement pour ${key}:`, e);
                decryptedConfig[key] = null;
              }
            } else {
              decryptedConfig[key] = value;
            }
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            config: decryptedConfig 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'delete': {
        // Supprimer la configuration
        const { error: deleteError } = await supabaseClient
          .from('service_configurations')
          .delete()
          .eq('user_id', user.id)
          .eq('service_type', serviceType);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Configuration supprimée avec succès' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        throw new Error(`Action non supportée: ${action}`);
    }
  } catch (error) {
    console.error(`Erreur:`, error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
