import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { handleProfileQuery, APP_STATE } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';

import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Rediriger vers la page précédente ou par défaut
          const redirectTo = location.state?.from?.pathname || '/chat';
          navigate(redirectTo, { replace: true });
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate, location]);
  
  // Gérer les paramètres d'URL pour la récupération de mot de passe ou la confirmation d'email
  useEffect(() => {
    const handleAuthParams = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      
      // Traiter les paramètres d'authentification
      if (
        searchParams.has('access_token') || 
        searchParams.has('refresh_token') || 
        searchParams.has('error_description') || 
        searchParams.has('type')
      ) {
        setIsProcessingOAuth(true);
        
        try {
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            throw error;
          }
          
          if (data.user) {
            // Si c'est une inscription, créer un profil utilisateur
            if (searchParams.get('type') === 'SIGNED_UP') {
              await handleProfileQuery(data.user.id);
            }
            
            // Rediriger vers l'application
            navigate('/chat', { replace: true });
          }
        } catch (error: any) {
          console.error("Erreur OAuth:", error);
          setError(`Erreur d'authentification: ${error.message}`);
        } finally {
          setIsProcessingOAuth(false);
        }
      }
    };
    
    handleAuthParams();
  }, [navigate]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthContainer>
      <Card className="w-[350px]">
        <Card className="w-full">
          <div className="flex justify-center space-x-4">
            <Button
              variant={mode === 'signin' ? 'default' : 'secondary'}
              onClick={() => setMode('signin')}
            >
              Se connecter
            </Button>
            <Button
              variant={mode === 'signup' ? 'default' : 'secondary'}
              onClick={() => setMode('signup')}
            >
              S'inscrire
            </Button>
          </div>
        </Card>
        {mode === 'signin' ? <SignInForm /> : <SignUpForm />}
        {error && (
          <Card className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700">
            {error}
          </Card>
        )}
        {isProcessingOAuth && (
          <Card className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700">
            Traitement de l'authentification...
          </Card>
        )}
      </Card>
      <Toaster />
    </AuthContainer>
  );
}
