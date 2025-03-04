
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { STAGE_DETAILS } from '../constants';
import { useDemo } from '../DemoContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/config/ImportMethod/FileUploader';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import { HelpCircle, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

export const ConfigStage = () => {
  const { currentStage, nextStage } = useDemo();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [configCompleted, setConfigCompleted] = useState(false);
  const [configProgress, setConfigProgress] = useState(0);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setConfigProgress(33);
    
    toast({
      title: `${method} sélectionné`,
      description: "Configuration en cours..."
    });
    
    // Simuler une progression de configuration
    setTimeout(() => {
      setConfigProgress(66);
      
      setTimeout(() => {
        setConfigProgress(100);
        setConfigCompleted(true);
        
        toast({
          title: "Configuration terminée",
          description: `${method} a été configuré avec succès`
        });
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4">Configuration des sources</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {STAGE_DETAILS[currentStage]}
        </p>
      </div>

      {!selectedMethod ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="hover:shadow-md cursor-pointer transition-all border-2 hover:border-blue-400"
            onClick={() => handleMethodSelect('Google Drive')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FcGoogle className="h-6 w-6" />
                Google Drive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Indexez des documents depuis votre Google Drive.
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="hover:shadow-md cursor-pointer transition-all border-2 hover:border-blue-400"
            onClick={() => handleMethodSelect('Microsoft Teams')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BsMicrosoft className="h-5 w-5 text-blue-500" />
                Microsoft Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Indexez des documents depuis Microsoft Teams.
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="hover:shadow-md cursor-pointer transition-all border-2 hover:border-blue-400"
            onClick={() => handleMethodSelect('Upload Local')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Upload Local
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Importez des documents depuis votre ordinateur.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Configuration de {selectedMethod}</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">
                    Dans la démo, la configuration est simulée. Dans l'application réelle, 
                    vous configurez les permissions d'accès à vos documents.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{configProgress}%</span>
              </div>
              <Progress value={configProgress} className="h-2" />
            </div>
            
            {selectedMethod === 'Upload Local' && configProgress < 100 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <FileUploader
                  onFilesSelected={() => {}}
                  maxSize={10}
                  accept={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc', '.docx'],
                    'text/plain': ['.txt']
                  }}
                />
              </div>
            )}
            
            {configCompleted && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Configuration terminée avec succès</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {selectedMethod} est maintenant configuré. Vous pouvez procéder à l'indexation des documents.
                </p>
                
                <Button className="mt-4" onClick={nextStage}>
                  Passer à l'indexation
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
