
import { Session, User } from "@supabase/supabase-js";
import { handleProfileAndConfig, handleUserRedirection, isAuthPagePath, isPublicPagePath } from "./sessionHelpers";
import { useNavigationHelpers } from "./sessionHelpers";
import { toast } from "sonner";

/**
 * Gère la récupération du profil et des configurations de l'utilisateur lors de la connexion
 * 
 * @param session La session utilisateur Supabase
 * @param setIsLoading Fonction pour définir l'état de chargement
 * @param setUser Fonction pour définir l'utilisateur authentifié
 * @param setNeedsConfig Fonction pour définir si une configuration est nécessaire
 */
export const handleAuthSession = async (
  session: Session | null,
  setIsLoading: (isLoading: boolean) => void,
  setUser: (user: User | null) => void,
  setNeedsConfig: (needsConfig: boolean) => void,
  setIsFirstLogin?: (isFirstLogin: boolean) => void,
  navigationHelpers?: ReturnType<typeof useNavigationHelpers>,
  isAuthPage?: boolean
) => {
  setIsLoading(true);
  console.info("Checking initial session...");

  try {
    if (!session) {
      setUser(null);
      setNeedsConfig(false);
      setIsLoading(false);
      console.info("No session found");
      return;
    }

    console.info("Initial session check: User authenticated");
    setUser(session.user);

    // Si nous sommes sur une page publique, ne pas vérifier le profil
    if (navigationHelpers && isPublicPagePath(navigationHelpers.location.pathname)) {
      setIsLoading(false);
      return;
    }

    // Récupérer le profil et les configurations
    const result = await handleProfileAndConfig(session.user.id);
    
    if (result.profileError) {
      console.error("Erreur lors de la récupération du profil:", result.profileError);
      toast.error("Erreur lors de la récupération de votre profil");
    }

    if (result.error) {
      console.error("Erreur inattendue:", result.error);
      toast.error("Une erreur est survenue lors de la récupération de vos données");
    }

    // Définir si une configuration est nécessaire
    setNeedsConfig(result.needsConfig);

    // Définir si c'est la première connexion
    if (setIsFirstLogin) {
      setIsFirstLogin(result.isFirstLogin);
    }

    // Gérer la redirection des utilisateurs si nécessaire
    if (navigationHelpers && isAuthPage) {
      handleUserRedirection(isAuthPage, result.needsConfig, result.isFirstLogin, navigationHelpers);
    }
  } catch (error) {
    console.error("Error during session handling:", error);
    toast.error("Une erreur est survenue lors de la vérification de votre session");
  } finally {
    setIsLoading(false);
  }
};
