
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConfigHeaderProps {
  onBack?: () => void;
}

export function ConfigHeader({ onBack }: ConfigHeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/chat");
    }
  };
  
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="icon" onClick={handleBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold text-gray-900">Configuration des API</h1>
    </div>
  );
}
