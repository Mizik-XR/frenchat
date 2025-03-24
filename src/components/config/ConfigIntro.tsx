
import React from '@/core/reactInstance';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, FileCheck, FolderOpen, Settings } from 'lucide-react';

const ConfigSteps = [
  {
    icon: <Settings className="h-8 w-8 text-primary" />,
    title: "Configuration du modèle",
    description: "Choisissez le modèle d'IA et configurez ses paramètres"
  },
  {
    icon: <FolderOpen className="h-8 w-8 text-primary" />,
    title: "Sources de données",
    description: "Connectez vos comptes Google Drive ou Microsoft Teams"
  },
  {
    icon: <FileCheck className="h-8 w-8 text-primary" />,
    title: "Indexation",
    description: "Indexez vos documents pour les rendre accessibles à l'IA"
  }
];

const ConfigIntro = () => {
  return (
    <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 border-none shadow-md">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configuration de FileChat</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connectez vos sources de données et configurez l'IA pour commencer à utiliser FileChat
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {ConfigSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                {step.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{step.description}</p>
              
              {index < ConfigSteps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-3">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigIntro;
