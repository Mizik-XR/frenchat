
import React from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';
import { ModeToggle } from "../ThemeToggle";

interface DesktopMenuProps {
  scrollToSection: (id: string) => void;
  onJoinBeta: () => void;
}

export function DesktopMenu({ scrollToSection, onJoinBeta }: DesktopMenuProps) {
  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-center space-x-4">
        <Button onClick={() => scrollToSection('features')} variant="ghost" className="text-gray-300 hover:text-white">
          Fonctionnalités
        </Button>
        <Button onClick={() => scrollToSection('roadmap')} variant="ghost" className="text-gray-300 hover:text-white flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Roadmap
        </Button>
        <Button onClick={() => scrollToSection('best-practices')} variant="ghost" className="text-gray-300 hover:text-white">
          Bonnes pratiques
        </Button>
        <Button onClick={() => scrollToSection('installation')} variant="ghost" className="text-gray-300 hover:text-white">
          Installation
        </Button>
        <Button onClick={() => scrollToSection('system-requirements')} variant="ghost" className="text-gray-300 hover:text-white">
          Prérequis
        </Button>
        <Button onClick={() => scrollToSection('guide')} variant="ghost" className="text-gray-300 hover:text-white">
          Guide
        </Button>
        <ModeToggle />
        <Button onClick={onJoinBeta} className="ml-2 bg-blue-600 hover:bg-blue-700">
          Rejoindre la Beta
        </Button>
      </div>
    </div>
  );
}
