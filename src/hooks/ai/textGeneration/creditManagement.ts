
/**
 * Retourne le coût estimé par token pour un fournisseur donné
 */
export function getProviderCostPerToken(provider: string): number {
  // Coûts approximatifs par token en USD (entrée + sortie moyennée)
  const costs: Record<string, number> = {
    'openai-gpt4': 0.00003,
    'openai-gpt35': 0.000005,
    'anthropic-claude': 0.00002,
    'mistral': 0.000007,
    'huggingface': 0.000002,
    'deepseek': 0.000008,
    'default': 0.00001
  };
  
  // Déterminer le modèle spécifique du fournisseur
  if (provider.includes('gpt-4')) {
    return costs['openai-gpt4'];
  } else if (provider.includes('gpt-3')) {
    return costs['openai-gpt35'];
  } else if (provider.includes('claude')) {
    return costs['anthropic-claude'];
  } else if (provider.includes('mistral')) {
    return costs['mistral'];
  } else if (provider.includes('hugging') || provider.includes('hf')) {
    return costs['huggingface'];
  } else if (provider.includes('deepseek')) {
    return costs['deepseek'];
  }
  
  return costs['default'];
}

/**
 * Calcule le coût total basé sur le nombre de tokens et le fournisseur
 */
export function calculateTokenCost(totalTokens: number, provider: string): number {
  const costPerToken = getProviderCostPerToken(provider);
  return totalTokens * costPerToken;
}

/**
 * Vérifie si l'utilisateur a suffisamment de crédits pour une opération
 * Retourne true si l'utilisateur a assez de crédits ou si l'opération est peu coûteuse
 */
export async function checkUserCredits(
  userId: string | undefined,
  estimatedCost: number
): Promise<boolean> {
  if (!userId) return true;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Vérifier le solde de crédits de l'utilisateur
    const { data: response } = await supabase.functions.invoke('manage-user-credits', {
      body: { 
        action: 'check_balance',
        userId
      }
    });
    
    if (response && response.credit_balance < estimatedCost) {
      // Si l'utilisateur n'a pas assez de crédits et que ce n'est pas très peu coûteux
      if (estimatedCost > 0.001) {
        throw new Error(`Crédit insuffisant pour cette opération. Coût estimé: $${estimatedCost.toFixed(4)}, Crédit disponible: $${response.credit_balance.toFixed(2)}`);
      }
      // Sinon, on permet quand même la requête car le coût est négligeable
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error && error.message?.includes('Crédit insuffisant')) {
      throw error; // Remonter l'erreur de crédit insuffisant
    }
    console.warn("Erreur lors de la vérification du crédit utilisateur:", error);
    // Continue même en cas d'erreur de vérification pour ne pas bloquer l'utilisateur
    return true;
  }
}

/**
 * Enregistre l'utilisation des tokens pour les statistiques et la facturation
 */
export async function logTokenUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number,
  provider: string,
  fromCache: boolean
): Promise<void> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Appeler la fonction Edge pour enregistrer l'utilisation
    await supabase.functions.invoke('log-token-usage', {
      body: { 
        userId,
        provider,
        inputTokens,
        outputTokens,
        fromCache,
        operationType: 'chat'
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisation des tokens:", error);
  }
}

/**
 * Déduit le coût des crédits de l'utilisateur
 */
export async function deductUserCredits(
  userId: string | undefined,
  cost: number
): Promise<void> {
  if (!userId || cost <= 0) return;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.functions.invoke('manage-user-credits', {
      body: { 
        action: 'use_credits',
        userId,
        amount: cost
      }
    });
  } catch (deductError) {
    console.warn("Erreur lors de la déduction des crédits:", deductError);
    // Ne pas bloquer l'opération si la déduction échoue
  }
}
