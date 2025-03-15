
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, HardDrive, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoogleDriveStatus } from '@/hooks/useGoogleDriveStatus';
import { useToast } from '@/hooks/use-toast';

export function DocumentProviderSelector() {
  const navigate = useNavigate();
  const { isConnected } = useGoogleDriveStatus();
  const { toast } = useToast();
  const [showComparison, setShowComparison] = useState(false);
  
  const handleGoogleDriveSetup = () => {
    navigate("/google-drive-config");
  };
  
  const handleMicrosoftTeamsSetup = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "L'intégration avec Microsoft Teams sera bientôt disponible",
    });
  };
  
  const handleDirectUpload = () => {
    navigate("/documents/upload");
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`cursor-pointer border-2 hover:shadow-md transition-all duration-200 ${isConnected ? 'border-green-200 bg-green-50/50' : 'hover:border-blue-200'}`}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center h-full">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-3 ${isConnected ? 'bg-green-100' : 'bg-blue-100'}`}>
                <HardDrive className={`h-6 w-6 ${isConnected ? 'text-green-600' : 'text-blue-600'}`} />
              </div>
              <h3 className="font-medium mb-2">Google Drive</h3>
              <p className="text-sm text-gray-500 mb-4">
                {isConnected 
                  ? "Connecté - Prêt à indexer vos documents" 
                  : "Connectez-vous pour accéder à vos fichiers Google Drive"}
              </p>
              <Button 
                className="mt-auto w-full"
                variant={isConnected ? "outline" : "default"}
                onClick={handleGoogleDriveSetup}
              >
                {isConnected ? "Gérer la connexion" : "Connecter Drive"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer border-2 hover:border-purple-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 flex items-center justify-center rounded-full mb-3 bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.3255 2.65811C7.99738 2.65811 5.29077 5.36472 5.29077 8.69287V16.7969C5.29077 18.461 6.64672 19.8169 8.31077 19.8169C9.97483 19.8169 11.3308 18.461 11.3308 16.7969V10.7023C11.3308 9.87002 10.6631 9.2023 9.83077 9.2023C9.00738 9.2023 8.33077 9.86415 8.33077 10.7023V16.4544H6.83077V10.6965C6.83077 9.03829 8.17895 7.69011 9.83718 7.69011C11.4954 7.69011 12.8436 9.03829 12.8436 10.6965V16.7852C12.8436 19.2873 10.8129 21.318 8.31077 21.318C5.80865 21.318 3.77795 19.2873 3.77795 16.7852V8.69287C3.77795 4.53472 7.16738 1.14529 11.3255 1.14529C15.4837 1.14529 18.8732 4.53472 18.8732 8.69287V16.4487H17.3732V8.69287C17.3732 5.36472 14.6666 2.65811 11.3384 2.65811H11.3255Z" fill="currentColor"/>
                  <path d="M13.5908 16.4139H16.6237C18.2877 16.4139 19.6437 17.7698 19.6437 19.4339C19.6437 21.0979 18.2877 22.4539 16.6237 22.4539C14.9596 22.4539 13.6037 21.0979 13.6037 19.4339V16.4139H13.5908ZM15.1037 17.9139V19.4339C15.1037 20.2821 15.7714 20.9539 16.6237 20.9539C17.476 20.9539 18.1437 20.2821 18.1437 19.4339C18.1437 18.5856 17.476 17.9139 16.6237 17.9139H15.1037Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Microsoft Teams</h3>
              <p className="text-sm text-gray-500 mb-4">
                Connectez-vous pour accéder aux fichiers et conversations de vos équipes
              </p>
              <Button 
                className="mt-auto w-full"
                variant="outline"
                onClick={handleMicrosoftTeamsSetup}
              >
                Prochainement
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer border-2 hover:border-green-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 flex items-center justify-center rounded-full mb-3 bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Téléchargement Direct</h3>
              <p className="text-sm text-gray-500 mb-4">
                Importez des fichiers directement depuis votre ordinateur
              </p>
              <Button 
                className="mt-auto w-full"
                variant="outline"
                onClick={handleDirectUpload}
              >
                Importer des fichiers
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Button 
          variant="ghost" 
          className="text-sm"
          onClick={() => setShowComparison(!showComparison)}
        >
          <Scale className="h-4 w-4 mr-2" />
          {showComparison ? "Masquer" : "Afficher"} la comparaison des sources
        </Button>
        
        {showComparison && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-left font-medium text-gray-600">Fonctionnalité</th>
                  <th className="p-3 text-center font-medium text-gray-600">Google Drive</th>
                  <th className="p-3 text-center font-medium text-gray-600">Microsoft Teams</th>
                  <th className="p-3 text-center font-medium text-gray-600">Téléchargement</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Mise à jour auto</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-gray-400">✗</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Indexation récursive</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-gray-400">✗</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Édition collaborative</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-gray-400">✗</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Partage avec équipe</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                  <td className="p-3 text-center text-gray-400">✗</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Confidentialité maximale</td>
                  <td className="p-3 text-center text-gray-400">✗</td>
                  <td className="p-3 text-center text-gray-400">✗</td>
                  <td className="p-3 text-center text-green-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
