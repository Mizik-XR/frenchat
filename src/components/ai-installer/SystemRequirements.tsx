
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, HelpCircle, AlertTriangle, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemRequirementsProps {
  onContinue: () => void;
}

export function SystemRequirements({ onContinue }: SystemRequirementsProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Prérequis système</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Avant de procéder à l'installation, assurez-vous que votre système répond aux exigences suivantes :
            </p>
          </div>
          
          <Tabs defaultValue="windows">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="mac">macOS</TabsTrigger>
              <TabsTrigger value="linux">Linux</TabsTrigger>
            </TabsList>
            
            <TabsContent value="windows" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Windows 10/11 64-bit</p>
                    <p className="text-sm text-gray-500">Windows 10 version 1909 ou ultérieure, ou Windows 11</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Droits administrateur</p>
                    <p className="text-sm text-gray-500">Nécessaire pour l'installation d'Ollama</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Minimum 8 Go de RAM</p>
                    <p className="text-sm text-gray-500">16 Go ou plus recommandés pour de meilleures performances</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">10 Go d'espace disque libre</p>
                    <p className="text-sm text-gray-500">Pour l'installation d'Ollama et du modèle IA</p>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  L'installation sur Windows peut nécessiter de désactiver temporairement l'antivirus.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="mac" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">macOS 12 (Monterey) ou ultérieur</p>
                    <p className="text-sm text-gray-500">Compatible avec Intel et Apple Silicon (M1/M2/M3)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Minimum 8 Go de RAM</p>
                    <p className="text-sm text-gray-500">16 Go ou plus recommandés pour de meilleures performances</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">10 Go d'espace disque libre</p>
                    <p className="text-sm text-gray-500">Pour l'installation d'Ollama et du modèle IA</p>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  Les Mac avec Apple Silicon (M1/M2/M3) offrent des performances significativement meilleures pour l'IA locale.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="linux" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Ubuntu 20.04+ / Debian 11+ / Fedora 35+</p>
                    <p className="text-sm text-gray-500">Autres distributions Linux compatibles avec Docker</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Minimum 8 Go de RAM</p>
                    <p className="text-sm text-gray-500">16 Go ou plus recommandés pour de meilleures performances</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">10 Go d'espace disque libre</p>
                    <p className="text-sm text-gray-500">Pour l'installation d'Ollama et du modèle IA</p>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  Pour une performance optimale avec un GPU NVIDIA, assurez-vous que les pilotes CUDA sont installés.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          <div className="pt-4 flex justify-end">
            <Button onClick={onContinue}>
              Continuer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
