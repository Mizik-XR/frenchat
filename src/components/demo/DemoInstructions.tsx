
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DemoInstructionsProps } from './types';

export const DemoInstructions: React.FC<DemoInstructionsProps> = ({ complete }) => {
  if (!complete) return null;
  
  return (
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Instructions pour la démo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Pour une présentation efficace :</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Commencez par présenter la page d'accueil et l'objectif de l'application</li>
          <li>Démontrez le processus d'authentification</li>
          <li>Montrez comment configurer la connexion à Google Drive</li>
          <li>Illustrez l'indexation des documents et la recherche</li>
          <li>Faites une démonstration du chat IA avec questions-réponses sur les documents</li>
          <li>Présentez les fonctionnalités de monitoring et d'analyse</li>
        </ol>
      </CardContent>
    </Card>
  );
};
