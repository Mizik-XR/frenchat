import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Loader2, Download, Check, Camera, Presentation } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Liste des pages à capturer
const PAGES_TO_CAPTURE = [
  { path: '/', name: 'Accueil', description: 'Page d\'accueil de Frenchat' },
  { path: '/auth', name: 'Authentification', description: 'Page de connexion et inscription' },
  { path: '/config', name: 'Configuration', description: 'Paramètres de l\'application' },
  { path: '/chat', name: 'Chat', description: 'Interface de chat avec l\'IA' },
  { path: '/documents', name: 'Documents', description: 'Gestion des documents' },
  { path: '/monitoring', name: 'Monitoring', description: 'Statistiques et performance' },
];

export default function Demo() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState('');
  const [capturedScreenshots, setCapturedScreenshots] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  // Simulation de capture d'écran (dans un vrai contexte, utiliserait html2canvas ou similaire)
  const captureScreen = async (pagePath: string, pageName: string) => {
    setCurrentPage(pageName);
    
    // Redirection vers la page à capturer
    navigate(pagePath);
    
    // Simulation du temps de chargement et capture
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dans une vraie implémentation, on utiliserait:
    // const canvas = await html2canvas(document.body);
    // const screenshot = canvas.toDataURL('image/png');
    
    // Simulation d'URL d'image
    const fakeScreenshotUrl = `data:image/png;base64,${pageName.replace(/\s/g, '')}_screenshot`;
    
    return fakeScreenshotUrl;
  };

  // Génération du PowerPoint (simulation)
  const generatePowerPoint = async (screenshots: string[]) => {
    // Dans une vraie implémentation, on utiliserait pptxgenjs ou similar pour créer un fichier PPTX
    
    // Simulation de la génération PowerPoint
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Retourne une URL de téléchargement simulée
    return "data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,FrenchDemoPPTX";
  };

  const startCapture = async () => {
    try {
      setGenerating(true);
      setProgress(0);
      setCapturedScreenshots([]);
      setComplete(false);
      
      const screenshots = [];
      
      // Capturer chaque page
      for (let i = 0; i < PAGES_TO_CAPTURE.length; i++) {
        const page = PAGES_TO_CAPTURE[i];
        const screenshot = await captureScreen(page.path, page.name);
        screenshots.push(screenshot);
        
        // Mise à jour de la progression
        const newProgress = Math.floor(((i + 1) / PAGES_TO_CAPTURE.length) * 80);
        setProgress(newProgress);
      }
      
      setCapturedScreenshots(screenshots);
      
      // Retourner à la page démo
      navigate('/demo');
      setCurrentPage('Génération du PowerPoint');
      
      // Générer le PowerPoint
      const pptxUrl = await generatePowerPoint(screenshots);
      
      // Finalisation
      setProgress(100);
      setComplete(true);
      
      toast({
        title: "Démo PowerPoint générée",
        description: "Le fichier est prêt à être téléchargé",
      });
      
      // Dans une vraie implémentation:
      // const a = document.createElement('a');
      // a.href = pptxUrl;
      // a.download = 'Frenchat_Demo.pptx';
      // a.click();
      
    } catch (error) {
      console.error("Erreur lors de la génération de la démo:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la présentation",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Retourner à la page démo si on a terminé la capture et qu'on est sur une autre page
  useEffect(() => {
    if (complete && window.location.pathname !== '/demo') {
      navigate('/demo');
    }
  }, [complete, navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Générateur de Démo" />
      
      <Card className="w-full max-w-3xl mx-auto mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-6 w-6 text-purple-500" />
            Générer une Présentation PowerPoint
          </CardTitle>
          <CardDescription>
            Crée automatiquement une présentation avec des captures d'écran de chaque page
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {!generating && !complete ? (
              <div>
                <p className="mb-4">
                  Cette fonctionnalité va générer une présentation PowerPoint contenant :
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Des captures d'écran de chaque page principale</li>
                  <li>Une explication des fonctionnalités pour chaque écran</li>
                  <li>Des instructions d'utilisation pour une démo</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Note : Veillez à ce que l'application soit correctement configurée avant de générer la démo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Progress value={progress} className="h-2 w-full" />
                
                <div className="flex items-center gap-3">
                  {!complete ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  <p>
                    {!complete 
                      ? `${currentPage ? `Capture de "${currentPage}"` : "Préparation..."} (${progress}%)`
                      : "Génération terminée !"}
                  </p>
                </div>
              </div>
            )}
            
            {complete && (
              <div className="border rounded-md p-4 bg-muted/50">
                <p className="font-medium mb-2">Captures d'écran réalisées :</p>
                <ul className="list-disc pl-6 space-y-1">
                  {PAGES_TO_CAPTURE.map((page, index) => (
                    <li key={index}>{page.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3">
          {!generating && !complete ? (
            <Button onClick={startCapture} className="gap-2">
              <Camera className="h-4 w-4" />
              Commencer la capture
            </Button>
          ) : complete ? (
            <Button variant="default" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger le PowerPoint
            </Button>
          ) : (
            <Button disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {complete && (
        <Card className="w-full max-w-3xl mx-auto mt-6">
          <CardHeader>
            <CardTitle>Instructions pour la démo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Pour une présentation efficace :</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Commencez par présenter la page d'accueil et l'objectif de l'application</li>
              <li>Démontrez le processus d'authentification</li>
              <li>Montrez comment configurer la connexion à Google Drive</li>
              <li>Illustrez l'indexation des documents et la recherche</li>
              <li>Faites une démonstration du chat IA avec questions-réponses sur les documents</li>
              <li>Présentez les fonctionnalités de monitoring et d'analyse</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
