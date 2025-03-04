
import { WizardStep } from "@/hooks/useConfigWizard";
import { Steps } from "@/components/ui/steps";

interface WizardNavigationProps {
  currentStep: WizardStep;
  onStepClick: (step: number) => void;
}

// Les étapes principales du wizard
const STEPS = [
  { title: "Bienvenue", description: "Configuration initiale de l'application" },
  { title: "Sources", description: "Importation de vos documents" },
  { title: "Intelligence", description: "Configuration de l'IA" },
  { title: "Finalisation", description: "Vérification finale" }
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
