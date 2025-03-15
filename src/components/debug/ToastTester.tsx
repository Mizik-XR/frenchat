
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ToastTester = () => {
  const { toast } = useToast();

  const showDefaultToast = () => {
    toast({
      title: "Toast par défaut",
      description: "Ceci est un toast par défaut sans variante spécifiée",
    });
  };

  const showSuccessToast = () => {
    toast({
      title: "Succès",
      description: "L'opération a été effectuée avec succès",
      variant: "success",
    });
  };

  const showWarningToast = () => {
    toast({
      title: "Avertissement",
      description: "Attention, cette action pourrait avoir des conséquences",
      variant: "warning",
    });
  };

  const showErrorToast = () => {
    toast({
      title: "Erreur",
      description: "Une erreur s'est produite lors de l'opération",
      variant: "destructive",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Testeur de Toasts</CardTitle>
        <CardDescription>
          Cliquez sur les boutons ci-dessous pour tester les différents types de toasts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={showDefaultToast} variant="outline">
            Toast par défaut
          </Button>
          <Button onClick={showSuccessToast} variant="outline" className="border-green-500 text-green-500 hover:bg-green-50">
            Toast de succès
          </Button>
          <Button onClick={showWarningToast} variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-50">
            Toast d'avertissement
          </Button>
          <Button onClick={showErrorToast} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
            Toast d'erreur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

