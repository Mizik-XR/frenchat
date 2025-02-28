
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function NavigationControls() {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate(-1);
  };
  
  const goForward = () => {
    navigate(1);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={goBack}
        className="rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Retour"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Retour</span>
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={goForward}
        className="rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Avancer"
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Avancer</span>
      </Button>
    </div>
  );
}
