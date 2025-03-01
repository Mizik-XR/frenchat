
import { Progress } from "@/components/ui/progress";

interface InstallationProgressProps {
  installProgress: number;
  selectedPath: string;
}

export function InstallationProgress({ installProgress, selectedPath }: InstallationProgressProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Installation des modèles IA</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span>{installProgress}%</span>
          </div>
          <Progress value={installProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Statut:</p>
          <div className="bg-gray-50 p-3 rounded-md border text-sm">
            {installProgress < 30 && "Préparation de l'environnement..."}
            {installProgress >= 30 && installProgress < 60 && "Téléchargement des fichiers modèles..."}
            {installProgress >= 60 && installProgress < 90 && "Configuration des modèles..."}
            {installProgress >= 90 && "Finalisation de l'installation..."}
            {installProgress === 100 && "Installation terminée avec succès!"}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>Dossier d'installation: {selectedPath}</p>
          <p>Les modèles seront téléchargés automatiquement lors de la première utilisation.</p>
        </div>
      </div>
    </div>
  );
}
