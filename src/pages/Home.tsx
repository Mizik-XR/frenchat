
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, FolderOpen } from "lucide-react";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { useGoogleDriveFolders } from "@/hooks/useGoogleDriveFolders";

export default function Home() {
  const navigate = useNavigate();
  const { isConnected } = useGoogleDriveStatus();
  const { folders, isLoading, refreshFolders } = useGoogleDriveFolders();

  useEffect(() => {
    if (isConnected) {
      refreshFolders();
    }
  }, [isConnected, refreshFolders]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-3xl font-bold">Bienvenue sur FileChat</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Gérez et accédez à vos documents pour les utiliser dans vos conversations.
            </p>
            <Button onClick={() => navigate("/documents")}>
              Gérer les documents
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {isConnected
                ? `${folders.length} dossier(s) disponible(s)`
                : "Connectez votre compte Google Drive pour accéder à vos fichiers."}
            </p>
            <Button 
              onClick={() => navigate("/google-drive-config")}
              variant={isConnected ? "default" : "secondary"}
            >
              {isConnected ? "Gérer les dossiers" : "Connecter Google Drive"}
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
