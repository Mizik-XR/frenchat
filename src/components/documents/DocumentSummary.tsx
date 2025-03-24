
import { useState  } from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DocumentSummaryProps {
  documentId: string;
  title: string;
  metadata?: {
    summary?: string;
    generated_at?: string;
  };
}

export function DocumentSummary({ documentId, title, metadata }: DocumentSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(metadata?.summary);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { documentId }
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Résumé généré avec succès",
        description: "Le résumé du document a été créé et sauvegardé."
      });
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le résumé",
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
        </CardTitle>
        {metadata?.generated_at && (
          <span className="text-xs text-muted-foreground">
            Généré le {new Date(metadata.generated_at).toLocaleDateString()}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <FileText className="h-4 w-4 inline-block mr-2" />
              {title}
            </div>
            <div className="prose prose-sm max-w-none" 
                 dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateSummary}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                'Régénérer le résumé'
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Button
              onClick={generateSummary}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                'Générer un résumé'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
