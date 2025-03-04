import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, Settings, BarChart3, Presentation } from "lucide-react";
import { PageHeader } from "@/components/navigation/PageHeader";
import { LogoImage } from "@/components/common/LogoImage";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <PageHeader title="Frenchat - Assistant IA pour documents" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <LogoImage className="h-10 w-10" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Frenchat
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Assistant IA conversationnel pour l'analyse et l'indexation de documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  Chat IA
                </CardTitle>
                <CardDescription>
                  Discutez avec vos documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Posez des questions à vos documents et obtenez des réponses pertinentes grâce à notre technologie RAG avancée.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/chat">Accéder au chat</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Gérez vos documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Importez, visualisez et analysez vos documents depuis Google Drive, Microsoft Teams ou votre ordinateur.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/documents">Gérer les documents</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Paramétrez l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Configurez les modèles IA, les sources de documents et les paramètres avancés.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/config">Configurer</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Monitoring
                </CardTitle>
                <CardDescription>
                  Suivez les performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Consultez les statistiques d'utilisation et les performances du système.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/monitoring">Voir les statistiques</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="hover:shadow-lg transition-shadow border-purple-200">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-purple-600" />
                  Générer une présentation
                </CardTitle>
                <CardDescription>
                  Créez une démo PowerPoint automatiquement
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p>
                  Générez une présentation complète du projet avec captures d'écran et explications des fonctionnalités principales.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="default" className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link to="/demo">Créer une présentation</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Version {import.meta.env.VITE_LOVABLE_VERSION || '1.0.0'} - Développé avec ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
