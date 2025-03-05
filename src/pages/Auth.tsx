
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { useAuthForms } from '@/hooks/useAuthForms';

export default function Auth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const authForms = useAuthForms();
  
  // Récupérer l'onglet sélectionné depuis l'état de navigation
  const defaultTab = location.state?.tab || 'signin';

  useEffect(() => {
    console.log("Auth component initializing");
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        }
        setSession(currentSession);
      } catch (error) {
        console.error('Erreur dans checkSession:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed", _event, session);
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Si nous avons un état de redirection, l'utiliser, sinon rediriger vers la page d'accueil
  const redirectTo = location.state?.from || '/';
  console.log("Redirection path if authenticated:", redirectTo);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  // Si l'utilisateur est authentifié, le rediriger vers la page demandée ou l'accueil
  if (session) {
    console.log("User is authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <AuthContainer>
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
    </AuthContainer>
  );
}
