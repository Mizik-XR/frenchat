
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileText, Cog, BarChart3 } from 'lucide-react';
import { STAGE_DETAILS } from '../constants';
import { useDemo } from '../DemoContext';
import { toast } from '@/hooks/use-toast';

export const IntroStage = () => {
  const { currentStage } = useDemo();
  const [showFeatures, setShowFeatures] = useState(false);

  const handleShowFeatures = () => {
    setShowFeatures(true);
    toast({
      title: "Démo activée",
      description: "Vous pouvez maintenant explorer les fonctionnalités de FileChat"
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4">Découvrez FileChat</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {STAGE_DETAILS[currentStage]}
        </p>
      </div>

      {!showFeatures ? (
        <div className="text-center">
          <Button size="lg" onClick={handleShowFeatures}>
            Explorer les fonctionnalités
          </Button>
        </div>
      ) : (
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
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Documents
              </CardTitle>
              <CardDescription>
                Indexation intelligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Importez vos documents depuis Google Drive, Microsoft Teams ou votre ordinateur pour les rendre accessibles via le chat IA.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5 text-purple-500" />
                Configuration
              </CardTitle>
              <CardDescription>
                Personnalisation complète
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Configurez les modèles IA, les sources de documents et les paramètres avancés selon vos besoins.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                Monitoring
              </CardTitle>
              <CardDescription>
                Suivi des performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Consultez les statistiques d'utilisation et les performances du système pour optimiser votre expérience.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
