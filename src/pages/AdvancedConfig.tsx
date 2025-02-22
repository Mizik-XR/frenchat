import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ConfigHeader } from "@/components/config/ConfigHeader";
import { FileJson, MessageSquare, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { GoogleDriveConfig } from "@/components/config/GoogleDrive/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";
import { LLMConfigComponent } from "@/components/config/LLMConfig";
import { ImageConfig } from "@/components/config/ImageConfig";
import { toast } from "@/hooks/use-toast";

interface ServiceCard {
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

export function AdvancedConfig() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleBack = () => navigate("/");

  const services: ServiceCard[] = [
    {
      title: "Google Drive",
      description: "Gérez l'accès à vos documents Google Drive",
      icon: FileJson,
      component: <GoogleDriveConfig />
    },
    {
      title: "Microsoft Teams",
      description: "Configurez l'intégration avec Microsoft Teams",
      icon: MessageSquare,
      component: (
        <MicrosoftTeamsConfig
          onSave={() => {
            setSelectedService(null);
            toast({
              title: "Configuration mise à jour",
              description: "Les paramètres Microsoft Teams ont été sauvegardés.",
            });
          }}
        />
      )
    },
    {
      title: "Modèle de Langage (LLM)",
      description: "Paramétrez le modèle de langage pour l'analyse",
      icon: AlertCircle,
      component: (
        <LLMConfigComponent
          onSave={() => {
            setSelectedService(null);
            toast({
              title: "Configuration mise à jour",
              description: "Les paramètres LLM ont été sauvegardés.",
            });
          }}
        />
      )
    },
    {
      title: "Génération d'Images",
      description: "Configurez les paramètres de Stable Diffusion",
      icon: Image,
      component: (
        <ImageConfig
          onSave={() => {
            setSelectedService(null);
            toast({
              title: "Configuration mise à jour",
              description: "Les paramètres de génération d'images ont été sauvegardés.",
            });
          }}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <ConfigHeader onBack={handleBack} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Dialog open={selectedService === service.title} onOpenChange={(open) => {
                  if (!open) setSelectedService(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedService(service.title)}
                    >
                      Configurer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{service.title}</DialogTitle>
                    </DialogHeader>
                    {service.component}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
