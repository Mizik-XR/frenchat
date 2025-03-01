
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, Server } from "lucide-react";

interface ServiceStatusAlertProps {
  serviceAvailable: boolean | null;
}

export function ServiceStatusAlert({ serviceAvailable }: ServiceStatusAlertProps) {
  if (serviceAvailable === null) return null;
  
  return (
    <Alert 
      className={serviceAvailable 
        ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" 
        : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"}
    >
      <Server className="h-4 w-4" />
      <AlertTitle>
        {serviceAvailable 
          ? "Service IA local détecté" 
          : "Service IA local non disponible"}
      </AlertTitle>
      <AlertDescription>
        {serviceAvailable 
          ? "Votre système est correctement configuré pour utiliser l'IA en local." 
          : "Le service n'est pas démarré ou n'est pas accessible. Vérifiez votre configuration ou téléchargez le Compagnon IA."}
      </AlertDescription>
    </Alert>
  );
}
