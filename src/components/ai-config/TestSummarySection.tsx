
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAIConfigContext } from "./AIConfigProvider";

interface TestSummarySectionProps {
  isLoading: boolean;
  onTestSummary: () => Promise<void>;
}

export const TestSummarySection = ({ isLoading, onTestSummary }: TestSummarySectionProps) => {
  const { testText, summary, setTestText } = useAIConfigContext();

  return (
    <div className="space-y-4">
      <div>
        <Label>Texte de test</Label>
        <Input
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="mt-2"
          placeholder="Entrez un texte à résumer..."
        />
      </div>

      <Button 
        onClick={onTestSummary}
        disabled={isLoading || !testText}
        variant="outline"
      >
        Tester le résumé
      </Button>

      {summary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <Label>Résumé généré :</Label>
          <p className="mt-2 text-sm">{summary}</p>
        </div>
      )}
    </div>
  );
};
