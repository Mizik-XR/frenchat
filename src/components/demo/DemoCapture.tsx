
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Presentation } from "lucide-react";
import { DemoProgress } from './DemoProgress';
import { DemoCaptureControls } from './DemoCaptureControls';
import { CapturedPagesList } from './CapturedPagesList';
import { PageToCaptureType } from './types';

interface DemoCaptureProps {
  pages: PageToCaptureType[];
  generating: boolean;
  progress: number;
  currentPage: string;
  complete: boolean;
  capturedScreenshots: string[];
  startCapture: () => void;
}

export const DemoCapture: React.FC<DemoCaptureProps> = ({
  pages,
  generating,
  progress,
  currentPage,
  complete,
  startCapture
}) => {
  return (
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
            <DemoProgress
              progress={progress}
              currentPage={currentPage}
              complete={complete}
            />
          )}
          
          <CapturedPagesList complete={complete} pages={pages} />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3">
        <DemoCaptureControls
          generating={generating}
          complete={complete}
          startCapture={startCapture}
        />
      </CardFooter>
    </Card>
  );
};
