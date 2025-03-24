
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState, useEffect  } from '@/core/reactInstance';
import { toast } from "@/hooks/use-toast";
import type { AIModel } from "../../types";

interface ApiKeyFieldProps {
  model: AIModel;
  onValueChange: (field: string, value: string) => void;
  apiKeyState: string;
  setApiKeyState: (value: string) => void;
}

export function ApiKeyField({ model, onValueChange, apiKeyState, setApiKeyState }: ApiKeyFieldProps) {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [visibilityTimer, setVisibilityTimer] = useState<NodeJS.Timeout | null>(null);

  // Masquer automatiquement la clé API après un délai (sécurité améliorée)
  useEffect(() => {
    if (apiKeyVisible) {
      const timer = setTimeout(() => {
        setApiKeyVisible(false);
        toast({
          title: "Clé masquée",
          description: "La clé API a été automatiquement masquée pour des raisons de sécurité",
          variant: "default",
        });
      }, 30000); // 30 secondes
      
      setVisibilityTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [apiKeyVisible]);

  const toggleApiKeyVisibility = () => {
    // Si on masque la clé, annuler le timer
    if (apiKeyVisible && visibilityTimer) {
      clearTimeout(visibilityTimer);
      setVisibilityTimer(null);
    }
    
    setApiKeyVisible(!apiKeyVisible);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKeyState(value);
    onValueChange('apiKey', value);
  };

  // Validation basique des clés API selon le format
  const validateApiKey = (key: string): boolean => {
    if (!key) return false;
    
    // Patterns basiques pour les différents types de clés API
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{32,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9]{32,}$/,
      perplexity: /^pplx-[a-zA-Z0-9]{32,}$/,
      huggingface: /^hf_[a-zA-Z0-9]{32,}$/,
      // Motif générique pour les autres
      generic: /^[a-zA-Z0-9_\-]{16,}$/
    };
    
    // Vérifier si la clé correspond à l'un des motifs
    return Object.values(patterns).some(pattern => pattern.test(key));
  };

  return (
    <div className="space-y-2">
      <Label className="text-gray-700 flex items-center gap-2">
        Clé API
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Clé API requise pour utiliser ce modèle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <div className="relative">
        <Input 
          type={apiKeyVisible ? "text" : "password"}
          placeholder="sk-..."
          className={`w-full font-mono text-base bg-white pr-24 ${apiKeyState && !validateApiKey(apiKeyState) ? 'border-red-400' : ''}`}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          value={apiKeyState}
          // Plus d'attributs sécurisés
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          aria-label="API Key Input"
        />
        <button
          type="button"
          onClick={toggleApiKeyVisibility}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 rounded flex items-center gap-1"
        >
          {apiKeyVisible ? (
            <>
              <EyeOff className="h-3 w-3" /> Masquer
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" /> Afficher
            </>
          )}
        </button>
      </div>
      {apiKeyState && !validateApiKey(apiKeyState) && (
        <p className="text-red-500 text-xs mt-1">
          Format de clé API potentiellement invalide
        </p>
      )}
      {apiKeyVisible && (
        <p className="text-amber-600 text-xs mt-1">
          La clé sera automatiquement masquée après 30 secondes
        </p>
      )}
      {model.docsUrl && (
        <a 
          href={model.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline inline-block mt-1"
        >
          Obtenir une clé API
        </a>
      )}
    </div>
  );
}
