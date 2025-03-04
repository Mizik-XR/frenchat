
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConfigStatus {
  googleDrive: boolean;
  teams: boolean;
  llm: boolean;
  image: boolean;
}

interface SummaryStepProps {
  configStatus: ConfigStatus;
  onFinish: () => void;
}

export const SummaryStep = ({ configStatus, onFinish }: SummaryStepProps) => {
  const navigate = useNavigate();
  
  const handleSkipToChat = () => {
    navigate("/chat");
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Résumé de votre configuration</h2>
        <p className="text-gray-600">
          Vérifiez l'état de vos configurations avant de commencer à utiliser l'application
        </p>
      </div>
      
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-medium">Google Drive</span>
          <StatusIcon isConfigured={configStatus.googleDrive} />
        </div>
        
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-medium">Microsoft Teams</span>
          <StatusIcon isConfigured={configStatus.teams} />
        </div>
        
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-medium">Modèle de langage</span>
          <StatusIcon isConfigured={configStatus.llm} />
        </div>
        
        <div className="flex items-center justify-between p-3">
          <span className="font-medium">Génération d'images</span>
          <StatusIcon isConfigured={configStatus.image} />
        </div>
      </div>
      
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4 mt-8">
        <Button 
          onClick={onFinish} 
          className="w-full md:w-auto"
        >
          Terminer la configuration
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleSkipToChat}
          className="w-full md:w-auto"
        >
          Ignorer et aller au chat
        </Button>
      </div>
    </div>
  );
};

const StatusIcon = ({ isConfigured }: { isConfigured: boolean }) => {
  return isConfigured ? (
    <span className="flex items-center text-green-600">
      <CheckIcon className="h-5 w-5 mr-1" />
      Configuré
    </span>
  ) : (
    <span className="flex items-center text-amber-600">
      <XIcon className="h-5 w-5 mr-1" />
      Non configuré
    </span>
  );
};
