
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SystemCapabilitiesCardProps {
  capabilities: any;
  isAnalyzing: boolean;
  analyzeSystem: () => void;
}

export const SystemCapabilitiesCard = ({ 
  capabilities, 
  isAnalyzing, 
  analyzeSystem 
}: SystemCapabilitiesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacités système</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Mémoire RAM:</p>
            <p className="text-lg">{capabilities.memoryGB ? `${capabilities.memoryGB} GB` : 'Non détecté'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Processeur:</p>
            <p className="text-lg">{capabilities.cpuCores ? `${capabilities.cpuCores} cœurs` : 'Non détecté'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">GPU:</p>
            <p className="text-lg">{capabilities.gpuAvailable ? 'Disponible' : 'Non disponible'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Catégorie système:</p>
            <p className="text-lg">
              {capabilities.isHighEndSystem ? 'Haute performance' : 
               capabilities.isMidEndSystem ? 'Performance moyenne' : 'Performance de base'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Modèles recommandés:</p>
            <ul className="list-disc pl-5">
              {capabilities.recommendedModels.map((model: string, index: number) => (
                <li key={index}>{model}</li>
              ))}
            </ul>
          </div>
          <Button onClick={analyzeSystem} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyse en cours...' : 'Analyser à nouveau'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
