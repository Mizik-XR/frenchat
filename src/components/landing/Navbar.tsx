
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link to={href} className="text-gray-300 hover:text-white transition-colors relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-white to-red-600 transition-all group-hover:w-full" />
    </Link>
  );
}

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
    >
      <Link to="/" className="flex items-center space-x-2">
        <MessageSquare className="w-8 h-8 text-blue-600" />
        <span className="text-white font-medium text-xl">Frenchat</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        <NavLink href="/features">Fonctionnalités</NavLink>
        <NavLink href="/how-it-works">Comment ça marche</NavLink>
        <NavLink href="/examples">Exemples</NavLink>
        <NavLink href="/pricing">Tarifs</NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" className="text-white hover:text-blue-400" asChild>
          <Link to="/auth">Connexion</Link>
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
          <Link to="/config">Démarrer</Link>
        </Button>
      </div>

      <Button variant="ghost" size="icon" className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </Button>
    </motion.nav>
  );
}
