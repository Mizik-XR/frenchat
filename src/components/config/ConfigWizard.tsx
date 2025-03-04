
import { Button } from "@/components/ui/button";
import { WelcomeStep } from "./steps/WelcomeStep";
import { SummaryStep } from "./steps/SummaryStep";
import { useConfigWizard } from "@/hooks/useConfigWizard";
import { WizardNavigation } from "./wizard/WizardNavigation";
import { SourcesStep } from "./wizard/SourcesStep";
import { IntelligenceStep } from "./wizard/IntelligenceStep";
import { NavigationButtons } from "./wizard/NavigationButtons";

export const ConfigWizard = () => {
  const {
    currentStep,
    configStatus,
    importMethod,
    modelPath,
    provider,
    handleLLMSave,
    handleImportMethodChange,
    handleDirectNavigation,
    handleSkipToChat,
    handleNext,
    handleSkip,
    handleStepClick,
    updateLLMConfig,
    updateProviderType,
    updateImageConfigStatus
  } = useConfigWizard();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <WelcomeStep onNext={handleNext} />
            <div className="mt-4 text-right">
              <Button 
                variant="ghost" 
                onClick={handleSkipToChat}
              >
                Ignorer et aller directement au chat
              </Button>
            </div>
          </>
        );
      case 1:
        return (
          <SourcesStep
            selectedMethod={importMethod}
            onMethodChange={handleImportMethodChange}
            onNavigate={handleDirectNavigation}
          />
        );
      case 2:
        return (
          <IntelligenceStep
            modelPath={modelPath}
            onModelPathChange={updateLLMConfig}
            provider={provider}
            onProviderChange={updateProviderType}
            onLLMSave={handleLLMSave}
            onImageConfigSave={updateImageConfigStatus}
          />
        );
      case 3:
        return <SummaryStep configStatus={configStatus} onFinish={handleNext} />;
      default:
        return null;
    }
  };

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 0);
    handleStepClick(prevStep);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <WizardNavigation 
        currentStep={currentStep} 
        onStepClick={handleStepClick} 
      />

      {renderCurrentStep()}

      <NavigationButtons
        currentStep={currentStep}
        maxSteps={4}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
      />
    </div>
  );
};
