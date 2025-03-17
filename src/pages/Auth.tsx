// Importer les dépendances nécessaires
import { React, useEffect, useState } from "@/core/ReactInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import { handleAuthChange } from "@/hooks/auth/authStateChangeHandlers";

// Définir le type pour les états de l'URL
interface LocationState {
  from: string;
}

// Composant Auth
const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [prevUser, setPrevUser] = useState<any>(null);

  // Extraire l'état de l'URL
  const { from } = location.state as LocationState || { from: "/home" };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: email.split('@')[0],
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
          // Rediriger vers la page de configuration après l'inscription
          navigate("/config");
        }
      } else {
        // Connexion
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
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
          // Rediriger vers la page d'accueil après la connexion
          navigate(from || "/home");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire d'événements d'authentification
  useEffect(() => {
    const handleAuthState = async (event: string, session: any) => {
      if (event === "SIGNED_IN" && !prevUser) {
        // Rediriger vers la page de configuration après l'inscription
        navigate("/config");
      }
      await handleAuthChange(event, session, setLoading, () => {}, () => {});
    };

    supabase.auth.onAuthStateChange(handleAuthState);

    // Nettoyer l'abonnement
    return () => {
      supabase.auth.signOut();
    };
  }, [navigate, prevUser]);

  // Rendu du composant
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
