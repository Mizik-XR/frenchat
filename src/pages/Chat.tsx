
import { Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { MainLayout } from "@/components/chat/layout/MainLayout";
import { useNavigationHelpers } from "@/hooks/auth/navigation/navigationHelpers";
import { useAuth } from "@/components/AuthProvider";
import "@/styles/chat.css";

export default function Chat() {
  const { user, isLoading } = useAuth();
  const { navigate, getNavigationPath } = useNavigationHelpers();

  // Vérifier l'authentification
  useEffect(() => {
    if (!isLoading && !user) {
      // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
      navigate(getNavigationPath("/auth"));
    }
  }, [user, isLoading, navigate, getNavigationPath]);

  // Montrer un écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne rien rendre (la redirection est gérée dans useEffect)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement de l'interface de chat...</p>
            </div>
          </div>
        }>
          <MainLayout />
        </Suspense>
      </div>
    </div>
  );
}
