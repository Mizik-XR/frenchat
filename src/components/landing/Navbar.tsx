
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../ThemeToggle";
import { NavbarLogo } from './NavbarLogo';
import { DesktopMenu } from './DesktopMenu';
import { MobileMenu } from './MobileMenu';

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
            <NavbarLogo />
          </div>
          
          <DesktopMenu scrollToSection={scrollToSection} onJoinBeta={onJoinBeta} />
          
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

      <MobileMenu 
        isOpen={isMenuOpen} 
        scrollToSection={scrollToSection} 
        onJoinBeta={onJoinBeta} 
      />
    </nav>
  );
}
