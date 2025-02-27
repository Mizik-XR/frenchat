
import { useNavigate } from "react-router-dom";
import { Settings, MessageCircle, User, Database, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
      <div className="max-w-4xl w-full">
        <Card className="w-full p-6 shadow-xl border-blue-200">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              DocuChatter
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Votre assistant IA pour analyser et discuter de vos documents. Indexez vos fichiers et posez des questions en langage naturel.
            </p>
          </CardHeader>
          
          <CardContent className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-xl font-semibold flex items-center mb-3">
                  <Settings className="mr-2 h-5 w-5 text-blue-500" /> 
                  Configuration
                </h2>
                <p className="text-gray-600 mb-4">
                  Configurez vos accès aux API Google Drive et Microsoft Teams pour commencer à indexer vos documents.
                </p>
                <Button 
                  onClick={() => navigate('/config')}
                  className="w-full"
                  variant="default"
                >
                  Configurer les accès
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-xl font-semibold flex items-center mb-3">
                  <MessageCircle className="mr-2 h-5 w-5 text-blue-500" /> 
                  Chat IA
                </h2>
                <p className="text-gray-600 mb-4">
                  Posez des questions à propos de vos documents et obtenez des réponses précises grâce à l'IA.
                </p>
                <Button 
                  onClick={() => navigate('/chat')}
                  className="w-full"
                  variant="default"
                >
                  Accéder au Chat
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-xl font-semibold flex items-center mb-3">
                  <Database className="mr-2 h-5 w-5 text-blue-500" /> 
                  Documents
                </h2>
                <p className="text-gray-600 mb-4">
                  Gérez vos documents indexés, ajoutez de nouveaux fichiers ou consultez les analyses existantes.
                </p>
                <Button 
                  onClick={() => navigate('/documents')}
                  className="w-full"
                  variant="default"
                >
                  Gérer les documents
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-xl font-semibold flex items-center mb-3">
                  <User className="mr-2 h-5 w-5 text-blue-500" /> 
                  Compte Utilisateur
                </h2>
                <p className="text-gray-600 mb-4">
                  {user 
                    ? "Vous êtes connecté. Gérez votre profil ou déconnectez-vous."
                    : "Connectez-vous ou créez un compte pour personnaliser votre expérience."}
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full"
                  variant={user ? "outline" : "default"}
                >
                  {user ? "Mon profil" : "Se connecter"}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              DocuChatter - Votre assistant documentaire propulsé par l'IA © 2023
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
