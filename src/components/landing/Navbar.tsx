
import { Button } from "@/components/ui/button";
import { LogoImage } from "../common/LogoImage";

interface NavbarProps {
  onJoinBeta?: () => void;
}

export default function Navbar({ onJoinBeta }: NavbarProps) {
  // Fonction pour faire défiler jusqu'à la section FAQ
  const scrollToFAQ = () => {
    const faqSection = document.getElementById('faq');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <LogoImage className="h-8 w-8" />
          <span className="text-white font-bold text-xl">Frenchat</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">
            Fonctionnalités
          </a>
          <a 
            href="#faq" 
            className="text-gray-300 hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToFAQ();
            }}
          >
            FAQ
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
    </header>
  );
}
