
import { ImportMethodSelector, ImportMethod } from "../ImportMethod/ImportMethodSelector";

interface SourcesStepProps {
  selectedMethod: ImportMethod;
  onMethodChange: (method: ImportMethod) => void;
  onNavigate: (path: string) => void;
}

export const SourcesStep = ({ selectedMethod, onMethodChange, onNavigate }: SourcesStepProps) => {
  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="text-xl font-semibold mb-4">Sources de données</h2>
      <ImportMethodSelector
        selectedMethod={selectedMethod}
        onMethodChange={onMethodChange}
        onNavigate={onNavigate}
      />
    </div>
  );
};
