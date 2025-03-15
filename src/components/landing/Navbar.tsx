
import { useState, useEffect } from 'react';
import { Menu, X, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../ThemeToggle";

interface NavbarProps {
  onJoinBeta: () => void;
}

export default function Navbar({ onJoinBeta }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-black/70 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/favicon.ico" alt="filechat" />
              <span className="ml-2 text-white font-bold text-lg">filechat</span>
            </div>
          </div>
          
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
          
          <div className="flex md:hidden">
            <ModeToggle />
            <Button 
              onClick={toggleMenu} 
              variant="ghost" 
              size="icon" 
              className="text-white"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
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
      )}
    </nav>
  );
}
