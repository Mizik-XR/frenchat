
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { GoogleDriveConnectionStatus } from "@/components/GoogleDriveConnectionStatus";
import { UserCreditPanel } from "@/components/config/AIUsageMetrics/UserCreditPanel";
import { OllamaPromotion } from "@/components/ollama/OllamaPromotion";
import { 
  BookOpen, 
  MessageCircle, 
  Upload, 
  FileText, 
  Settings, 
  BarChart, 
  ArrowRight,
  Folder,
  Database,
  HelpCircle
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate('/chat');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">FileChat</h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Votre assistant d'intelligence documentaire qui connecte tous vos fichiers avec le pouvoir de l'IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">Bienvenue sur FileChat</h2>
                  <p className="text-muted-foreground mb-4">
                    Posez des questions à vos documents, générez du contenu et explorez vos fichiers grâce à l'intelligence artificielle.
                  </p>
                  <Button size="lg" onClick={handleGetStarted} className="gap-2">
                    Commencer une discussion <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-full md:w-1/3 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="/filechat-animation.gif" 
                    alt="FileChat Demo" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GoogleDriveConnectionStatus />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Documents indexés</span>
              </CardTitle>
              <CardDescription>
                Explorez et gérez vos documents indexés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Documents prêts pour l'analyse</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/indexing')}>
                Gérer les documents
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span>Conversations</span>
              </CardTitle>
              <CardDescription>
                Reprenez vos conversations avec l'IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Discussions actives</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/chat')}>
                Voir les conversations
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Commencer avec FileChat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Importer des fichiers</h3>
                    <p className="text-sm text-muted-foreground">
                      Téléchargez des fichiers pour les analyser avec l'IA
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => navigate('/indexing')}>
                  Importer <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Discuter avec l'IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Posez des questions sur vos documents
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => navigate('/chat')}>
                  Discuter <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Google Drive</h3>
                    <p className="text-sm text-muted-foreground">
                      Connectez et analysez vos fichiers Google Drive
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => navigate('/google-drive')}>
                  Connecter <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Créer un document</h3>
                    <p className="text-sm text-muted-foreground">
                      Générez des documents à partir de vos conversations
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => navigate('/document/new')}>
                  Créer <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Configuration IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Personnalisez vos modèles d'IA et paramètres
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => navigate('/config')}>
                  Configurer <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Aide et support</h3>
                    <p className="text-sm text-muted-foreground">
                      Consultez la documentation et obtenez de l'aide
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => navigate('/debug')}>
                  Aide <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Affichage des crédits IA utilisateur */}
        {user && <UserCreditPanel />}
        
        {/* Promotion Ollama */}
        <div className="mt-8">
          <OllamaPromotion />
        </div>
      </div>
    </div>
  );
}
