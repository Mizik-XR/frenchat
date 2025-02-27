
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, SITE_URL } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Auth page - User state:", user ? "Logged in" : "Not logged in");
    if (user) {
      console.log("User is logged in, redirecting to /chat");
      navigate("/chat");
    }
  }, [user, navigate]);

  const clearError = () => setAuthError(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    
    try {
      console.log("Attempting to sign in with email:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Sign in successful");
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      
      navigate("/chat");
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      setAuthError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (password !== confirmPassword) {
      setAuthError("Les mots de passe ne correspondent pas");
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to sign up with email:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${SITE_URL}/auth`
        },
      });

      if (error) throw error;

      console.log("Sign up successful");
      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte",
      });
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      setAuthError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    
    try {
      console.log("Attempting to send magic link to:", email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${SITE_URL}/chat`,
        },
      });

      if (error) throw error;

      console.log("Magic link sent successfully");
      toast({
        title: "Lien magique envoyé",
        description: "Vérifiez votre boîte mail pour vous connecter",
      });
    } catch (error: any) {
      console.error("Magic link error:", error.message);
      setAuthError(error.message);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md space-y-8 bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl p-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue sur FileChat</h1>
          <p className="text-sm text-gray-600">
            Connectez-vous ou créez un compte pour continuer
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {authError}
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin" className="text-sm sm:text-base">Connexion</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm sm:text-base">Inscription</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-0 animate-fade-in">
            <SignInForm 
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSignIn={handleSignIn}
              handleMagicLink={handleMagicLink}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
            />
          </TabsContent>
          <TabsContent value="signup" className="mt-0 animate-fade-in">
            <SignUpForm 
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              fullName={fullName}
              setFullName={setFullName}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              handleSignUp={handleSignUp}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-sm text-gray-500"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
