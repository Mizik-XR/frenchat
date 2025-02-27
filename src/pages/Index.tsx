
import { useNavigate } from "react-router-dom";
import { Settings, MessageCircle, User, Database, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fonction pour logger l'état actuel
  console.log("Index page rendering, user state:", user ? "Logged in" : "Not logged in");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-200 p-4">
      <div className="max-w-4xl w-full">
        <Card className="w-full p-6 shadow-xl bg-white border-blue-500 border-2">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-600 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-blue-800 mb-2">
              DocuChatter
            </h1>
            {/* GIF d'animation remplaçant le texte d'introduction */}
            <div className="max-w-md mx-auto">
              <img 
                src="/welcome-animation.gif" 
                alt="Animation DocuChatter" 
                className="w-full rounded-lg shadow-md"
              />
            </div>
          </CardHeader>
          
          <CardContent className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all">
                <h2 className="text-xl font-semibold flex items-center mb-3 text-blue-700">
                  <Settings className="mr-2 h-6 w-6 text-blue-500" /> 
                  Configuration
                </h2>
                <p className="text-gray-700 mb-4">
                  Configurez vos accès aux API Google Drive et Microsoft Teams pour commencer à indexer vos documents.
                </p>
                <Button 
                  onClick={() => {
                    console.log("Navigating to /config");
                    navigate('/config');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Configurer les accès
                </Button>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all">
                <h2 className="text-xl font-semibold flex items-center mb-3 text-blue-700">
                  <MessageCircle className="mr-2 h-6 w-6 text-blue-500" /> 
                  Chat IA
                </h2>
                <p className="text-gray-700 mb-4">
                  Posez des questions à propos de vos documents et obtenez des réponses précises grâce à l'IA.
                </p>
                <Button 
                  onClick={() => {
                    console.log("Navigating to /chat");
                    navigate('/chat');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Accéder au Chat
                </Button>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all">
                <h2 className="text-xl font-semibold flex items-center mb-3 text-blue-700">
                  <Database className="mr-2 h-6 w-6 text-blue-500" /> 
                  Documents
                </h2>
                <p className="text-gray-700 mb-4">
                  Gérez vos documents indexés, ajoutez de nouveaux fichiers ou consultez les analyses existantes.
                </p>
                <Button 
                  onClick={() => {
                    console.log("Navigating to /documents");
                    navigate('/documents');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Gérer les documents
                </Button>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all">
                <h2 className="text-xl font-semibold flex items-center mb-3 text-blue-700">
                  <User className="mr-2 h-6 w-6 text-blue-500" /> 
                  Compte Utilisateur
                </h2>
                <p className="text-gray-700 mb-4">
                  {user 
                    ? "Vous êtes connecté. Gérez votre profil ou déconnectez-vous."
                    : "Connectez-vous ou créez un compte pour personnaliser votre expérience."}
                </p>
                <Button 
                  onClick={() => {
                    console.log("Navigating to /auth");
                    navigate('/auth');
                  }}
                  className={`w-full ${user ? "bg-white text-blue-600 border-blue-600 border" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                >
                  {user ? "Mon profil" : "Se connecter"}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              DocuChatter - Votre assistant documentaire propulsé par l'IA © 2023
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
