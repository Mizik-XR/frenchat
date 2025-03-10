
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoImage } from "@/components/common/LogoImage";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <Card className="p-6 animate-fade-in">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <LogoImage className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Welcome to Filechat!</h2>
        </div>
        <p className="text-muted-foreground">
          We'll guide you step by step through setting up your services.
          You can skip certain steps and come back to them later.
        </p>
        <Button onClick={onNext} className="w-full">
          Begin Setup
        </Button>
      </CardContent>
    </Card>
  );
};
