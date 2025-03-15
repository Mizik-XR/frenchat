
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/toast"; // Utilisation de notre système de toast corrigé
import { LovableIntegrationTester } from "./LovableIntegrationTester";

export const ToastTester = () => {
  const testToast = (variant: "default" | "destructive" | "success" | "warning" = "default") => {
    toast({
      title: `Test Toast (${variant})`,
      description: "Ceci est un toast de test pour vérifier que les notifications fonctionnent correctement.",
      variant: variant,
    });
  };

  const testError = () => {
    toast({
      title: "Erreur",
      description: "Ceci est un message d'erreur de test.",
      variant: "destructive",
    });
  };

  const testSuccess = () => {
    toast({
      title: "Succès",
      description: "L'opération a été complétée avec succès.",
      variant: "success",
    });
  };

  const testWarning = () => {
    toast({
      title: "Avertissement",
      description: "Attention, cette action pourrait avoir des conséquences.",
      variant: "warning",
    });
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-md border">
      <div>
        <h3 className="text-lg font-medium mb-4">Tests des notifications</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => testToast()} size="sm">Toast Normal</Button>
          <Button onClick={testError} variant="destructive" size="sm">Toast Erreur</Button>
          <Button onClick={testSuccess} className="bg-green-600 hover:bg-green-700" size="sm">Toast Succès</Button>
          <Button onClick={testWarning} className="bg-amber-500 hover:bg-amber-600" size="sm">Toast Avertissement</Button>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <LovableIntegrationTester />
      </div>
    </div>
  );
};
