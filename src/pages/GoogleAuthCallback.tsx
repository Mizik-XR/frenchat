
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      if (error) {
        console.error("Erreur d'authentification Google:", error);
        toast({
          title: "Erreur d'authentification",
          description: "L'authentification avec Google Drive a échoué",
          variant: "destructive",
        });
        navigate('/config');
        return;
      }

      if (!code) {
        console.error("Code d'autorisation manquant");
        toast({
          title: "Erreur",
          description: "Code d'autorisation manquant",
          variant: "destructive",
        });
        navigate('/config');
        return;
      }

      if (!user) {
        console.error("Utilisateur non connecté");
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour utiliser cette fonctionnalité",
          variant: "destructive",
        });
        navigate('/config');
        return;
      }

      try {
        console.log("Démarrage de l'échange du code d'autorisation...");
        const { error: functionError } = await supabase.functions.invoke(
          'google-oauth',
          {
            body: { code },
            headers: { 'x-user-id': user.id }
          }
        );

        if (functionError) {
          console.error("Erreur fonction Edge:", functionError);
          throw functionError;
        }

        console.log('Configuration Google Drive réussie');
        toast({
          title: "Succès",
          description: "Google Drive connecté avec succès",
        });
        
        navigate('/config');
      } catch (err) {
        console.error("Erreur lors de l'échange du code:", err);
        toast({
          title: "Erreur",
          description: "Erreur lors de la connexion à Google Drive",
          variant: "destructive",
        });
        navigate('/config');
      }
    };

    handleCallback();
  }, [searchParams, navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Configuration de Google Drive en cours...
        </h2>
        <p className="text-gray-500">
          Veuillez patienter pendant que nous finalisons la configuration.
        </p>
      </div>
    </div>
  );
}
