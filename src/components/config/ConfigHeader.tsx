
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ConfigHeaderProps {
  onBack: () => void;
}

export function ConfigHeader({ onBack }: ConfigHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold text-gray-900">Configuration des API</h1>
    </div>
  );
}
