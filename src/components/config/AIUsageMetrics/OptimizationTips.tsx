
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UsageStatistics } from '@/hooks/user/useUserCreditUsage';

export interface OptimizationTipsProps {
  usageStats: UsageStatistics;
  isOfflineMode: boolean;
}

export const OptimizationTips: React.FC<OptimizationTipsProps> = ({ usageStats, isOfflineMode }) => {
  const { totalTokensInput, totalTokensOutput, usageByProvider } = usageStats;
  
  // Calculate input/output ratio
  const ratio = totalTokensOutput > 0 ? totalTokensInput / totalTokensOutput : 0;
  
  // Check if GPT-4 usage is high
  const gpt4Usage = usageByProvider['gpt-4']?.tokensInput || 0;
  const totalUsage = totalTokensInput + totalTokensOutput;
  const gpt4Percentage = totalUsage > 0 ? (gpt4Usage / totalUsage) * 100 : 0;
  
  // Check if most usage is from a few days
  const hasSpikeUsage = false; // Implement logic based on recentUsage
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-blue-500" />
          Optimisations suggérées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOfflineMode ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Mode hors ligne</AlertTitle>
            <AlertDescription>
              Les suggestions d'optimisation ne sont pas disponibles en mode hors ligne.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {ratio > 2 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ratio entrée/sortie élevé</AlertTitle>
                <AlertDescription>
                  Vos prompts sont très longs par rapport aux réponses générées.
                  Essayez de raccourcir vos prompts ou d'utiliser des documents plus petits pour réduire les coûts.
                </AlertDescription>
              </Alert>
            )}
            
            {gpt4Percentage > 50 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Utilisation importante de GPT-4</AlertTitle>
                <AlertDescription>
                  {gpt4Percentage.toFixed(0)}% de votre utilisation provient de GPT-4, qui est plus coûteux.
                  Envisagez d'utiliser GPT-3.5 pour les tâches moins complexes.
                </AlertDescription>
              </Alert>
            )}
            
            {hasSpikeUsage && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Pics d'utilisation</AlertTitle>
                <AlertDescription>
                  Votre utilisation est concentrée sur quelques jours.
                  Une utilisation plus régulière pourrait aider à mieux gérer votre budget.
                </AlertDescription>
              </Alert>
            )}
            
            {!hasSpikeUsage && ratio <= 2 && gpt4Percentage <= 50 && (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Bonne utilisation</AlertTitle>
                <AlertDescription>
                  Votre utilisation semble bien optimisée. Continuez comme ça !
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold">Conseils généraux</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Utilisez des modèles locaux quand possible pour les tâches simples</li>
                <li>Soyez précis dans vos instructions pour obtenir des réponses concises</li>
                <li>Limitez le contexte aux informations essentielles</li>
                <li>Utilisez le chunking intelligent pour les documents volumineux</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
