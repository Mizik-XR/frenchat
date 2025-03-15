
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface OfflineAlertProps {
  errorMessage: string;
}

export const OfflineAlert = ({ errorMessage }: OfflineAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Impossible de charger les configurations existantes. Mode hors-ligne activé. 
        Les clés seront stockées localement jusqu'à la résolution du problème.
        <div className="mt-2 text-xs">
          Détails: {errorMessage}
        </div>
      </AlertDescription>
    </Alert>
  );
};
