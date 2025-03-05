
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Coins, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserCreditUsage } from '@/hooks/user/useUserCreditUsage';

export const UserCreditPanel: React.FC = () => {
  const { creditUsage, isLoading, fetchUserCreditUsage, addCredits } = useUserCreditUsage();
  
  const handleRefresh = () => {
    fetchUserCreditUsage();
  };
  
  const handleAddCredit = () => {
    // Pour l'instant, ajouter un crédit fixe pour démonstration
    // En production, intégrer une solution de paiement
    addCredits(5);
  };
  
  // Calculer le pourcentage restant
  const creditPercentage = creditUsage.creditBalance > 0 
    ? Math.min(100, Math.max(0, (creditUsage.remainingCredit / creditUsage.creditBalance) * 100))
    : 0;
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-500" />
          Vos Crédits IA
        </CardTitle>
        <CardDescription>
          Gérez votre consommation d'API et vos crédits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {creditUsage.isOutOfCredit && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous n'avez plus de crédit disponible. Les fonctionnalités d'IA cloud sont limitées.
            </AlertDescription>
          </Alert>
        )}
        
        {creditUsage.hasLowCredit && !creditUsage.isOutOfCredit && (
          <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Votre crédit est presque épuisé. Pensez à recharger votre compte.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Solde disponible</span>
            <span className="font-bold text-lg">
              ${creditUsage.remainingCredit.toFixed(2)}
            </span>
          </div>
          <Progress value={creditPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Utilisé: ${creditUsage.estimatedCost.toFixed(2)}</span>
            <span>Total: ${creditUsage.creditBalance.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Statistiques d'utilisation</h4>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span className="text-gray-600">Tokens utilisés:</span>
              <span>{creditUsage.tokenUsage.toLocaleString()}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Requêtes totales:</span>
              <span>{creditUsage.totalUsage}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Coût estimé:</span>
              <span>${creditUsage.estimatedCost.toFixed(4)}</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
        <Button onClick={handleAddCredit} disabled={isLoading}>
          Ajouter des crédits
        </Button>
      </CardFooter>
    </Card>
  );
};
