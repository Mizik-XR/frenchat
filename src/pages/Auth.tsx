
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { supabase } from '@/integrations/supabase/client';
import { useAuthForms } from '@/hooks/useAuthForms';
import { toast } from '@/hooks/toast';

type AuthMode = 'signin' | 'signup' | 'password-reset';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    email, setEmail,
    password, setPassword,
    fullName, setFullName,
    confirmPassword, setConfirmPassword,
    rememberMe, setRememberMe,
    isLoading: isSubmitting,
    handleSignIn,
    handleSignUp,
    handleMagicLink
  } = useAuthForms();

  // Vérifier la présence d'un paramètre tab dans l'état de navigation
  useEffect(() => {
    if (location.state && location.state.tab) {
      const tab = location.state.tab as string;
      if (tab === 'signup') {
        setMode('signup');
      } else if (tab === 'signin') {
        setMode('signin');
      }
    }
  }, [location]);

  // Check for existing session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate('/chat');
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        toast({
          title: "Erreur d'authentification",
          description: "Impossible de vérifier votre session",
          variant: "destructive"
        });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [isLoading, navigate]);

  // Navigate to chat if already authenticated
  useEffect(() => {
    if (user && !isLoading && !isCheckingAuth) {
      navigate('/chat');
    }
  }, [user, isLoading, navigate, isCheckingAuth]);

  // Check for password reset mode from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('mode') === 'password-reset') {
      setMode('password-reset');
      const emailParam = searchParams.get('email');
      if (emailParam) setEmail(emailParam);
    }
  }, [location, setEmail]);

  // Show loading screen while checking auth
  if (isLoading || isCheckingAuth) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {mode === 'signin' ? 'Connexion à FileChat' : 
             mode === 'signup' ? 'Créer votre compte' : 
             'Réinitialiser le mot de passe'}
          </h2>
        </div>

        {mode === 'signin' ? (
          <SignInForm 
            loading={isSubmitting}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSignIn={handleSignIn}
            handleMagicLink={handleMagicLink}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            switchToSignUp={() => setMode('signup')}
            switchToPasswordReset={() => setMode('password-reset')}
          />
        ) : mode === 'signup' ? (
          <SignUpForm 
            loading={isSubmitting}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            fullName={fullName}
            setFullName={setFullName}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleSignUp={handleSignUp}
            switchToSignIn={() => setMode('signin')}
          />
        ) : (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              // Gérer la réinitialisation du mot de passe
              const resetPassword = async () => {
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(email);
                  if (error) throw error;
                  toast({
                    title: "Réinitialisation envoyée",
                    description: "Instructions de réinitialisation envoyées à votre email",
                    variant: "success"
                  });
                } catch (err) {
                  console.error('Erreur de réinitialisation:', err);
                  toast({
                    title: "Erreur",
                    description: "Erreur lors de l'envoi du lien de réinitialisation",
                    variant: "destructive"
                  });
                }
              };
              resetPassword();
            }}>
              <div>
                <label htmlFor="email" className="sr-only">Adresse e-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
                  placeholder="Adresse e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-gray-900"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </button>
              </div>
              <div className="text-sm text-center">
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  onClick={() => setMode('signin')}
                  disabled={isSubmitting}
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Export default pour le lazy loading
export default Auth;
export { Auth };
