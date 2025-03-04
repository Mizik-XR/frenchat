
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LogoImage } from '@/components/common/LogoImage';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useDemo } from '../DemoContext';
import { STAGE_DESCRIPTIONS } from '../constants';
import { Link } from 'react-router-dom';

interface DemoLayoutProps {
  children: React.ReactNode;
}

export const DemoLayout: React.FC<DemoLayoutProps> = ({ children }) => {
  const { currentStage, nextStage, prevStage, progress } = useDemo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="border-b dark:border-gray-700 p-4 bg-white dark:bg-gray-950 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoImage className="h-8 w-8" />
            <h1 className="text-xl font-bold">FileChat Demo</h1>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{STAGE_DESCRIPTIONS[currentStage]}</h2>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            {children}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStage}
              disabled={currentStage === 'intro'}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            <Button 
              onClick={nextStage}
              disabled={currentStage === 'conclusion'}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          FileChat Demo - Version {import.meta.env.VITE_LOVABLE_VERSION || '1.0.0'}
        </div>
      </footer>
    </div>
  );
};
