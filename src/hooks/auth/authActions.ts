
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { updateCachedUser } from "./authConstants";
import { UserProfile } from "@/integrations/supabase/supabaseModels";

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

// Fonction pour créer un compte et définir le profil
export async function signUpAndCreateProfile(email: string, password: string, metadata: any = {}) {
  try {
    console.log("Tentative d'inscription avec email:", email, "et métadonnées:", metadata);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      }
    });
    
    if (error) throw error;
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    throw error;
  }
}

// Fonction pour récupérer le profil utilisateur
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return data as UserProfile;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return null;
  }
}
