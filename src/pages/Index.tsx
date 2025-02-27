
import React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OnboardingIntro } from "@/components/onboarding/OnboardingIntro";
import { MessageSquare, FolderOpen, Settings } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Steps } from "@/components/ui/steps";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingButton } from "@/components/onboarding/OnboardingButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Index() {
  const navigate = useNavigate();
  const { loading } = useOnboarding();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        {/* Composant d'onboarding */}
        <OnboardingIntro />
        
        <div className="container mx-auto px-4 py-12">
          <header className="mb-12 text-center relative">
            <div className="absolute right-0 top-0">
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">FileChat</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Votre assistant IA pour analyser, explorer et générer des documents intelligents
            </p>
            
            <div className="mt-4">
              <OnboardingButton />
            </div>
          </header>

          <div className="max-w-4xl mx-auto mb-12">
            <Steps steps={["Connectez-vous", "Configurez vos sources", "Discutez avec l'IA"]} currentStep={0} />
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Chat IA</CardTitle>
                </div>
                <CardDescription>
                  Discutez avec votre base documentaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Posez des questions sur vos documents et obtenez des réponses précises avec les sources.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/chat")}
                >
                  Accéder au chat
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Documents</CardTitle>
                </div>
                <CardDescription>
                  Gérez et générez vos documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Créez des documents structurés et exportez-les vers Google Drive ou Teams.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/documents")}
                >
                  Gérer les documents
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Configuration</CardTitle>
                </div>
                <CardDescription>
                  Connectez vos sources de données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Intégrez Google Drive, Microsoft Teams ou téléversez des fichiers manuellement.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/config")}
                >
                  Configurer
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              FileChat - Solution de chat intelligent pour vos documents
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
