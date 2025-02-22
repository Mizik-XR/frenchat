
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { LogOut } from "lucide-react";

export function NavBar() {
  const { signOut } = useAuth();

  return (
    <nav className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="font-semibold text-lg">Lovable</div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </nav>
  );
}
