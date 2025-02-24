
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
import { useAuth } from "@/components/AuthProvider";

interface DocumentSummaryProps {
  text: string;
  documentId: string;
  maxLength?: number;
  minLength?: number;
  onSummaryGenerated?: (summary: string) => void;
}

export function DocumentSummary({
  text,
  documentId,
  maxLength = 150,
  minLength = 40,
  onSummaryGenerated
}: DocumentSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const { user } = useAuth();

  const saveSummary = async (summaryText: string) => {
    try {
      const { error } = await supabase
        .from('document_summaries')
        .upsert({
          user_id: user?.id,
          document_id: documentId,
          original_text: text,
          summary_text: summaryText,
          model_name: 't5-small'
        }, {
          onConflict: 'document_id,user_id'
        });

      if (error) throw error;

      toast({
        title: "Résumé sauvegardé",
        description: "Le résumé a été sauvegardé dans la base de données"
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du résumé:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Le résumé a été généré mais n'a pas pu être sauvegardé",
        variant: "destructive"
      });
    }
  };

  const loadExistingSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('document_summaries')
        .select('summary_text')
        .eq('document_id', documentId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Code pour "aucun résultat"
          throw error;
        }
        return null;
      }

      if (data) {
        setSummary(data.summary_text);
        return data.summary_text;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du résumé:', error);
    }
    return null;
  };

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      // D'abord, vérifier s'il existe déjà un résumé
      const existingSummary = await loadExistingSummary();
      if (existingSummary) {
        if (onSummaryGenerated) {
          onSummaryGenerated(existingSummary);
        }
        toast({
          title: "Résumé chargé",
          description: "Un résumé existant a été trouvé et chargé"
        });
        return;
      }

      // Si pas de résumé existant, en générer un nouveau
      const { data, error } = await supabase.functions.invoke('test-summary', {
        body: { 
          text,
          maxLength,
          minLength
        }
      });

      if (error) throw error;

      const newSummary = data.summary;
      setSummary(newSummary);
      
      // Sauvegarder le nouveau résumé
      await saveSummary(newSummary);

      if (onSummaryGenerated) {
        onSummaryGenerated(newSummary);
      }

      toast({
        title: "Résumé généré",
        description: "Le résumé a été généré et sauvegardé avec succès"
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
                <p>Les résumés sont sauvegardés pour une utilisation ultérieure.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <Button 
          onClick={generateSummary} 
          disabled={isLoading || !text || !documentId || !user}
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              {summary ? "Chargement..." : "Génération..."}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {summary ? "Regénérer le résumé" : "Générer un résumé"}
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
