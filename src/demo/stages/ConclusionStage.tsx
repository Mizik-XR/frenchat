
import React from 'react';
import { Button } from '@/components/ui/button';
import { STAGE_DETAILS } from '../constants';
import { useDemo } from '../DemoContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronRight, Download, ExternalLink } from 'lucide-react';

export const ConclusionStage = () => {
  const { currentStage } = useDemo();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4">Récapitulatif des fonctionnalités</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {STAGE_DETAILS[currentStage]}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 mb-8">
          <h4 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Félicitations !</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vous avez terminé la démonstration de FileChat. Vous avez pu découvrir :
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <span>L'authentification sécurisée via Supabase</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <span>La configuration des sources de documents (Google Drive, Microsoft Teams, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <span>L'indexation intelligente des documents</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <span>L'interface de chat IA pour interroger vos documents</span>
            </li>
          </ul>
          
          <p className="text-gray-700 dark:text-gray-300">
            FileChat est prêt à transformer votre façon de travailler avec vos documents.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commencer avec FileChat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Utilisez dès maintenant FileChat avec vos propres documents.
              </p>
              <Button asChild>
                <Link to="/home">
                  Démarrer l'application réelle
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Consultez la documentation pour approfondir vos connaissances.
              </p>
              <Button variant="outline" asChild>
                <Link to="/documents">
                  Voir la documentation
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
