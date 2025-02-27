
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <Card className="p-6 animate-fade-in">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <img 
            src="/filechat-animation.gif" 
            alt="FileChat Logo" 
            className="h-6 w-6"
          />
          <h2 className="text-2xl font-semibold">Bienvenue dans FileChat !</h2>
        </div>
        <p className="text-muted-foreground">
          Nous allons vous guider pas à pas dans la configuration de vos services.
          Vous pourrez ignorer certaines étapes et y revenir plus tard.
        </p>
        <Button onClick={onNext} className="w-full">
          Commencer la configuration
        </Button>
      </CardContent>
    </Card>
  );
};
