
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ServerIcon, CloudIcon } from "lucide-react";

interface ModelSourceSelectorProps {
  modelSource: 'cloud' | 'local';
  onModelSourceChange: (source: 'cloud' | 'local') => void;
}

export const ModelSourceSelector = ({ 
  modelSource, 
  onModelSourceChange 
}: ModelSourceSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Source des modèles</Label>
      <RadioGroup 
        defaultValue={modelSource} 
        onValueChange={(v) => onModelSourceChange(v as 'cloud' | 'local')}
        className="flex gap-4 pb-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="local" id="model-local" />
          <Label htmlFor="model-local" className="flex items-center cursor-pointer">
            <ServerIcon className="h-4 w-4 mr-1 text-purple-600" />
            <span>Local</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cloud" id="model-cloud" />
          <Label htmlFor="model-cloud" className="flex items-center cursor-pointer">
            <CloudIcon className="h-4 w-4 mr-1 text-blue-600" />
            <span>IA propriétaire</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
