
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
              <a href={getDownloadUrl("filechat-setup.exe")} className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger pour Windows
                </Button>
              </a>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-12 p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-800/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-400" />
            Autres téléchargements
          </h3>
          
          <p className="text-gray-300 mb-4">
            FileChat est disponible pour les plateformes suivantes:
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <a href={getDownloadUrl("filechat-mac-intel.dmg")}>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                macOS (Intel)
              </Button>
            </a>
            <a href={getDownloadUrl("filechat-mac-arm.dmg")}>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                macOS (Apple Silicon)
              </Button>
            </a>
            <a href={getDownloadUrl("filechat-linux.tar.gz")}>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Linux (x64)
              </Button>
            </a>
          </div>
          
          <div className="mt-5 flex justify-center">
            <Link to="/docs/installation" className="text-blue-400 hover:text-blue-300 text-sm">
              Instructions d'installation détaillées
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
