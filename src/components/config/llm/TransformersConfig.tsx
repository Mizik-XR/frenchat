
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Braces, Code, FileCode, Info, Settings2 } from 'lucide-react';
import { AIConfig, ServiceType } from '@/types/config';

export function TransformersConfig() {
  const navigate = useNavigate();
  const [installStatus, setInstallStatus] = useState('unknown');
  const [type, setType] = useState<"local" | "huggingface">("local");
  const [modelPath, setModelPath] = useState('');
  const [modelId, setModelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTested, setLastTested] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier l'état d'installation du serveur Transformers
    checkServerStatus();
    // Charger la configuration sauvegardée
    loadConfig();
  }, []);

  const checkServerStatus = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-model-availability');
      
      if (error) throw error;
      
      if (data.status === 'available') {
        setInstallStatus('installed');
      } else {
        setInstallStatus('not_installed');
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'installation:", error);
      setInstallStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ai_configs')
        .select('*')
        .eq('provider', 'local')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = pas de résultats
        throw error;
      }

      if (data) {
        setType(data.config?.type || 'local');
        setModelPath(data.config?.modelPath || '');
        setModelId(data.config?.modelId || '');
        setLastTested(data.config?.last_tested || null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
    }
  };

  const saveConfig = async () => {
    try {
      setIsLoading(true);

      // Récupérer l'utilisateur actuel
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder la configuration",
          variant: "destructive",
        });
        return;
      }

      const configData = {
        provider: 'local' as ServiceType,
        model_name: type === 'local' ? 'transformers-local' : modelId,
        api_endpoint: '',
        config: {
          type,
          last_tested: new Date().toISOString(),
          ...(type === 'local' ? { modelPath } : { modelId })
        }
      };

      const { error } = await supabase
        .from('user_ai_configs')
        .upsert({
          ...configData,
          user_id: userData.user.id
        }, {
          onConflict: 'provider,user_id'
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres de Transformers ont été mis à jour"
      });

      setLastTested(new Date().toISOString());
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/config")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Configuration de Hugging Face Transformers</CardTitle>
          <CardDescription>
            Utilisez des modèles d'IA locaux basés sur Transformers. Choisissez entre exécuter les modèles localement ou via l'API Hugging Face.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {installStatus === 'not_installed' && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Serveur Transformers non détecté</AlertTitle>
              <AlertDescription>
                Le serveur de modèles Transformers ne semble pas être installé ou en cours d'exécution.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2"
                  onClick={() => window.open('https://github.com/votre-repo/docs/installation.md', '_blank')}
                >
                  Voir les instructions d'installation
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {installStatus === 'error' && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Erreur de connexion</AlertTitle>
              <AlertDescription>
                Impossible de vérifier l'état du serveur Transformers. Vérifiez votre connexion et que le serveur est en cours d'exécution.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="deploy" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-8">
              <TabsTrigger value="deploy" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Mode de déploiement
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Configuration avancée
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="deploy">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Mode d'exécution</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value as "local" | "huggingface")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Exécution locale (recommandé)</SelectItem>
                      <SelectItem value="huggingface">API Hugging Face (cloud)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {type === 'local' 
                      ? "Exécutez les modèles localement sur votre machine pour une confidentialité maximale." 
                      : "Utilisez l'API Hugging Face pour accéder aux modèles sans installation locale."}
                  </p>
                </div>

                <Separator />

                {type === 'local' ? (
                  <div className="space-y-4">
                    <Label>Chemin du modèle local</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Chemin vers le dossier du modèle"
                        value={modelPath}
                        onChange={(e) => setModelPath(e.target.value)}
                      />
                      <Button variant="outline" onClick={() => {}} disabled={true}>
                        <FileCode className="h-4 w-4 mr-2" />
                        Parcourir
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Spécifiez le chemin vers le dossier contenant votre modèle local.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label>ID du modèle Hugging Face</Label>
                    <Input
                      placeholder="mistralai/Mistral-7B-Instruct-v0.1"
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Spécifiez l'ID du modèle Hugging Face à utiliser via l'API.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="config">
              <Alert>
                <Braces className="h-4 w-4" />
                <AlertTitle>Configuration avancée</AlertTitle>
                <AlertDescription>
                  Ces paramètres permettent un contrôle précis du comportement des modèles Transformers.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                <p className="text-sm text-gray-600">
                  La configuration avancée sera disponible prochainement.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {lastTested && `Dernière configuration: ${new Date(lastTested).toLocaleString()}`}
          </div>
          <Button 
            onClick={saveConfig} 
            disabled={isLoading || (type === 'local' && !modelPath) || (type === 'huggingface' && !modelId)}
          >
            {isLoading ? "Sauvegarde en cours..." : "Sauvegarder la configuration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
