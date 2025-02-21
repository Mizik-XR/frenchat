
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-6 max-w-lg">
        <Settings className="w-16 h-16 mx-auto text-gray-400" />
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue sur DocuChatter
        </h1>
        <p className="text-gray-600">
          Pour commencer, configurez vos accès aux API Google Drive et Microsoft Teams.
        </p>
        <Button 
          onClick={() => navigate('/config')}
          size="lg"
          className="w-full sm:w-auto"
        >
          Configurer les API
        </Button>
      </div>
    </div>
  );
}
