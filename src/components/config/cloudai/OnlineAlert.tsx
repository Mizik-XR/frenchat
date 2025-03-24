
import React from '@/core/reactInstance';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const OnlineAlert = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Vos clés API sont stockées de manière sécurisée et chiffrées. 
        Configurez au moins un fournisseur pour utiliser les fonctionnalités d'IA.
      </AlertDescription>
    </Alert>
  );
};
