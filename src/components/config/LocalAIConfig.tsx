
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfoIcon } from "lucide-react";

export const LocalAIConfig = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'IA Locale (Ollama)</CardTitle>
          <CardDescription>
            Exécutez des modèles d'IA localement sur votre machine pour plus de contrôle et de confidentialité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Ollama vous permet d'exécuter des modèles comme Llama 2 ou Mistral localement sur votre ordinateur.
            </AlertDescription>
          </Alert>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="installation">
              <AccordionTrigger>1. Installation d'Ollama</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Téléchargez et installez Ollama depuis le site officiel :</p>
                  <Button variant="outline" className="w-full" onClick={() => window.open("https://ollama.ai/download", "_blank")}>
                    Télécharger Ollama
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="model">
              <AccordionTrigger>2. Choix du modèle</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Choisissez un modèle à utiliser :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Llama 2</strong> - Modèle polyvalent et performant</li>
                    <li><strong>Mistral</strong> - Excellent rapport performance/ressources</li>
                    <li><strong>Phi-2</strong> - Léger et rapide</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="usage">
              <AccordionTrigger>3. Utilisation</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Pour démarrer un modèle, ouvrez un terminal et exécutez :</p>
                  <pre className="bg-slate-100 p-2 rounded">ollama run llama2</pre>
                  <p>L'application se connectera automatiquement au modèle local.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
