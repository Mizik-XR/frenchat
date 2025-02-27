
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleDriveAlertProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const GoogleDriveAlert = ({ onCancel, onConfirm }: GoogleDriveAlertProps) => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Confirmation d'indexation</AlertTitle>
      <AlertDescription className="text-amber-700 mt-2">
        <p className="mb-3">
          L'indexation va scanner et analyser tous les fichiers du dossier sélectionné.
          Cette opération peut prendre plusieurs minutes selon le nombre de fichiers.
        </p>
        <p className="mb-4">
          Les fichiers seront accessibles uniquement par vous et utilisés pour la recherche IA.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button size="sm" onClick={onConfirm}>
            Démarrer l'indexation
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
