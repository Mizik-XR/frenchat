
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, FileQuestion, BrainCircuit, FileDigit } from "lucide-react";

export function FeaturesSection() {
  return (
    <div className="py-16 bg-black/90">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Fonctionnalités Principales</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            FileChat transforme votre façon d'interagir avec vos documents et fichiers
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="h-5 w-5 text-purple-400" />
                IA Adaptative
              </CardTitle>
              <CardDescription className="text-gray-400">
                Optimisation intelligente des ressources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Bascule automatique local/cloud selon la complexité</li>
                <li>Mode local économe pour les tâches standards</li>
                <li>Utilisation du cloud pour les questions complexes</li>
                <li>Contrôle des coûts avec système de crédits</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileQuestion className="h-5 w-5 text-blue-400" />
                Recherche Avancée
              </CardTitle>
              <CardDescription className="text-gray-400">
                Interrogez vos documents en langage naturel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Indexation intelligente de multiples sources de documents</li>
                <li>Questions en langage naturel sur votre contenu</li>
                <li>Réponses précises avec références aux sources</li>
                <li>Historique des conversations pour suivi des sujets</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <BrainCircuit className="h-5 w-5 text-green-400" />
                Intelligence Contextuelle
              </CardTitle>
              <CardDescription className="text-gray-400">
                Comprend le contexte de vos questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Analyse sémantique avancée de vos documents</li>
                <li>Compréhension des questions complexes et ambiguës</li>
                <li>Résolution de références et d'ambiguïtés</li>
                <li>Personnalisation selon votre style et préférences</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-yellow-400" />
                Chat Structuré
              </CardTitle>
              <CardDescription className="text-gray-400">
                Interface de conversation intuitive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Historique de conversation style WhatsApp</li>
                <li>Créez de multiples fils pour différents sujets</li>
                <li>Formatage markdown et code pour lisibilité</li>
                <li>Citations et références automatiques</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileDigit className="h-5 w-5 text-red-400" />
                Documents et Visualisations
              </CardTitle>
              <CardDescription className="text-gray-400">
                Génération de documents enrichis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Création de documents structurés à partir de conversations</li>
                <li>Génération de graphiques et visualisations intégrées</li>
                <li>Tableaux et analyses numériques intelligentes</li>
                <li>Export vers Google Drive, PDF et autres formats</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 7V5.5C12 4.67 11.33 4 10.5 4H5.5C4.67 4 4 4.67 4 5.5V19L8 15H10.5C11.33 15 12 14.33 12 13.5V12"></path>
                  <path d="M19 7H14C13.17 7 12.5 7.67 12.5 8.5V15L14 13.5H19C19.83 13.5 20.5 12.83 20.5 12V8.5C20.5 7.67 19.83 7 19 7Z"></path>
                </svg>
                Intégration Fluide
              </CardTitle>
              <CardDescription className="text-gray-400">
                Se connecte à vos outils existants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Connexion OAuth sécurisée à Google Drive</li>
                <li>Partage et exportation facilitée des résultats</li>
                <li>Indexation automatisée par lots des documents</li>
                <li>Support pour Teams, OneDrive et Sharepoint (bientôt)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
