
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TEST_TEXT = "Ceci est un texte d'exemple pour tester la génération de résumé. Le modèle devrait être capable de créer une version condensée de ce contenu.";

export default function AIConfig() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState("huggingface");
  const [modelName, setModelName] = useState("t5-small");
  const [testText, setTestText] = useState(DEFAULT_TEST_TEXT);
  const [summary, setSummary] = useState("");
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ai_configs')
        .select('*')
        .eq('config_type', 'local')
        .single();

      if (error) throw error;
      if (data) {
        setProvider(data.provider);
        setModelName(data.model_name || "t5-small");
        setConfig(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_ai_configs')
        .upsert({
          config_type: 'local',
          provider,
          model_name: modelName,
          settings: {
            max_length: 150,
            min_length: 40,
            do_sample: false
          }
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Vos paramètres IA ont été mis à jour avec succès."
      });

      await loadConfig();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSummary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-summary', {
        body: { text: testText }
      });

      if (error) throw error;
      setSummary(data.summary);

      toast({
        title: "Test réussi",
        description: "Le modèle de résumé fonctionne correctement"
      });
    } catch (error) {
      console.error("Erreur lors du test:", error);
      toast({
        title: "Erreur",
        description: "Le test a échoué. Vérifiez les logs pour plus de détails.",
        variant: "destructive"
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
          <CardTitle>Configuration du Modèle IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fournisseur</Label>
            <Select 
              value={provider} 
              onValueChange={setProvider}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="huggingface">Hugging Face (Local)</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Modèle</Label>
            <Select 
              value={modelName} 
              onValueChange={setModelName}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="t5-small">T5 Small (Résumé)</SelectItem>
                <SelectItem value="bart-large-cnn">BART CNN (Résumé)</SelectItem>
                <SelectItem value="facebook/bart-large-xsum">BART XSum (Résumé)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={saveConfig} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde en cours...
              </>
            ) : (
              'Sauvegarder la configuration'
            )}
          </Button>

          <div className="border-t pt-4 mt-6">
            <CardTitle className="text-lg mb-4">Tester le modèle</CardTitle>
            <div className="space-y-4">
              <div>
                <Label>Texte de test</Label>
                <Input
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="mt-2"
                  placeholder="Entrez un texte à résumer..."
                />
              </div>

              <Button 
                onClick={testSummary}
                disabled={isLoading || !testText}
                variant="outline"
              >
                Tester le résumé
              </Button>

              {summary && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <Label>Résumé généré :</Label>
                  <p className="mt-2 text-sm">{summary}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
