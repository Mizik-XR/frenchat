
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FileText, Cloud, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickConfig } from "@/components/config/QuickConfig";
import { AIConfig } from "@/pages/AIConfig";
import { LocalAIConfig } from "@/components/config/llm/LocalAIConfig";

export function NavBar() {
  const [currentSheet, setCurrentSheet] = useState<string | null>(null);

  const navItems = [
    {
      icon: Cloud,
      label: "Google Drive",
      id: "drive",
      tooltip: "Configuration Google Drive",
      content: <QuickConfig />
    },
    {
      icon: FileText,
      label: "Documents",
      id: "docs",
      tooltip: "Gestion des documents",
      content: <QuickConfig />
    },
    {
      icon: BrainCircuit,
      label: "IA",
      id: "ai",
      tooltip: "Configuration de l'IA",
      content: <AIConfig />
    },
    {
      icon: Settings,
      label: "Paramètres",
      id: "settings",
      tooltip: "Paramètres généraux",
      content: <LocalAIConfig />
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
                        className={currentSheet === item.id ? "bg-accent" : ""}
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
                    <SheetTitle>{item.label}</SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    {item.content}
                  </div>
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
