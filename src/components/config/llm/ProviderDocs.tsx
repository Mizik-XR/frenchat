
import { Button } from "@/components/ui/button";
import { LLMProvider } from "@/types/config";

interface ProviderDocsProps {
  provider: LLMProvider;
}

export const ProviderDocs = ({ provider }: ProviderDocsProps) => {
  return (
    <div className="mt-4 p-4 bg-primary/5 rounded-md">
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
  );
};
