
import { useEffect, useState } from "@/core/ReactInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import { handleAuthChange } from "@/hooks/auth/authStateChangeHandlers";
import { AuthChangeEvent } from "@supabase/supabase-js";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [prevUser, setPrevUser] = useState(null);

  const { from } = location.state || { from: "/home" };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split("@")[0],
            },
          },
        });

        if (error) {
          toast({
            title: "Erreur lors de l'inscription",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Inscription réussie",
            description: "Veuillez vérifier votre email pour confirmer votre compte.",
          });
          navigate("/config");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Erreur lors de la connexion",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connexion réussie",
            description: "Vous êtes maintenant connecté.",
          });
          navigate(from || "/home");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthState = async (event: AuthChangeEvent, session: any) => {
      if (event === "SIGNED_IN" && !prevUser) {
        navigate("/config");
      }
      await handleAuthChange(event, session, setLoading, () => {}, () => {});
    };

    supabase.auth.onAuthStateChange(handleAuthState);

    return () => {
      supabase.auth.signOut();
    };
  }, [navigate, prevUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="space-y-6 bg-white p-8 rounded shadow-md w-96">
        <Logo className="w-24 h-auto mx-auto" />
        <h2 className="text-2xl font-semibold text-center">
          {isSignUp ? "Créer un compte" : "Se connecter"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Adresse email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-primary text-white p-2 rounded hover:bg-primary-dark transition duration-300"
              disabled={loading}
            >
              {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-800 transition duration-300"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Vous avez déjà un compte? Se connecter"
              : "Créer un nouveau compte"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
