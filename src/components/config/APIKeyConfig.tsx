
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface APIKeyConfigProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
}

export const APIKeyConfig: React.FC<APIKeyConfigProps> = ({ provider, value, onChange }) => {
  const [showKey, setShowKey] = useState(false);

  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={`api-key-${provider.toLowerCase()}`} className="text-sm font-medium">
          Clé API {provider}
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleShowKey}
          className="h-8 px-2"
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <Input
        id={`api-key-${provider.toLowerCase()}`}
        type={showKey ? "text" : "password"}
        placeholder={`Entrez votre clé API ${provider}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
      />
      <p className="text-xs text-muted-foreground">
        Votre clé API est stockée de manière sécurisée et ne quitte jamais votre navigateur.
      </p>
    </div>
  );
};
