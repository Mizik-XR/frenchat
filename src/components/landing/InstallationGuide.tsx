
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Cpu, Server, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getBaseUrl } from "@/utils/environment/urlUtils";

export function InstallationGuide() {
  // Utilisation de l'utilitaire d'URL pour construire des liens robustes
  const getDownloadUrl = (fileName: string) => {
    return `${getBaseUrl()}/downloads/${fileName}`;
  };

  return (
    <div className="py-16 bg-black/95">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Installation Simplifiée</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choisissez le mode d'installation qui vous convient le mieux
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-gray-900/60 border-gray-800 text-white hover:bg-gray-900/80 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-400" />
                Version Cloud
              </CardTitle>
              <CardDescription className="text-gray-400">
                Accédez à FileChat directement depuis votre navigateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                La version cloud ne nécessite aucune installation. Créez simplement un compte
                et commencez à utiliser toutes les fonctionnalités immédiatement.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-300 mt-4">
                <li>Aucune configuration technique requise</li>
                <li>Mises à jour automatiques</li>
                <li>Accessible depuis n'importe quel appareil</li>
                <li>Utilise par défaut des modèles IA en cloud</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/auth" className="w-full">
                <Button variant="default" className="w-full">
                  Commencer gratuitement
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800 text-white hover:bg-gray-900/80 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-green-400" />
                Version Locale
              </CardTitle>
              <CardDescription className="text-gray-400">
                Installez FileChat sur votre ordinateur pour un contrôle total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                La version locale vous permet d'utiliser vos propres ressources matérielles
                pour exécuter les modèles d'IA, offrant une meilleure confidentialité.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-300 mt-4">
                <li>Confidentialité totale - données traitées localement</li>
                <li>Installation automatique d'Ollama et des modèles</li>
                <li>Détection du matériel pour une configuration optimale</li>
                <li>Bascule intelligente local/cloud si nécessaire</li>
              </ul>
            </CardContent>
            <CardFooter>
              {/* Remplacer par une redirection vers la doc d'installation */}
              <Link to="/docs/installation" className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Voir les instructions d'installation
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-12 p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-800/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-400" />
            Mode Cloud Vercel
          </h3>
          
          <p className="text-gray-300 mb-4">
            Notre déploiement Vercel vous offre une performance et une fiabilité optimales :
          </p>
          
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>
              <span className="font-medium text-white">Temps de chargement optimal</span> - Serveurs edge globaux pour une expérience rapide
            </li>
            <li>
              <span className="font-medium text-white">Haute disponibilité</span> - Garantie de service pour une application fiable
            </li>
            <li>
              <span className="font-medium text-white">Mise à l'échelle automatique</span> - S'adapte à vos besoins sans intervention
            </li>
            <li>
              <span className="font-medium text-white">Protection des données</span> - Chiffrement et sécurité de niveau entreprise
            </li>
          </ol>
          
          <div className="mt-5 flex justify-center">
            <Link to="/auth" className="w-full max-w-xs">
              <Button variant="default" className="w-full gap-2">
                <Server className="h-4 w-4" />
                Accéder à l'application
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
