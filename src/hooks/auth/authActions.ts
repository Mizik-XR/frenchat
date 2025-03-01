
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { updateCachedUser } from "./authConstants";

// Fonction de déconnexion
export function useSignOut() {
  const navigate = useNavigate();
  
  return async () => {
    try {
      await supabase.auth.signOut();
      updateCachedUser(null);
      navigate("/");
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };
}
