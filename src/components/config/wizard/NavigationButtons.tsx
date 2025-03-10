
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  maxSteps: number;
  onPrevious: () => void;
  onSkip: () => void;
}

export const NavigationButtons = ({ 
  currentStep, 
  maxSteps,
  onPrevious, 
  onSkip 
}: NavigationButtonsProps) => {
  if (currentStep === 0 || currentStep >= maxSteps - 1) return null;
  
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
      >
        Previous
      </Button>
      <Button variant="ghost" onClick={onSkip}>
        Skip this step
      </Button>
    </div>
  );
};
