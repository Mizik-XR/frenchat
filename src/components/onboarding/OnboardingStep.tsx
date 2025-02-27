
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export interface OnboardingStepProps {
  title: string;
  description: string;
  image?: string;
  index: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  description,
  image,
  index,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  icon,
  children,
}) => {
  const isFirstStep = index === 0;
  const isLastStep = index === totalSteps - 1;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-2 max-w-lg w-full mx-auto">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            {icon && <div className="text-primary">{icon}</div>}
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
          
          {image && (
            <div className="w-full rounded-md overflow-hidden mb-4 border border-gray-200">
              <img src={image} alt={title} className="w-full h-auto" />
            </div>
          )}
          
          <p className="text-gray-600 mb-4">{description}</p>
          
          {children}
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {index + 1} / {totalSteps}
            </div>
            
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onPrevious}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </Button>
              )}
              
              {isLastStep ? (
                <Button 
                  onClick={onComplete}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Terminer
                </Button>
              ) : (
                <Button 
                  onClick={onNext}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
