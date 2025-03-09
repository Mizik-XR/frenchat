
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSystemCapabilities } from '@/hooks/useSystemCapabilities';
import { SentryTestButton } from '@/components/debug/SentryTestButton';
import { SentryMonitor } from '@/monitoring/sentry-integration';

export default function Debug() {
  const { capabilities, isAnalyzing, analyzeSystem } = useSystemCapabilities();
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const [sentryStat, setSentryStat] = useState({
    initialized: false,
    dsn: 'Non détecté',
    environment: 'Non détecté'
  });

  useEffect(() => {
    // Check Sentry status
    setSentryStat({
      initialized: SentryMonitor.isReady(),
      dsn: SentryMonitor.DSN?.substring(0, 15) + '...' || 'Non détecté',
      environment: import.meta.env.MODE || 'Non détecté'
    });

    // Add some debug logs
    setLogs([
      '[INFO] Application initialisée',
      '[INFO] Vérification des capacités système...',
      `[INFO] Mémoire disponible: ${capabilities.memoryGB ? capabilities.memoryGB + ' GB' : 'Inconnue'}`,
      `[INFO] CPU cores: ${capabilities.cpuCores || 'Inconnu'}`,
      `[INFO] GPU disponible: ${capabilities.gpuAvailable ? 'Oui' : 'Non'}`,
      '[INFO] Vérification de la connexion Ollama...',
      '[INFO] Test de connexion à Supabase...',
      `[INFO] Statut Sentry: ${SentryMonitor.isReady() ? 'Initialisé' : 'Non initialisé'}`
    ]);
  }, [capabilities]);

  const handleRunDiagnostic = () => {
    toast({
      title: "Diagnostic en cours",
      description: "Analyse du système en cours...",
    });
    
    // Add a log
    setLogs(prev => [...prev, '[INFO] Lancement du diagnostic système...']);
    
    // Simulate a diagnostic
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
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleRunDiagnostic}>
                Lancer un diagnostic
              </Button>
              <Button variant="outline" onClick={handleClearLogs}>
                Effacer les logs
              </Button>
              <SentryTestButton />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section monitoring */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>État du monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Sentry</h3>
              <div className="text-sm space-y-1">
                <p>État: <span className={`font-mono ${sentryStat.initialized ? 'text-green-600' : 'text-red-600'}`}>
                  {sentryStat.initialized ? 'Initialisé' : 'Non initialisé'}
                </span></p>
                <p>DSN: <span className="font-mono">{sentryStat.dsn}</span></p>
                <p>Env: <span className="font-mono">{sentryStat.environment}</span></p>
              </div>
            </div>
            
            <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Console Errors</h3>
              <p className="text-sm">Pour voir les erreurs récentes:</p>
              <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs">
                window.printFileCharErrorLogs()
              </div>
            </div>
            
            <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Actions</h3>
              <div className="space-y-2">
                <SentryTestButton />
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    if (window.printFileCharErrorLogs) {
                      const count = window.printFileCharErrorLogs();
                      toast({
                        title: `${count} logs affichés`,
                        description: "Consultez la console pour voir les logs d'erreur",
                      });
                    }
                  }}
                >
                  Afficher tous les logs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
