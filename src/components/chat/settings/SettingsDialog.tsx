
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

export function SettingsDialog() {
  const handleSaveSettings = () => {
    toast({
      title: "Paramètres enregistrés",
      description: "Vos préférences ont été mises à jour.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>Configurez les paramètres de votre interface Frenchat.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="models">Modèles</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="history">Historique des conversations</Label>
                  <p className="text-sm text-muted-foreground">Conserver l'historique des conversations</p>
                </div>
                <Switch id="history" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">Activer les notifications</p>
                </div>
                <Switch id="notifications" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">Clé API OpenAI</Label>
                <Input id="api-key" placeholder="sk-..." type="password" />
                <p className="text-xs text-muted-foreground mt-1">Utilisée pour les modèles OpenAI en mode cloud</p>
              </div>

              <div>
                <Label htmlFor="model-path">Chemin du modèle local</Label>
                <Input id="model-path" placeholder="/chemin/vers/modele" />
                <p className="text-xs text-muted-foreground mt-1">Chemin vers le modèle local sur votre machine</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">Activer le mode sombre</p>
                </div>
                <Switch id="dark-mode" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact">Mode compact</Label>
                  <p className="text-sm text-muted-foreground">Réduire l'espacement entre les éléments</p>
                </div>
                <Switch id="compact" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="submit" onClick={handleSaveSettings}>Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
