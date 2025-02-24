
import { Link, useLocation } from "react-router-dom";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FileText, Cloud, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      icon: Cloud,
      label: "Google Drive",
      path: "/config/google-drive",
      tooltip: "Configuration Google Drive"
    },
    {
      icon: FileText,
      label: "Documents",
      path: "/config/documents",
      tooltip: "Gestion des documents"
    },
    {
      icon: BrainCircuit,
      label: "IA",
      path: "/config/ai",
      tooltip: "Configuration de l'IA"
    },
    {
      icon: Settings,
      label: "Paramètres",
      path: "/config",
      tooltip: "Paramètres généraux"
    }
  ];

  return (
    <nav className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/chat" className="text-xl font-bold">
            Files Chat
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="icon"
                    asChild
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          
          <UserAvatar />
        </div>
      </div>
    </nav>
  );
}
