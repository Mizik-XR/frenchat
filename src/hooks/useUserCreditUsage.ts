import { useState, useEffect } from 'react';
import { APP_STATE } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";

// Types pour les statistiques d'utilisation
export interface UsageStatistics {
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCostEstimated: number;
  usageByProvider: Record<string, {
    count: number;
    tokensInput: number;
    tokensOutput: number;
    costEstimated: number;
  }>;
  recentUsage: {
    date: Date;
    tokensInput: number;
    tokensOutput: number;
    costEstimated: number;
    provider: string;
  }[];
}

// Hook pour obtenir et gérer les statistiques d'utilisation des crédits utilisateur
export const useUserCreditUsage = () => {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStatistics>({
    totalTokensInput: 0,
    totalTokensOutput: 0,
    totalCostEstimated: 0,
    usageByProvider: {},
    recentUsage: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour récupérer les données d'utilisation
  const fetchUsageData = async () => {
    // Si on est en mode hors ligne, renvoyer des données simulées
    if (APP_STATE.isOfflineMode) {
      setUsageStats(generateMockData());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Vérifier que l'utilisateur est authentifié
      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }

      // Appel à l'API pour récupérer les statistiques d'utilisation
      const response = await fetch(`/api/usage-metrics?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Vérifier la réponse
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des statistiques : ${response.statusText}`);
      }

      // Traiter les données
      const data = await response.json();
      setUsageStats(processUsageData(data));
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques d'utilisation :", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Générer des données simulées en cas d'erreur
      setUsageStats(generateMockData());
      
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos statistiques d'utilisation. Données simulées affichées.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Traiter les données d'utilisation brutes en format utilisable
  const processUsageData = (rawData: any): UsageStatistics => {
    // Logique de traitement des données
    // ... (Implémentation selon le format de données reçu)
    return {
      totalTokensInput: rawData.totalInputTokens || 0,
      totalTokensOutput: rawData.totalOutputTokens || 0,
      totalCostEstimated: rawData.totalCost || 0,
      usageByProvider: rawData.byProvider || {},
      recentUsage: rawData.history || []
    };
  };

  // Générer des données simulées pour la démonstration ou le développement
  const generateMockData = (): UsageStatistics => {
    // Création de données simulées
    return {
      totalTokensInput: 158920,
      totalTokensOutput: 36547,
      totalCostEstimated: 0.47,
      usageByProvider: {
        'openai': {
          count: 42,
          tokensInput: 105630,
          tokensOutput: 24156,
          costEstimated: 0.32
        },
        'huggingface': {
          count: 25,
          tokensInput: 53290,
          tokensOutput: 12391,
          costEstimated: 0.15
        }
      },
      recentUsage: Array(14).fill(0).map((_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        tokensInput: Math.floor(Math.random() * 10000) + 5000,
        tokensOutput: Math.floor(Math.random() * 3000) + 1000,
        costEstimated: parseFloat((Math.random() * 0.1).toFixed(3)),
        provider: Math.random() > 0.5 ? 'openai' : 'huggingface'
      }))
    };
  };

  // Rafraîchir les données d'utilisation
  const refreshUsageData = () => {
    fetchUsageData();
  };

  // Fonction pour mettre à jour les crédits utilisateur
  const updateUserCredits = async (amount: number) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }
      
      // Conversion du nombre en chaîne pour résoudre l'erreur TS2345
      const response = await fetch(`/api/user-credits/${user.id.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        throw new Error(`Échec de la mise à jour des crédits : ${response.statusText}`);
      }
      
      toast({
        title: "Crédits mis à jour",
        description: `${amount} crédits ont été ajoutés à votre compte.`,
        variant: "success"
      });
      
      // Rafraîchir les données après la mise à jour
      refreshUsageData();
    } catch (err) {
      console.error("Erreur lors de la mise à jour des crédits :", err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos crédits.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour vérifier les crédits restants
  const checkRemainingCredits = async () => {
    try {
      if (!user) return 0;
      
      // Conversion du nombre en chaîne pour résoudre l'erreur TS2345
      const response = await fetch(`/api/user-credits/${user.id.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Échec de la vérification des crédits : ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.remainingCredits || 0;
    } catch (err) {
      console.error("Erreur lors de la vérification des crédits restants :", err);
      return 0;
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (user || APP_STATE.isOfflineMode) {
      fetchUsageData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return {
    usageStats,
    isLoading,
    error,
    refreshUsageData,
    updateUserCredits,
    checkRemainingCredits
  };
};
