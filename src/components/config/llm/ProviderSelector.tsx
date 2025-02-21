
import { ServiceType } from "@/types/config";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLM_PROVIDERS } from "./constants";

interface ProviderSelectorProps {
  value: ServiceType;
  onValueChange: (value: ServiceType) => void;
}

export const ProviderSelector = ({ value, onValueChange }: ProviderSelectorProps) => {
  return (
    <div>
      <Label className="text-gray-700">Fournisseur LLM</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Choisissez un fournisseur" />
        </SelectTrigger>
        <SelectContent>
          {LLM_PROVIDERS.map((provider) => (
            <SelectItem 
              key={provider.id} 
              value={provider.id}
              className="py-3"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{provider.name}</span>
                <span className="text-xs text-gray-500">{provider.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
