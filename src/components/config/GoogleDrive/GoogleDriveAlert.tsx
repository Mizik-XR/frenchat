
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface GoogleDriveAlertProps {
  isConnected: boolean;
}

export const GoogleDriveAlert = ({ isConnected }: GoogleDriveAlertProps) => {
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration Google Drive</AlertTitle>
      <AlertDescription>
        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Votre compte Google Drive est connecté
          </div>
        ) : (
          "Connectez votre Google Drive en un clic ! Plus besoin de saisir des clés API, autorisez simplement l'accès à vos documents."
        )}
      </AlertDescription>
    </Alert>
  );
};
