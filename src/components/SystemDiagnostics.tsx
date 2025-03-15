
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle, PlayCircle, XCircle, RefreshCw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SystemTestResult, runSystemCheck, testLocalAIService, testSupabaseConnections, checkCriticalUrls } from '@/utils/systemDiagnostics';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SystemDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemTestResult[]>([]);
  const [urlChecks, setUrlChecks] = useState<Record<string, boolean>>({});
  const [selectedTab, setSelectedTab] = useState('general');
  
  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const systemResults = await runSystemCheck();
      const urls = await checkCriticalUrls();
      
      setResults(systemResults);
      setUrlChecks(urls);
      
      // Count issues
      const errors = systemResults.filter(r => r.status === 'error').length;
      const warnings = systemResults.filter(r => r.status === 'warning').length;
      
      // Notify user
      if (errors > 0) {
        toast({
          title: `${errors} problème(s) détecté(s)`,
          description: "Consultez les détails pour plus d'informations",
          variant: "destructive"
        });
      } else if (warnings > 0) {
        toast({
          title: `${warnings} avertissement(s)`,
          description: "Le système fonctionne mais nécessite votre attention",
          variant: "warning"
        });
      } else {
        toast({
          title: "Tous les systèmes fonctionnent correctement",
          description: "Aucun problème détecté",
        });
      }
    } catch (e) {
      console.error("Erreur lors du diagnostic:", e);
      toast({
        title: "Erreur lors du diagnostic",
        description: e instanceof Error ? e.message : "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const runTestForSubsystem = async (subsystem: string) => {
    setIsRunning(true);
    try {
      let testResults: SystemTestResult[] = [];
      
      switch (subsystem) {
        case 'ai':
          const aiResult = await testLocalAIService();
          testResults = [aiResult];
          break;
        case 'database':
          testResults = await testSupabaseConnections();
          break;
        default:
          testResults = await runSystemCheck();
      }
      
      setResults(prev => {
        // Filter out previous results for this subsystem and add new ones
        const filtered = prev.filter(r => !testResults.some(tr => tr.name === r.name));
        return [...filtered, ...testResults];
      });
      
      // Notify user
      const errors = testResults.filter(r => r.status === 'error').length;
      if (errors > 0) {
        toast({
          title: `Test "${subsystem}" - ${errors} problème(s)`,
          description: "Des problèmes ont été détectés",
          variant: "destructive"
        });
      } else {
        toast({
          title: `Test "${subsystem}" réussi`,
          description: "Le sous-système fonctionne correctement",
        });
      }
    } catch (e) {
      console.error(`Erreur lors du test ${subsystem}:`, e);
      toast({
        title: `Erreur lors du test ${subsystem}`,
        description: e instanceof Error ? e.message : "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  // Group results by status
  const successResults = results.filter(r => r.status === 'success');
  const warningResults = results.filter(r => r.status === 'warning');
  const errorResults = results.filter(r => r.status === 'error');
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Diagnostic système
        </CardTitle>
        <CardDescription>
          Vérifiez l'état de tous les composants et connexions du système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="connections">Connexions</TabsTrigger>
            <TabsTrigger value="tests">Tests spécifiques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            {results.length > 0 ? (
              <div className="space-y-4">
                {errorResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-red-500 font-semibold flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Erreurs ({errorResults.length})
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {errorResults.map((result, i) => (
                        <AccordionItem key={`error-${i}`} value={`error-${i}`}>
                          <AccordionTrigger className="text-red-500">
                            {result.name}: {result.message}
                          </AccordionTrigger>
                          <AccordionContent>
                            <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
                
                {warningResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-yellow-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Avertissements ({warningResults.length})
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {warningResults.map((result, i) => (
                        <AccordionItem key={`warning-${i}`} value={`warning-${i}`}>
                          <AccordionTrigger className="text-yellow-500">
                            {result.name}: {result.message}
                          </AccordionTrigger>
                          <AccordionContent>
                            <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
                
                {successResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-green-500 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Succès ({successResults.length})
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {successResults.map((result, i) => (
                        <AccordionItem key={`success-${i}`} value={`success-${i}`}>
                          <AccordionTrigger className="text-green-500">
                            {result.name}: {result.message}
                          </AccordionTrigger>
                          <AccordionContent>
                            <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isRunning ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Analyse du système en cours...</p>
                  </div>
                ) : (
                  <p>Cliquez sur "Exécuter le diagnostic" pour démarrer</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="connections">
            <div className="space-y-4">
              <h3 className="font-medium">Vérification des URLs</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(urlChecks).map(([url, isAccessible]) => (
                  <div key={url} className="flex items-center gap-2 p-2 border rounded">
                    {isAccessible ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{url}</span>
                  </div>
                ))}
              </div>
              
              {Object.keys(urlChecks).length === 0 && !isRunning && (
                <p className="text-center py-4 text-gray-500">
                  Aucune URL vérifiée. Exécutez le diagnostic complet.
                </p>
              )}
              
              {isRunning && (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Vérification des connexions...</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="tests">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => runTestForSubsystem('ai')}
                  disabled={isRunning}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2"
                >
                  <span>Tester le service IA local</span>
                  <span className="text-xs text-gray-500">
                    Vérifie la connexion avec le service d'IA local
                  </span>
                </Button>
                
                <Button 
                  onClick={() => runTestForSubsystem('database')}
                  disabled={isRunning}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2"
                >
                  <span>Tester la base de données</span>
                  <span className="text-xs text-gray-500">
                    Vérifie la connexion avec Supabase et les politiques RLS
                  </span>
                </Button>
                
                <Button 
                  onClick={() => checkCriticalUrls().then(setUrlChecks)}
                  disabled={isRunning}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center gap-2"
                >
                  <span>Tester les URLs critiques</span>
                  <span className="text-xs text-gray-500">
                    Vérifie l'accessibilité des pages principales
                  </span>
                </Button>
              </div>
              
              {isRunning && (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Test en cours...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-sm text-gray-500">
          {results.length > 0 && (
            <span>
              {successResults.length} succès, {warningResults.length} avertissements, {errorResults.length} erreurs
            </span>
          )}
        </div>
        <Button onClick={runDiagnostic} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Diagnostic en cours...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Exécuter le diagnostic complet
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
