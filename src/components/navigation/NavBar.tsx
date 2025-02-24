
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavBar() {
  return (
    <nav className="w-full bg-background border-b pl-64">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div />
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/config/local-ai">Configuration IA Locale</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/config/cloud-ai">Configuration IA Cloud</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurer les modèles d'IA</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <UserAvatar />
        </div>
      </div>
    </nav>
  );
}
