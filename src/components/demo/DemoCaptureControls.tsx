
import React from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Download, Loader2 } from "lucide-react";
import { DemoCaptureControlsProps } from './types';

export const DemoCaptureControls: React.FC<DemoCaptureControlsProps> = ({
  generating,
  complete,
  startCapture,
}) => {
  return (
    <>
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
    </>
  );
};
