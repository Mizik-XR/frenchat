
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
        Unable to load existing configurations. Offline mode activated.
        Keys will be stored locally until the issue is resolved.
        <div className="mt-2 text-xs">
          Details: {errorMessage}
        </div>
      </AlertDescription>
    </Alert>
  );
};
