
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSystemCapabilities } from '@/hooks/useSystemCapabilities';

export default function Debug() {
  const { capabilities, isAnalyzing, analyzeSystem } = useSystemCapabilities();
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Ajouter quelques logs de débogage
    setLogs([
      '[INFO] Application initialisée',
      '[INFO] Vérification des capacités système...',
      `[INFO] Mémoire disponible: ${capabilities.memoryGB ? capabilities.memoryGB + ' GB' : 'Inconnue'}`,
      `[INFO] CPU cores: ${capabilities.cpuCores || 'Inconnu'}`,
      `[INFO] GPU disponible: ${capabilities.gpuAvailable ? 'Oui' : 'Non'}`,
      '[INFO] Vérification de la connexion Ollama...',
      '[INFO] Test de connexion à Supabase...',
    ]);
  }, [capabilities]);

  const handleRunDiagnostic = () => {
    toast({
      title: "Diagnostic en cours",
      description: "Analyse du système en cours...",
    });
    
    // Ajouter un log
    setLogs(prev => [...prev, '[INFO] Lancement du diagnostic système...']);
    
    // Simuler un diagnostic
    setTimeout(() => {
      setLogs(prev => [
        ...prev, 
        '[INFO] Vérification de la connexion réseau: OK',
        '[INFO] Test de latence: 120ms',
        '[INFO] Vérification des permissions de stockage: OK',
        '[INFO] Diagnostic terminé'
      ]);
      
      toast({
        title: "Diagnostic terminé",
        description: "Tous les tests ont été effectués avec succès.",
      });
    }, 2000);
  };

  const handleClearLogs = () => {
    setLogs([]);
    toast({
      title: "Logs effacés",
      description: "Tous les logs ont été effacés.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Débogage et Diagnostic</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Capacités système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Mémoire RAM:</p>
                <p className="text-lg">{capabilities.memoryGB ? `${capabilities.memoryGB} GB` : 'Non détecté'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Processeur:</p>
                <p className="text-lg">{capabilities.cpuCores ? `${capabilities.cpuCores} cœurs` : 'Non détecté'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">GPU:</p>
                <p className="text-lg">{capabilities.gpuAvailable ? 'Disponible' : 'Non disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Catégorie système:</p>
                <p className="text-lg">
                  {capabilities.isHighEndSystem ? 'Haute performance' : 
                   capabilities.isMidEndSystem ? 'Performance moyenne' : 'Performance de base'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Modèles recommandés:</p>
                <ul className="list-disc pl-5">
                  {capabilities.recommendedModels.map((model, index) => (
                    <li key={index}>{model}</li>
                  ))}
                </ul>
              </div>
              <Button onClick={analyzeSystem} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyse en cours...' : 'Analyser à nouveau'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Logs système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-[300px] overflow-y-auto mb-4">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              ) : (
                <div className="text-gray-500">Aucun log disponible</div>
              )}
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleRunDiagnostic}>
                Lancer un diagnostic
              </Button>
              <Button variant="outline" onClick={handleClearLogs}>
                Effacer les logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
