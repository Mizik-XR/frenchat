
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Loader, HelpCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentSummaryProps {
  text: string;
  maxLength?: number;
  minLength?: number;
  onSummaryGenerated?: (summary: string) => void;
}

export function DocumentSummary({
  text,
  maxLength = 150,
  minLength = 40,
  onSummaryGenerated
}: DocumentSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-summary', {
        body: { 
          text,
          maxLength,
          minLength
        }
      });

      if (error) throw error;

      setSummary(data.summary);
      if (onSummaryGenerated) {
        onSummaryGenerated(data.summary);
      }

      toast({
        title: "Résumé généré",
        description: "Le résumé a été généré avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le résumé. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Résumé du document
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ce résumé est généré par un modèle T5 de Hugging Face.</p>
                <p>Le modèle est open source et gratuit.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <Button 
          onClick={generateSummary} 
          disabled={isLoading || !text}
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Générer un résumé
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {summary && (
          <div className="rounded-md bg-muted p-4">
            <Label className="mb-2 block text-sm font-medium">Résumé généré :</Label>
            <p className="text-sm">{summary}</p>
          </div>
        )}
        {!summary && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Cliquez sur le bouton pour générer un résumé automatique du document.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
