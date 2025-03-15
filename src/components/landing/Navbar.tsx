
import { Button } from "@/components/ui/button";
import { LogoImage } from "../common/LogoImage";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface NavbarProps {
  onJoinBeta?: () => void;
}

export default function Navbar({ onJoinBeta }: NavbarProps) {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <LogoImage className="h-8 w-8" />
          <span className="text-white font-bold text-xl">Frenchat</span>
        </div>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-gray-300 hover:text-white hover:bg-white/10">
                Sections
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-black/90 backdrop-blur-md border border-white/10">
                <ul className="grid w-[200px] p-2 gap-1">
                  {[
                    { id: "features", name: "Fonctionnalités" },
                    { id: "best-practices", name: "Bonnes pratiques" },
                    { id: "installation", name: "Installation" },
                    { id: "system-requirements", name: "Prérequis système" },
                    { id: "guide", name: "Guide" }
                  ].map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        {section.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <nav className="hidden md:flex items-center space-x-6">
          <a 
            href="#features" 
            className="text-gray-300 hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('features');
            }}
          >
            Fonctionnalités
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="text-white border-white/20 hover:bg-white/10"
            onClick={onJoinBeta}
          >
            Rejoindre la Beta
          </Button>
        </div>
      </div>
      
      {/* Menu déroulant mobile */}
      <div className="md:hidden px-4 py-2 border-t border-white/10">
        <div className="relative">
          <button 
            className="flex items-center justify-between w-full py-2 px-3 text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
            onClick={() => {
              const mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
              }
            }}
          >
            <span>Sections</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          
          <div id="mobile-menu" className="hidden absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-md border border-white/10 rounded-md overflow-hidden z-50">
            <ul className="py-1">
              {[
                { id: "features", name: "Fonctionnalités" },
                { id: "best-practices", name: "Bonnes pratiques" },
                { id: "installation", name: "Installation" },
                { id: "system-requirements", name: "Prérequis système" },
                { id: "guide", name: "Guide" }
              ].map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      scrollToSection(section.id);
                      const mobileMenu = document.getElementById('mobile-menu');
                      if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    {section.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
