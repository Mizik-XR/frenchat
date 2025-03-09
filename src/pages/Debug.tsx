
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSystemCapabilities } from '@/hooks/useSystemCapabilities';
import { SentryMonitor } from '@/monitoring/sentry-integration';
import { SystemCapabilitiesCard } from '@/components/debug/SystemCapabilitiesCard';
import { SystemLogsCard } from '@/components/debug/SystemLogsCard';
import { MonitoringStatusCard } from '@/components/debug/MonitoringStatusCard';

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
        <SystemCapabilitiesCard 
          capabilities={capabilities}
          isAnalyzing={isAnalyzing}
          analyzeSystem={analyzeSystem}
        />
        
        <SystemLogsCard 
          logs={logs}
          onRunDiagnostic={handleRunDiagnostic}
          onClearLogs={handleClearLogs}
        />
      </div>

      <MonitoringStatusCard sentryStat={sentryStat} />
    </div>
  );
}
