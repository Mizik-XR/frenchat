
import { WizardStep } from "@/hooks/useConfigWizard";
import { Steps } from "@/components/ui/steps";

interface WizardNavigationProps {
  currentStep: WizardStep;
  onStepClick: (step: number) => void;
}

// Main steps of the wizard
const STEPS = [
  { title: "Welcome", description: "Initial application setup" },
  { title: "Sources", description: "Import your documents" },
  { title: "Intelligence", description: "AI Configuration" },
  { title: "Finalization", description: "Final verification" }
];

export const WizardNavigation = ({ currentStep, onStepClick }: WizardNavigationProps) => {
  return (
    <div className="mb-8">
      <Steps
        steps={STEPS.map(s => s.title)}
        currentStep={currentStep}
        onStepClick={onStepClick}
      />
    </div>
  );
};
