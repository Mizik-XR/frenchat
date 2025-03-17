
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, handleProfileQuery, APP_STATE } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { useAuthForms } from '@/hooks/useAuthForms';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Auth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(APP_STATE.isOfflineMode);
  const location = useLocation();
  const authForms = useAuthForms();
  
  // Get selected tab from navigation state
  const defaultTab = location.state?.tab || 'signin';

  useEffect(() => {
    console.log("Auth component initializing");
    
    // Vérifier si on est en mode hors ligne
    if (APP_STATE.isOfflineMode) {
      setOfflineMode(true);
      setLoading(false);
      setError("Application en mode hors ligne. L'authentification n'est pas disponible.");
      console.log("Mode hors ligne détecté dans Auth.tsx");
      return;
    }
    
    const checkSession = async () => {
      try {
        if (!supabase) {
          throw new Error("Client Supabase non disponible. Vérifiez votre connexion Internet.");
        }
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error retrieving session:', error);
          setError('Une erreur est survenue lors de la vérification de votre session.');
          toast({
            title: "Erreur d'authentification",
            description: "Problème de connexion avec le serveur. Veuillez réessayer.",
            variant: "destructive",
          });
        }
        setSession(currentSession);
      } catch (error) {
        console.error('Error in checkSession:', error);
        setError('Une erreur inattendue est survenue.');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Ajouter un gestionnaire pour mode hors ligne
    const handleOfflineChange = () => {
      setOfflineMode(APP_STATE.isOfflineMode);
      if (APP_STATE.isOfflineMode) {
        setError("Application en mode hors ligne. L'authentification n'est pas disponible.");
      }
    };
    
    // Écouteur d'événement pour les changements de mode hors ligne
    window.addEventListener('storage', (e) => {
      if (e.key === 'OFFLINE_MODE') {
        handleOfflineChange();
      }
    });

    // Ne configurer l'écouteur de changement d'état d'authentification que si Supabase est disponible
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (supabase) {
      const { data: authData } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed", _event, session);
        setSession(session);
        
        // Si user vient de s'inscrire ou de se connecter, vérifier les erreurs de base de données
        if (session && (_event === 'SIGNED_IN' || _event === 'SIGNED_UP')) {
          handleProfileQuery(session.user.id)
            .then(({ error }) => {
              if (error) {
                console.warn("Problème de profil détecté, mais continuation avec la session:", error);
                toast({
                  title: "Avertissement",
                  description: "Votre profil a été initialisé avec des valeurs par défaut.",
                  duration: 5000,
                });
              }
            });
        }
      });
      
      subscription = authData.subscription;
    }

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleOfflineChange);
    };
  }, []);

  // Use redirect path from state, or default to home
  const redirectTo = location.state?.from || '/';
  console.log("Redirection path if authenticated:", redirectTo);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  // If user is authenticated, redirect to requested page or home
  if (session) {
    console.log("User is authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <AuthContainer>
      {offlineMode && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Mode Hors Ligne</AlertTitle>
          <AlertDescription>
            L'application fonctionne en mode hors ligne. L'authentification n'est pas disponible.
            <br />
            <button 
              className="text-blue-600 hover:text-blue-800 underline mt-2"
              onClick={() => {
                APP_STATE.setOfflineMode(false);
                setOfflineMode(false);
                setError(null);
                window.location.reload();
              }}
            >
              Tenter de se reconnecter
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      {!offlineMode && (
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="pb-0">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <CardContent className="pt-6">
                  <SignInForm 
                    loading={authForms.isLoading}
                    email={authForms.email}
                    setEmail={authForms.setEmail}
                    password={authForms.password}
                    setPassword={authForms.setPassword}
                    handleSignIn={authForms.handleSignIn}
                    handleMagicLink={authForms.handleMagicLink}
                    rememberMe={authForms.rememberMe}
                    setRememberMe={authForms.setRememberMe}
                  />
                </CardContent>
              </TabsContent>
              
              <TabsContent value="signup">
                <CardContent className="pt-6">
                  <SignUpForm 
                    loading={authForms.isLoading}
                    email={authForms.email}
                    setEmail={authForms.setEmail}
                    password={authForms.password}
                    setPassword={authForms.setPassword}
                    fullName={authForms.fullName}
                    setFullName={authForms.setFullName}
                    confirmPassword={authForms.confirmPassword}
                    setConfirmPassword={authForms.setConfirmPassword}
                    handleSignUp={authForms.handleSignUp}
                  />
                </CardContent>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}
    </AuthContainer>
  );
}
