
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { LLMProvider } from "@/types/config";

interface ProviderDocsProps {
  provider: LLMProvider;
}

export const ProviderDocs = ({ provider }: ProviderDocsProps) => {
  return (
    <div className="mt-4 space-y-4">
      {provider.isLocal && provider.setupInstructions && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <h4 className="font-medium mb-2">Instructions d'installation :</h4>
            <pre className="whitespace-pre-wrap text-sm bg-secondary/20 p-2 rounded">
              {provider.setupInstructions}
            </pre>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="p-4 bg-primary/5 rounded-md">
        <h3 className="text-sm font-medium text-primary mb-2">
          Documentation {provider.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {provider.description}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(provider.docsUrl, '_blank')}
          className="w-full"
        >
          Voir la documentation
        </Button>
      </div>
    </div>
  );
};
