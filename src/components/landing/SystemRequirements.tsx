
import { CpuIcon, HardDriveIcon, Wifi } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SystemRequirements() {
  return (
    <div className="py-16 bg-black/90">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Configuration Requise</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Pour une expérience optimale, votre système doit répondre aux exigences suivantes
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gray-900/60 border-gray-800 text-white">
            <CardHeader className="pb-2">
              <CpuIcon className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Processeur</CardTitle>
              <CardDescription className="text-gray-400">Recommandations minimales</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Intel Core i5 / AMD Ryzen 5 ou supérieur</li>
                <li>4 cœurs ou plus recommandés</li>
                <li>Fonctionne sur les processeurs plus anciens avec performances réduites</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/60 border-gray-800 text-white">
            <CardHeader className="pb-2">
              <HardDriveIcon className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Mémoire et Stockage</CardTitle>
              <CardDescription className="text-gray-400">Espace requis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>8 Go de RAM minimum (16 Go recommandés)</li>
                <li>2 Go d'espace disque disponible</li>
                <li>Espace supplémentaire pour le stockage des modèles IA (2-7 Go)</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/60 border-gray-800 text-white">
            <CardHeader className="pb-2">
              <Wifi className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Système et Connectivité</CardTitle>
              <CardDescription className="text-gray-400">Compatibilité</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Windows 10/11, macOS 10.15+, ou Linux</li>
                <li>Navigateur récent (Chrome, Firefox, Edge, Safari)</li>
                <li>Connexion Internet pour l'installation initiale</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
