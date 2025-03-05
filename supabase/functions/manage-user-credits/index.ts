
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const body = await req.json();
    const { action, userId, amount, paymentToken } = body;
    
    // Vérifier les paramètres requis
    if (!userId) {
      throw new Error('user_id est requis');
    }
    
    // Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', userError);
      throw new Error('Utilisateur non trouvé');
    }
    
    let result;
    
    switch(action) {
      case 'check_balance':
        // Récupérer le solde de crédits
        result = await checkBalance(supabase, userId);
        break;
        
      case 'add_credits':
        // Vérifier le montant requis pour l'ajout
        if (!amount || amount <= 0) {
          throw new Error('Montant invalide');
        }
        
        // Vérifier le token de paiement pour un ajout réel
        if (!paymentToken && amount > 0) {
          throw new Error('Token de paiement requis');
        }
        
        result = await addCredits(supabase, userId, amount, paymentToken);
        break;
        
      case 'use_credits':
        // Vérifier le montant requis pour l'utilisation
        if (!amount || amount < 0) {
          throw new Error('Montant invalide');
        }
        
        result = await useCredits(supabase, userId, amount);
        break;
        
      default:
        throw new Error('Action non reconnue');
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans manage-user-credits:', error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Vérifie le solde de crédits d'un utilisateur
 */
async function checkBalance(supabase, userId: string) {
  // Récupérer le solde de l'utilisateur
  const { data, error } = await supabase
    .from('user_credits')
    .select('credit_balance, last_updated')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Erreur lors de la vérification du solde:', error);
    throw new Error('Impossible de vérifier le solde');
  }
  
  // Si pas d'entrée trouvée, créer un solde par défaut
  if (!data) {
    // Créer un crédit initial pour les nouveaux utilisateurs
    const initialCredit = 5.0; // $5 gratuits pour démarrer
    
    const { error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credit_balance: initialCredit,
        last_updated: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Erreur lors de la création du solde initial:', insertError);
      throw new Error('Impossible de créer le solde initial');
    }
    
    return { 
      credit_balance: initialCredit,
      is_new_user: true,
      last_updated: new Date().toISOString()
    };
  }
  
  return {
    credit_balance: data.credit_balance,
    is_new_user: false,
    last_updated: data.last_updated
  };
}

/**
 * Ajoute des crédits au compte d'un utilisateur
 */
async function addCredits(supabase, userId: string, amount: number, paymentToken: string) {
  // Dans un système réel, on traiterait ici le paiement avec Stripe ou autre
  // Pour l'exemple, on va simuler un ajout de crédit sans vérification
  
  const simulated_payment_success = true; // En production, vérifier avec le processeur de paiement
  
  if (!simulated_payment_success) {
    throw new Error('Paiement refusé');
  }
  
  // Récupérer le solde actuel
  const { data, error } = await supabase
    .from('user_credits')
    .select('credit_balance')
    .eq('user_id', userId)
    .single();
  
  let currentBalance = 0;
  
  if (error && error.code !== 'PGRST116') {
    console.error('Erreur lors de la récupération du solde:', error);
    throw new Error('Impossible de récupérer le solde actuel');
  } else if (data) {
    currentBalance = data.credit_balance;
  }
  
  // Ajouter le montant au solde
  const newBalance = currentBalance + amount;
  
  // Enregistrer le nouveau solde
  const { error: updateError } = await supabase
    .from('user_credits')
    .upsert({
      user_id: userId,
      credit_balance: newBalance,
      last_updated: new Date().toISOString()
    });
  
  if (updateError) {
    console.error('Erreur lors de la mise à jour du solde:', updateError);
    throw new Error('Impossible de mettre à jour le solde');
  }
  
  // Enregistrer la transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: amount,
      transaction_type: 'deposit',
      status: 'completed',
      metadata: { payment_method: 'credit_card', payment_id: paymentToken || 'simulated' }
    });
  
  if (transactionError) {
    console.error('Erreur lors de l\'enregistrement de la transaction:', transactionError);
    // Ne pas bloquer l'opération si l'enregistrement de la transaction échoue
  }
  
  return {
    previous_balance: currentBalance,
    new_balance: newBalance,
    added_amount: amount,
    success: true
  };
}

/**
 * Utilise des crédits du compte d'un utilisateur
 */
async function useCredits(supabase, userId: string, amount: number) {
  // Récupérer le solde actuel
  const { data, error } = await supabase
    .from('user_credits')
    .select('credit_balance')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    throw new Error('Impossible de récupérer le solde actuel');
  }
  
  const currentBalance = data?.credit_balance || 0;
  
  // Vérifier si l'utilisateur a assez de crédits
  if (currentBalance < amount) {
    return {
      success: false,
      error: 'credit_insufficient',
      current_balance: currentBalance,
      required_amount: amount,
      missing_amount: amount - currentBalance
    };
  }
  
  // Soustraire le montant du solde
  const newBalance = currentBalance - amount;
  
  const { error: updateError } = await supabase
    .from('user_credits')
    .update({
      credit_balance: newBalance,
      last_updated: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('Erreur lors de la mise à jour du solde:', updateError);
    throw new Error('Impossible de mettre à jour le solde');
  }
  
  // Enregistrer la transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: amount,
      transaction_type: 'usage',
      status: 'completed',
      metadata: { service: 'ai_api', operation: 'generation' }
    });
  
  if (transactionError) {
    console.error('Erreur lors de l\'enregistrement de la transaction:', transactionError);
    // Ne pas bloquer l'opération si l'enregistrement de la transaction échoue
  }
  
  return {
    previous_balance: currentBalance,
    new_balance: newBalance,
    used_amount: amount,
    success: true
  };
}
