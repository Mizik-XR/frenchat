
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function GoogleAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processAuthCode = async () => {
      try {
        // Extraire le code d'autorisation de l'URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error("Aucun code d'autorisation reçu");
        }

        // Log l'URL actuelle et l'origine pour le debugging
        console.log("Origine actuelle:", window.location.origin);
        console.log("URL actuelle:", window.location.href);
        
        // Appeler la fonction Edge pour échanger le code contre des tokens
        const { error } = await supabase.functions.invoke('google-oauth', {
          body: { 
            code,
            redirectUrl: `${window.location.origin}/auth/google/callback`
          }
        });

        if (error) {
          throw error;
        }

        // Rediriger vers la page de configuration Google Drive
        toast({
          title: "Connexion réussie",
          description: "Votre compte Google Drive a été connecté avec succès"
        });
        
        navigate('/config/google-drive');
      } catch (err) {
        console.error("Erreur lors du traitement du callback Google:", err);
        setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue");
        
        toast({
          title: "Erreur de connexion",
          description: err instanceof Error ? err.message : "Une erreur est survenue lors de la connexion à Google Drive",
          variant: "destructive"
        });
        
        // Rediriger vers la page de configuration en cas d'erreur
        setTimeout(() => navigate('/config'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processAuthCode();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 mb-4 text-blue-500 animate-spin" />
              <h1 className="text-xl font-bold">Traitement de l'authentification Google Drive...</h1>
              <p className="mt-2 text-gray-500">Veuillez patienter pendant que nous établissons la connexion.</p>
            </>
          ) : error ? (
            <>
              <div className="p-3 mb-4 text-red-500 bg-red-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-red-700">Erreur d'authentification</h1>
              <p className="mt-2 text-gray-700">{error}</p>
              <p className="mt-4 text-sm text-gray-500">Redirection vers la page de configuration...</p>
            </>
          ) : (
            <>
              <div className="p-3 mb-4 text-green-500 bg-green-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-green-700">Authentification réussie</h1>
              <p className="mt-2 text-gray-700">Votre compte Google Drive a été connecté avec succès.</p>
              <p className="mt-4 text-sm text-gray-500">Redirection en cours...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
