import { React, useState } from '@/core/ReactInstance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from '@/components/config/ImportMethod/FileUploader';
import { GoogleDriveConfig } from '@/components/config/GoogleDrive/GoogleDriveConfig';
import { GoogleDriveAdvancedConfig } from '@/components/config/GoogleDrive/GoogleDriveAdvancedConfig';
import { MicrosoftTeamsConfig } from '@/components/config/MicrosoftTeams/MicrosoftTeamsConfig';
import { APIKeyConfig } from '@/components/config/APIKeyConfig';
import { ModelSelector } from '@/components/config/ModelSelector';
import { toast } from '@/hooks/use-toast';

const Config: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    huggingface: "",
    anthropic: ""
  });
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [isUploading, setIsUploading] = useState(false);

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const handleSaveGeneral = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos paramètres généraux ont été mis à jour."
    });
  };

  const handleSaveModels = () => {
    toast({
      title: "Configuration des modèles sauvegardée",
      description: "Vos préférences de modèles ont été mises à jour."
    });
  };

  const handleFilesSelected = async (files: File[]) => {
    setIsUploading(true);
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
    toast({
      title: "Fichiers importés",
      description: `${files.length} fichier(s) ont été importés avec succès.`
    });
  };

  const handleStartIndexing = (recursive: boolean) => {
    toast({
      title: "Indexation démarrée",
      description: `L'indexation ${recursive ? 'récursive' : 'simple'} a été lancée.`
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configuration</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le thème sombre pour l'interface
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Sélectionner une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveGeneral}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <GoogleDriveConfig />
            <MicrosoftTeamsConfig />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import de fichiers</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFilesSelected={handleFilesSelected}
                loading={isUploading}
              />
            </CardContent>
          </Card>

          <GoogleDriveAdvancedConfig
            connected={true}
            onIndexingRequest={handleStartIndexing}
          />
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clés API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <APIKeyConfig
                provider="OpenAI"
                value={apiKeys.openai}
                onChange={(value) => handleApiKeyChange("openai", value)}
              />
              <APIKeyConfig
                provider="Hugging Face"
                value={apiKeys.huggingface}
                onChange={(value) => handleApiKeyChange("huggingface", value)}
              />
              <APIKeyConfig
                provider="Anthropic"
                value={apiKeys.anthropic}
                onChange={(value) => handleApiKeyChange("anthropic", value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sélection des modèles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
              />
              <Button onClick={handleSaveModels}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-tokens">Tokens maximum</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  placeholder="4096"
                  defaultValue="4096"
                />
                <p className="text-xs text-muted-foreground">
                  Nombre maximum de tokens pour les requêtes API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Température</Label>
                <Input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                />
                <p className="text-xs text-muted-foreground">
                  Contrôle la créativité des réponses (0 = déterministe, 1 = créatif)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="stream">Streaming des réponses</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher les réponses au fur et à mesure
                  </p>
                </div>
                <Switch
                  id="stream"
                  defaultChecked={true}
                />
              </div>

              <Button>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Config;
