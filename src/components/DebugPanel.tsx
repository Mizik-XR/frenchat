
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, CheckCircle, X, Terminal, Cpu, Cloud, Database } from "lucide-react";
import { useDiagnostics } from '@/hooks/useDiagnostics';
import { useHuggingFace } from '@/hooks/useHuggingFace';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isRunning, report, runDiagnostic } = useDiagnostics();
  const { serviceType, localAIUrl, localProvider } = useHuggingFace();

  // Uniquement en développement ou si l'URL contient un paramètre debug=true
  const shouldShow = import.meta.env.DEV || window.location.search.includes('debug=true');
  if (!shouldShow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
        >
          <Bug className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Console de Diagnostic FileChat</DialogTitle>
          <DialogDescription>
            Outils de diagnostic et de débogage pour l'équipe technique
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">État du système</h3>
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Terminal className="h-4 w-4" />
              {isRunning ? "Diagnostic en cours..." : "Lancer un diagnostic"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Service IA</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Mode actuel:</span>
                  <Badge variant={serviceType === 'local' ? "default" : serviceType === 'cloud' ? "default" : "outline"} className={serviceType === 'local' ? "bg-green-500 hover:bg-green-600" : ""}>
                    {serviceType === 'local' ? 'Local' : serviceType === 'cloud' ? 'Cloud' : 'Hybride'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>URL locale:</span>
                  <span className="font-mono text-xs">{localAIUrl || 'Non configurée'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fournisseur:</span>
                  <span>{localProvider}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Stockage</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Cache activé:</span>
                  <span>{localStorage.getItem('cacheEnabled') !== 'false' ? 'Oui' : 'Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Limite du cache:</span>
                  <span>{localStorage.getItem('cacheLimit') || '1000'} entrées</span>
                </div>
                <div className="flex justify-between">
                  <span>TTL par défaut:</span>
                  <span>{localStorage.getItem('cacheTTL') || '30'} jours</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium">Connexion</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={navigator.onLine ? "default" : "destructive"} className={navigator.onLine ? "bg-green-500 hover:bg-green-600" : ""}>
                    {navigator.onLine ? 'Connecté' : 'Déconnecté'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Type réseau:</span>
                  <span>{typeof navigator !== 'undefined' && 'connection' in navigator ? (navigator as any).connection?.effectiveType || 'Inconnu' : 'Non disponible'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hors-ligne:</span>
                  <span>{localStorage.getItem('offlineMode') === 'true' ? 'Activé' : 'Désactivé'}</span>
                </div>
              </div>
            </div>
          </div>

          {report && (
            <div className="mt-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold mb-3">Rapport de diagnostic</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Compatibilité système
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    {report.compatibility.compatible ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="font-medium">
                      {report.compatibility.compatible 
                        ? "Système compatible avec l'IA locale" 
                        : "Système partiellement compatible"}
                    </span>
                  </div>
                  
                  {report.compatibility.issues.length > 0 && (
                    <div className="ml-7 text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-1">Problèmes détectés:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {report.compatibility.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Services IA
                    </h4>
                    <div className="space-y-3">
                      <div className="border rounded p-3 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Local ({report.aiService.local.provider})</span>
                          </div>
                          {report.aiService.local.available ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Disponible</Badge>
                          ) : (
                            <Badge variant="destructive">Indisponible</Badge>
                          )}
                        </div>
                        {report.aiService.local.available && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div>Temps de réponse: {report.aiService.local.responseTime}ms</div>
                            <div className="font-mono text-xs truncate">Endpoint: {report.aiService.local.endpoint}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded p-3 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">Cloud</span>
                          </div>
                          {report.aiService.cloud.available ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Disponible</Badge>
                          ) : (
                            <Badge variant="destructive">Indisponible</Badge>
                          )}
                        </div>
                        {report.aiService.cloud.available && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div>Temps de réponse: {report.aiService.cloud.responseTime}ms</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Mode recommandé: </span>
                        <Badge
                          variant="outline"
                          className={`ml-1 ${report.aiService.recommendedMode === 'local' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                        >
                          {report.aiService.recommendedMode.charAt(0).toUpperCase() + report.aiService.recommendedMode.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Information système
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Navigateur:</span>
                        <span>{report.system.browser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type de réseau:</span>
                        <span>{report.system.networkType || 'Non détecté'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vitesse réseau:</span>
                        <Badge variant={
                          report.system.networkSpeed === 'fast' ? 'default' :
                          report.system.networkSpeed === 'medium' ? 'default' : 'outline'
                        } className={
                          report.system.networkSpeed === 'fast' ? 'bg-green-500 hover:bg-green-600' : 
                          report.system.networkSpeed === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                        }>
                          {report.system.networkSpeed === 'fast' ? 'Rapide' :
                           report.system.networkSpeed === 'medium' ? 'Moyenne' : 'Lente'}
                        </Badge>
                      </div>
                      
                      {report.system.memory.jsHeapSizeLimit && (
                        <div className="border-t pt-2 mt-2">
                          <div className="font-medium mb-1">Mémoire JavaScript:</div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="border rounded p-2 text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Utilisée</div>
                              <div>{Math.round(report.system.memory.usedJSHeapSize! / (1024 * 1024))} MB</div>
                            </div>
                            <div className="border rounded p-2 text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                              <div>{Math.round(report.system.memory.totalJSHeapSize! / (1024 * 1024))} MB</div>
                            </div>
                            <div className="border rounded p-2 text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Limite</div>
                              <div>{Math.round(report.system.memory.jsHeapSizeLimit! / (1024 * 1024))} MB</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="font-medium mb-1">Fonctionnalités supportées:</div>
                        <div className="grid grid-cols-2 gap-1">
                          {Object.entries(report.system.capabilities).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                              {value ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span className="text-xs">{key}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  Diagnostic généré le {new Date(report.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center text-xs text-gray-500 mt-6">
            Console de débogage - Version {import.meta.env.VITE_LOVABLE_VERSION || '1.0.0'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
