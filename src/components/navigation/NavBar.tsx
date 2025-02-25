
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FileText, Cloud, ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickConfig } from "@/components/config/QuickConfig";
import { LocalAIConfig } from "@/components/config/llm/LocalAIConfig";
import { useNavigate, useLocation } from "react-router-dom";

export function NavBar() {
  const [currentSheet, setCurrentSheet] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Cloud,
      label: "Google Drive",
      id: "drive",
      tooltip: "Configuration Google Drive",
      content: <QuickConfig />,
      fullConfigPath: "/config"
    },
    {
      icon: FileText,
      label: "Documents",
      id: "docs",
      tooltip: "Gestion des documents",
      content: <QuickConfig />,
      fullConfigPath: "/config"
    },
    {
      icon: BrainCircuit,
      label: "IA",
      id: "ai",
      tooltip: "Configuration de l'IA",
      content: <LocalAIConfig />,
      fullConfigPath: "/config/local-ai"
    }
  ];

  const handleFullConfig = (path: string) => {
    setCurrentSheet(null);
    navigate(path);
  };

  return (
    <nav className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/chat" className="text-xl font-bold hover:opacity-80 transition-opacity">
            Files Chat
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            {navItems.map((item) => (
              <Sheet 
                key={item.id}
                open={currentSheet === item.id}
                onOpenChange={(open) => setCurrentSheet(open ? item.id : null)}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`transition-all duration-200 ${currentSheet === item.id ? "bg-accent" : "hover:bg-accent/50"}`}
                      >
                        <item.icon className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      {location.pathname.startsWith('/config') && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(-1)}
                          className="hover:bg-accent/50"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      {item.label}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    {item.content}
                  </div>
                  <SheetFooter>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-accent/50 transition-colors"
                      onClick={() => handleFullConfig(item.fullConfigPath)}
                    >
                      Configuration avancée
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            ))}
          </TooltipProvider>
          
          <UserAvatar />
        </div>
      </div>
    </nav>
  );
}
