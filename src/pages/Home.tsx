
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, FolderOpen, Bot, Database, BarChart } from "lucide-react";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { useGoogleDriveFolders } from "@/hooks/useGoogleDriveFolders";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { OnboardingIntro } from "@/components/onboarding/OnboardingIntro";

export default function Home() {
  const navigate = useNavigate();
  const { isConnected } = useGoogleDriveStatus();
  const { folders, isLoading, refreshFolders } = useGoogleDriveFolders();
  const { capabilities } = useSystemCapabilities();

  useEffect(() => {
    if (isConnected) {
      refreshFolders();
    }
  }, [isConnected, refreshFolders]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <OnboardingIntro />
      
      <h1 className="text-3xl font-bold mb-6">Bienvenue sur FileChat</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              Intelligence Artificielle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              {capabilities.localAIReady 
                ? "Votre système est compatible avec l'IA locale"
                : "Configurez votre modèle d'IA préféré pour des réponses précises"}
            </p>
            <Button 
              onClick={() => navigate("/config")} 
              variant="outline"
              className="w-full"
            >
              Configuration de l'IA
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Gérez et accédez à vos documents pour les utiliser dans vos conversations.
            </p>
            <Button 
              onClick={() => navigate("/documents")}
              className="w-full"
            >
              Gérer les documents
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-purple-500" />
              Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              {isConnected
                ? `${folders.length} dossier(s) disponible(s)`
                : "Connectez votre compte Google Drive pour accéder à vos fichiers."}
            </p>
            <Button 
              onClick={() => navigate("/google-drive-config")}
              variant={isConnected ? "outline" : "default"}
              className="w-full"
            >
              {isConnected ? "Gérer les dossiers" : "Connecter Google Drive"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Database className="h-5 w-5 text-blue-600" />
              Indexation complète Drive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Indexez l'intégralité de votre Google Drive pour des réponses basées sur tous vos documents.
            </p>
            <Button 
              onClick={() => navigate("/documents?tab=full-drive")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Configurer l'indexation complète
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-amber-500" />
              Statistiques et utilisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Suivez votre utilisation, vos crédits API et la performance de vos modèles d'IA.
            </p>
            <Button 
              onClick={() => navigate("/config?tab=usage")}
              variant="outline"
              className="w-full"
            >
              Voir les statistiques
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          onClick={() => navigate("/chat")}
          size="lg"
          className="px-8"
        >
          Aller au chat
        </Button>
      </div>
    </div>
  );
}
