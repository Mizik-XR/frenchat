
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/steps";
import { useAuth } from "@/components/AuthProvider";
import { GoogleDriveSetup } from "../GoogleDriveSetup";
import { GoogleDriveAlert } from "./GoogleDriveAlert";
import { GoogleDriveConnection } from "./GoogleDriveConnection";
import { useGoogleDrive } from "./useGoogleDrive";

interface WizardStep {
  title: string;
  description: string;
}

const wizardSteps: WizardStep[] = [
  {
    title: "Connexion à Google Drive",
    description: "Autorisez l'accès à vos documents Google Drive"
  },
  {
    title: "Vérification",
    description: "Confirmation de la connexion"
  }
];

export const GoogleDriveWizard = ({
  onConfigSave,
  onSkip
}: {
  onConfigSave: () => void;
  onSkip: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const { user } = useAuth();

  const {
    isConnecting,
    clientId,
    isConnected,
    initiateGoogleAuth,
    fetchClientId
  } = useGoogleDrive(user, onConfigSave);

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetchClientId();
  };

  return (
    <div className="space-y-6">
      <GoogleDriveAlert isConnected={isConnected} />

      <Steps
        steps={wizardSteps.map(step => step.title)}
        currentStep={currentStep}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{wizardSteps[currentStep].title}</CardTitle>
          <CardDescription>{wizardSteps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSetup ? (
            <GoogleDriveSetup onConfigured={handleSetupComplete} />
          ) : (
            <GoogleDriveConnection
              isConnected={isConnected}
              isConnecting={isConnecting}
              clientId={clientId}
              onConnect={initiateGoogleAuth}
              onShowSetup={() => setShowSetup(true)}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onSkip}>
          Configurer plus tard
        </Button>
        {showSetup && (
          <Button variant="outline" onClick={() => setShowSetup(false)}>
            Retour
          </Button>
        )}
      </div>
    </div>
  );
};
