
import { BrainCircuit, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ConfigHeaderProps {
  hasConfiguration: boolean;
}

export function ConfigHeader({ hasConfiguration }: ConfigHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-7 w-7 text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-900">Configuration de l'IA</h2>
        {hasConfiguration && (
          <Badge variant="success" className="ml-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Configuré
          </Badge>
        )}
      </div>
      <Button 
        variant="outline" 
        onClick={() => navigate("/config")}
        className="gap-2 hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>
    </div>
  );
}
