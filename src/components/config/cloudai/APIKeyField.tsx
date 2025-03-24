
import React, { useState } from '@/core/reactInstance';
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceType } from "@/types/config";

interface APIKeyFieldProps {
  provider: string;
  apiKey: string;
  placeholder: string;
  isSubmitting: boolean;
  onApiKeyChange: (value: string) => void;
  onSave: () => void;
}

export const APIKeyField = ({ 
  provider, 
  apiKey, 
  placeholder, 
  isSubmitting, 
  onApiKeyChange, 
  onSave 
}: APIKeyFieldProps) => {
  const [showKey, setShowKey] = useState(false);

  const toggleShowKey = () => {
    setShowKey(prev => !prev);
  };

  return (
    <div className="flex gap-4 relative">
      <div className="flex-1 relative">
        <Input
          type={showKey ? "text" : "password"}
          placeholder={placeholder}
          value={apiKey || ''}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="w-full pr-10"
          aria-label={`${provider} API Key`}
        />
        <button
          type="button"
          onClick={toggleShowKey}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label={showKey ? "Masquer la clé" : "Afficher la clé"}
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Button 
        onClick={onSave}
        disabled={isSubmitting || !apiKey}
      >
        {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </div>
  );
};
