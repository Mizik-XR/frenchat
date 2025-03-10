
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { ArrowLeft, LogOut } from "lucide-react";

interface ConfigHeaderProps {
  onBack?: () => void;
}

export const ConfigHeader = ({ onBack }: ConfigHeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/home");
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Configuration</h1>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </div>
  );
};
