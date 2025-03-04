
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from "@/components/navigation/PageHeader";
import { toast } from "@/hooks/use-toast";
import { DemoCapture } from '@/components/demo/DemoCapture';
import { DemoInstructions } from '@/components/demo/DemoInstructions';
import { PAGES_TO_CAPTURE } from '@/components/demo/constants';

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
      
      <DemoCapture
        pages={PAGES_TO_CAPTURE}
        generating={generating}
        progress={progress}
        currentPage={currentPage}
        complete={complete}
        capturedScreenshots={capturedScreenshots}
        startCapture={startCapture}
      />
      
      <DemoInstructions complete={complete} />
    </div>
  );
}
