
import React from "react";
import { Button } from "@/components/ui/button";
import { useGoogleDriveStatus, getRedirectUrl } from "@/hooks/useGoogleDriveStatus";
import { Check, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useGoogleDrive } from "./useGoogleDrive";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const GoogleDriveButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected, isChecking, reconnectGoogleDrive } = useGoogleDriveStatus();
  const { isConnecting, initiateGoogleAuth } = useGoogleDrive(user, async () => {
    toast({
      title: "Connexion réussie",
      description: "Google Drive a été connecté avec succès",
    });

    // Déclencher l'indexation des documents
    if (user) {
      try {
        toast({
          title: "Indexation en cours",
          description: "Vos documents Google Drive sont en cours d'indexation...",
        });

        const { error } = await supabase.functions.invoke('index-google-drive', {
          body: { user_id: user.id }
        });

        if (error) throw error;

        toast({
          title: "Indexation terminée",
          description: "Vos documents sont maintenant disponibles pour la recherche",
        });
      } catch (error) {
        console.error('Erreur lors de l\'indexation:', error);
        toast({
          title: "Erreur d'indexation",
          description: "Une erreur est survenue lors de l'indexation de vos documents",
          variant: "destructive",
        });
      }
    }
  });

  const handleNavigateToChat = () => {
    navigate("/chat");
  };

  // Afficher les informations de debug en développement
  React.useEffect(() => {
    console.log("Environnement:", process.env.NODE_ENV);
    console.log("URL de redirection OAuth:", getRedirectUrl());
  }, []);

  const handleGoogleAuth = async () => {
    // Utilise la reconnexion de useGoogleDriveStatus qui gère les URLs dynamiquement
    await reconnectGoogleDrive();
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <Button className="w-full" variant="outline" disabled>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Google Drive connecté
        </Button>
        <p className="text-sm text-muted-foreground">
          Votre compte Google Drive est correctement connecté et vos documents sont indexés.
        </p>
        <Button 
          className="w-full"
          onClick={handleNavigateToChat}
        >
          Aller au Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGoogleAuth}
        disabled={isConnecting || isChecking}
        className="w-full"
      >
        {isConnecting || isChecking ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        {isConnecting || isChecking ? 'Connexion en cours...' : 'Connecter Google Drive'}
      </Button>
      <p className="text-sm text-muted-foreground">
        Autorisez l'accès à Google Drive pour pouvoir indexer et rechercher dans vos documents.
      </p>
    </div>
  );
};
