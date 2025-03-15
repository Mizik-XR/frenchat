
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { handleProfileQuery } from '@/integrations/supabase/client';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'signin' | 'signup' | 'password-reset';

export const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      const email = searchParams.get('email');
      if (email) setEmail(email);
    }
  }, [location]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          // Save initial user preferences
          await supabase.from('user_preferences').insert({
            user_id: data.user.id,
            onboarding_completed: false,
          });

          // Listen for auth state change
          const authListener = supabase.auth.onAuthStateChange((event) => {
            // Check for the SIGNED_UP event
            if (event === "SIGNED_IN") {
              navigate('/onboarding');
              authListener.data.subscription.unsubscribe();
            }
          });
        }
      } else if (mode === 'password-reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        alert('Password reset instructions sent to your email');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            switchToSignUp={() => setMode('signup')}
            switchToPasswordReset={() => setMode('password-reset')}
          />
        ) : mode === 'signup' ? (
          <SignUpForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            switchToSignIn={() => setMode('signin')}
          />
        ) : (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
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
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
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
