
import { cn } from "@/lib/utils";

interface StepsProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Steps = ({ steps, currentStep, onStepClick }: StepsProps) => {
  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex items-center"
          onClick={() => onStepClick?.(index)}
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
              currentStep === index
                ? "border-primary bg-primary text-primary-foreground"
                : index < currentStep
                ? "border-primary bg-primary/20 text-primary"
                : "border-input bg-background"
            )}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8",
                index < currentStep ? "bg-primary" : "bg-input"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
