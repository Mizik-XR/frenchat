
import { useNavigate } from "react-router-dom";
import { Settings, MessageCircle, User, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="max-w-lg w-full p-8 shadow-lg">
        <div className="text-center space-y-6">
          <Settings className="w-16 h-16 mx-auto text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue sur DocuChatter
          </h1>
          <p className="text-gray-600">
            {user 
              ? "Vous êtes connecté. Configurez vos accès ou accédez au chat."
              : "Pour commencer, configurez vos accès aux API Google Drive et Microsoft Teams."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/config')}
              size="lg"
              className="w-full sm:w-auto"
              variant="default"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurer les API
            </Button>
            <Button 
              onClick={() => navigate('/chat')}
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Accéder au Chat
            </Button>
            <Button 
              onClick={() => navigate('/documents')}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Database className="mr-2 h-4 w-4" />
              Documents
            </Button>
            {!user && (
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <User className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
