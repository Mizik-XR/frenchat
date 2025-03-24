
import { useState, useEffect  } from '@/core/reactInstance';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface UserCreditUsage {
  totalUsage: number;
  tokenUsage: number;
  estimatedCost: number;
  creditBalance: number;
  remainingCredit: number;
  hasLowCredit: boolean;
  isOutOfCredit: boolean;
}

/**
 * Hook pour gérer l'utilisation des crédits IA par l'utilisateur
 */
export function useUserCreditUsage() {
  const { user } = useAuth();
  const [creditUsage, setCreditUsage] = useState<UserCreditUsage>({
    totalUsage: 0,
    tokenUsage: 0,
    estimatedCost: 0,
    creditBalance: 0,
    remainingCredit: 0,
    hasLowCredit: false,
    isOutOfCredit: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère l'utilisation des crédits de l'utilisateur courant
   */
  const fetchUserCreditUsage = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser la fonction Edge pour obtenir le solde de l'utilisateur
      const { data: creditResponse, error: creditError } = await supabase.functions.invoke('manage-user-credits', {
        body: { 
          action: 'check_balance',
          userId: user.id
        }
      });
      
      if (creditError) {
        throw creditError;
      }
      
      // Obtenir le solde de crédits
      const creditBalance = creditResponse?.credit_balance || 0;
      
      // Récupérer l'utilisation des tokens
      const { data: usageData, error: usageError } = await supabase
        .from('ai_usage_metrics')
        .select('tokens_input, tokens_output, estimated_cost, from_cache')
        .eq('user_id', user.id);
      
      if (usageError) throw usageError;
      
      // Calculer l'utilisation totale
      const tokenUsage = (usageData || []).reduce((sum, record) => 
        sum + record.tokens_input + record.tokens_output, 0);
      
      const estimatedCost = (usageData || []).reduce((sum, record) => 
        sum + record.estimated_cost, 0);
      
      const remainingCredit = creditBalance - estimatedCost;
      const hasLowCredit = remainingCredit < 1.0; // Alerte si moins de $1
      const isOutOfCredit = remainingCredit <= 0;
      
      setCreditUsage({
        totalUsage: (usageData || []).length,
        tokenUsage,
        estimatedCost,
        creditBalance,
        remainingCredit,
        hasLowCredit,
        isOutOfCredit
      });
      
      // Afficher une alerte si crédit faible
      if (hasLowCredit && !isOutOfCredit) {
        toast({
          title: "Crédit IA faible",
          description: `Vous avez $${remainingCredit.toFixed(2)} de crédit restant. Pensez à recharger votre compte.`,
          variant: "default",
        });
      } else if (isOutOfCredit) {
        toast({
          title: "Crédit IA épuisé",
          description: "Vous n'avez plus de crédit. Certaines fonctionnalités cloud sont limitées.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des crédits:", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Ajoute des crédits au compte de l'utilisateur
   */
  const addCredits = async (amount: number) => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour ajouter des crédits",
        variant: "destructive",
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant des crédits doit être positif",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: response, error } = await supabase.functions.invoke('manage-user-credits', {
        body: { 
          action: 'add_credits',
          userId: user.id,
          amount: amount,
          paymentToken: 'simulated_payment' // À remplacer par un vrai token de paiement
        }
      });
      
      if (error) throw error;
      
      if (response && response.success) {
        toast({
          title: "Crédits ajoutés",
          description: `${amount.toFixed(2)}$ ont été ajoutés à votre compte`,
        });
        
        // Mettre à jour l'affichage des crédits
        await fetchUserCreditUsage();
      } else {
        throw new Error("Échec de l'ajout de crédits");
      }
      
    } catch (e) {
      console.error("Erreur lors de l'ajout de crédits:", e);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter des crédits",
        variant: "destructive",
      });
    }
  };
  
  // Charger les données au montage du composant et lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      fetchUserCreditUsage();
    }
  }, [user]);
  
  return {
    creditUsage,
    isLoading,
    error,
    fetchUserCreditUsage,
    addCredits
  };
}
