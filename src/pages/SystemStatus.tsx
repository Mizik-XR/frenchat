import React, { useEffect, useState } from 'react';
import { SystemDiagnostics } from '@/components/SystemDiagnostics';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft, Bug, Database, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { runSystemCheck } from '@/utils/systemDiagnostics';
import { useAuth } from '@/components/AuthProvider';
import { APP_STATE } from '@/compatibility/supabaseCompat';
import { supabase } from '@/integrations/supabase/client';

export default function SystemStatus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [environment, setEnvironment] = useState({
    isDev: false,
    isProd: false,
    isOffline: false,
    browserInfo: {} as any
  });
  
  // Récupérer les informations sur l'environnement au chargement
  useEffect(() => {
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
    const isProd = import.meta.env.PROD || window.location.hostname !== 'localhost';
    const isOffline = APP_STATE.isOfflineMode;
    
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      platform: navigator.platform,
      vendor: navigator.vendor,
      cookiesEnabled: navigator.cookieEnabled
    };
    
    setEnvironment({
      isDev,
      isProd,
      isOffline,
      browserInfo
    });
    
    // Exécuter un diagnostic initial
    runInitialDiagnostic();
  }, []);
  
  const runInitialDiagnostic = async () => {
    try {
      const results = await runSystemCheck();
      const errors = results.filter(r => r.status === 'error').length;
      
      if (errors > 0) {
        toast({
          title: `${errors} problème(s) détecté(s)`,
          description: "Consultez les détails pour plus d'informations",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors du diagnostic initial:", error);
    }
  };
  
  const handleToggleOfflineMode = () => {
    APP_STATE.setOfflineMode(!APP_STATE.isOfflineMode);
    setEnvironment(prev => ({
      ...prev,
      isOffline: !prev.isOffline
    }));
    
    toast({
      title: APP_STATE.isOfflineMode ? "Mode hors ligne activé" : "Mode hors ligne désactivé",
      description: "Rechargez la page pour appliquer les changements",
    });
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">État du système</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              Environnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-mono">
                  {environment.isDev ? 'Développement' : 'Production'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-mono">
                  {import.meta.env.VITE_LOVABLE_VERSION || '1.0.0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mode hors ligne:</span>
                <span className="font-mono">
                  {environment.isOffline ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={handleToggleOfflineMode}
                >
                  {environment.isOffline ? 'Désactiver' : 'Activer'} le mode hors ligne
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base de données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className="font-mono">
                  {environment.isOffline 
                    ? 'Hors ligne' 
                    : 'Connecté'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Utilisateur:</span>
                <span className="font-mono">
                  {user ? 'Authentifié' : 'Anonyme'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-mono max-w-[150px] truncate">
                  {user ? user.id : 'N/A'}
                </span>
              </div>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={() => navigate('/config')}
                >
                  Voir la configuration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Navigateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>En ligne:</span>
                <span className="font-mono">
                  {navigator.onLine ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Plateforme:</span>
                <span className="font-mono">
                  {environment.browserInfo.platform || navigator.platform}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Langue:</span>
                <span className="font-mono">
                  {environment.browserInfo.language || navigator.language}
                </span>
              </div>
              <div className="pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={() => console.log('Informations navigateur:', environment.browserInfo)}
                >
                  Voir détails (console)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SystemDiagnostics />
      
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Ces outils vous aident à diagnostiquer les problèmes de connexion et d'intégration.
          Si vous rencontrez des difficultés persistantes, veuillez contacter le support.
        </p>
      </div>
    </div>
  );
}
