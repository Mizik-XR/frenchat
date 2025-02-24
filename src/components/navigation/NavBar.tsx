
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/auth/UserAvatar";

export function NavBar() {
  return (
    <nav className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="font-semibold text-lg">Lovable</div>
          <Link 
            to="/documents" 
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <FileText className="h-4 w-4 mr-1" />
            Documents
          </Link>
        </div>
        <UserAvatar />
      </div>
    </nav>
  );
}
