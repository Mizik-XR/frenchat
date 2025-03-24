
import React from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  scrollToSection: (id: string) => void;
  onJoinBeta: () => void;
}

export function MobileMenu({ isOpen, scrollToSection, onJoinBeta }: MobileMenuProps) {
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden bg-black/90 backdrop-blur-md">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Button onClick={() => scrollToSection('features')} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
          Fonctionnalités
        </Button>
        <Button onClick={() => scrollToSection('roadmap')} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Roadmap
        </Button>
        <Button onClick={() => scrollToSection('best-practices')} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
          Bonnes pratiques
        </Button>
        <Button onClick={() => scrollToSection('installation')} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
          Installation
        </Button>
        <Button onClick={() => scrollToSection('system-requirements')} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
          Prérequis
        </Button>
        <Button onClick={() => scrollToSection('guide')} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
          Guide
        </Button>
        <Button onClick={onJoinBeta} className="w-full bg-blue-600 hover:bg-blue-700">
          Rejoindre la Beta
        </Button>
      </div>
    </div>
  );
}
