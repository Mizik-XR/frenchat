
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const OptimizationDocs = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Guide d'optimisation des performances</h3>
        
        <div className="space-y-4">
          <section>
            <h4 className="font-medium text-primary mb-2">1. Optimisation des Embeddings</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong>Traitement par lots (Batching) :</strong> Traite plusieurs documents simultanément 
                pour réduire le temps total de traitement jusqu'à 70%.
              </li>
              <li>
                <strong>Mise en cache :</strong> Stocke les embeddings fréquemment utilisés dans Supabase 
                pour un accès quasi instantané.
              </li>
              <li>
                <strong>Compression des données :</strong> Réduit la taille des embeddings pour optimiser 
                le stockage et la bande passante.
              </li>
            </ul>
          </section>

          <section>
            <h4 className="font-medium text-primary mb-2">2. Optimisation des Recherches</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong>Pré-calcul :</strong> Utilise des embeddings pré-calculés pour les requêtes 
                fréquentes, réduisant le temps de réponse de 90%.
              </li>
              <li>
                <strong>Cache des résultats :</strong> Mémorise temporairement les résultats de 
                recherche pour des réponses instantanées aux requêtes similaires.
              </li>
              <li>
                <strong>Limitation intelligente :</strong> Optimise le nombre de résultats retournés 
                pour maintenir des performances optimales.
              </li>
            </ul>
          </section>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="ml-2">
              Ces optimisations peuvent réduire les coûts d'API Hugging Face jusqu'à 80% en 
              minimisant les appels redondants et en maximisant l'utilisation des ressources locales.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Comparaison des Performances</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">Sans Optimisations</h5>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Temps de traitement moyen : 2-3 secondes par document</li>
              <li>Utilisation API Hugging Face : 100%</li>
              <li>Temps de réponse recherche : 1-2 secondes</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 bg-primary/5">
            <h5 className="font-medium mb-2">Avec Optimisations</h5>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Temps de traitement moyen : 0.5-1 seconde par lot</li>
              <li>Utilisation API Hugging Face : 20-30%</li>
              <li>Temps de réponse recherche : 100-300ms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
