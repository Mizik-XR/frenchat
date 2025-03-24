
import React from '@/core/reactInstance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const OptimizationTips: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recommandations d'optimisation</CardTitle>
        <CardDescription>
          Conseils pour réduire vos coûts d'utilisation d'IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5">
          <li>Utilisez des modèles locaux pour les tâches fréquentes ou routinières</li>
          <li>Réduisez la longueur des prompts en étant plus concis</li>
          <li>Utilisez le chunking intelligent pour optimiser l'indexation des documents</li>
          <li>Limitez le nombre de tokens générés en paramétrant correctement vos requêtes</li>
          <li>Utilisez la mise en cache des requêtes similaires pour éviter les duplications</li>
        </ul>
      </CardContent>
    </Card>
  );
};
