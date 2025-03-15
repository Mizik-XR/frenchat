
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, RefreshCw } from 'lucide-react';

export interface UserCreditPanelProps {
  credits?: number;
  remainingQuota?: number;
  isLoading?: boolean;
  onAddCredits?: () => void;
  onRefresh?: () => void;
}

export const UserCreditPanel = ({ 
  credits = 0, 
  remainingQuota = 1000, 
  isLoading = false,
  onAddCredits,
  onRefresh
}: UserCreditPanelProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-500" />
          Crédits et Quota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Crédits</p>
              <p className="text-2xl font-semibold">{isLoading ? '...' : credits}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Quota restant</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-semibold">{isLoading ? '...' : remainingQuota}</p>
                <p className="text-sm text-muted-foreground mb-1">tokens</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col w-full gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button 
              onClick={onAddCredits}
              disabled={isLoading}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ajouter des crédits
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
