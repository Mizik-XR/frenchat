
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UserAvatar = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.email 
    ? user.email.substring(0, 2).toUpperCase()
    : "??";

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    await signOut();
  };

  const handleConfigClick = () => {
    setIsOpen(false);
    navigate('/config');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 animate-fade-in">
        <div className="flex items-center justify-start gap-2 p-2">
          <UserRound className="h-4 w-4" />
          <p className="text-sm font-medium">{user.email}</p>
        </div>
        <DropdownMenuItem
          onClick={handleConfigClick}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configuration
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 cursor-pointer hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
