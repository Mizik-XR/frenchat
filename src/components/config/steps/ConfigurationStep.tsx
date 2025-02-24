
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Database,
  Bot,
  Image,
  BrainCircuit,
  FileText,
  ArrowRight
} from "lucide-react";

interface ConfigStepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isConfigured?: boolean;
}

const ConfigStep = ({ title, description, icon, href, isConfigured }: ConfigStepProps) => {
  const navigate = useNavigate();

  return (
    <Card className="relative hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          {isConfigured && (
            <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
              Configuré
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        <Button 
          className="w-full flex items-center justify-between"
          onClick={() => navigate(href)}
        >
          Configurer
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export function ConfigurationStep() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ConfigStep
          title="Modèles d'IA"
          description="Configuration des modèles locaux et cloud pour l'analyse et la génération"
          icon={<BrainCircuit className="h-5 w-5 text-purple-500" />}
          href="/config/local-ai"
        />
        
        <ConfigStep
          title="Google Drive"
          description="Connectez et indexez vos documents Google Drive"
          icon={<Database className="h-5 w-5 text-blue-500" />}
          href="/config/google-drive"
        />

        <ConfigStep
          title="Microsoft Teams"
          description="Intégration avec Microsoft Teams pour la collaboration"
          icon={<Bot className="h-5 w-5 text-cyan-500" />}
          href="/config/teams"
        />

        <ConfigStep
          title="Génération d'Images"
          description="Configuration des modèles de génération d'images"
          icon={<Image className="h-5 w-5 text-pink-500" />}
          href="/config/image"
        />

        <ConfigStep
          title="Documents"
          description="Gestion des documents et paramètres d'indexation"
          icon={<FileText className="h-5 w-5 text-orange-500" />}
          href="/documents"
        />

        <ConfigStep
          title="Paramètres Avancés"
          description="Configuration avancée et optimisation"
          icon={<Settings className="h-5 w-5 text-gray-500" />}
          href="/config/advanced"
        />
      </div>
    </div>
  );
}
