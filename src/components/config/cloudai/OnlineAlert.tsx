
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const OnlineAlert = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Your API keys are stored securely and encrypted.
        Configure at least one provider to use AI features.
      </AlertDescription>
    </Alert>
  );
};
