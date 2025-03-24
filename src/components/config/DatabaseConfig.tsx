
import { useState  } from '@/core/reactInstance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { isLocalDevelopment } from "@/services/apiConfig";
import { buildSupabaseConsoleUrl } from "@/utils/environment/urlUtils";
import { isUrlAccessible } from "@/utils/environment/urlUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const DatabaseConfig = () => {
  const [expanded, setExpanded] = useState(false);
  const [isUrlWorking, setIsUrlWorking] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);
  
  const supabaseUrl = buildSupabaseConsoleUrl("dbdueopvtlanxgumenpu");

  const handleOpenConsole = async () => {
    if (isLocalDevelopment()) {
      // Vérifier si l'URL est accessible avant d'ouvrir
      setIsChecking(true);
      try {
        const isAccessible = await isUrlAccessible(supabaseUrl);
        setIsUrlWorking(isAccessible);
        
        if (isAccessible) {
          window.open(supabaseUrl, "_blank");
        } else {
          toast({
            title: "URL inaccessible",
            description: "Impossible d'accéder à la console Supabase. Vérifiez votre connexion Internet.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setIsUrlWorking(false);
        toast({
          title: "Erreur de vérification",
          description: "Impossible de vérifier l'accessibilité de l'URL Supabase.",
          variant: "destructive",
        });
      } finally {
        setIsChecking(false);
      }
    } else {
      toast({
        title: "Accès limité",
        description: "L'accès direct à la base de données est désactivé en production.",
        variant: "destructive",
      });
    }
  };

  // Vérifier l'URL au chargement du composant
  useState(() => {
    if (isLocalDevelopment()) {
      isUrlAccessible(supabaseUrl).then(setIsUrlWorking).catch(() => setIsUrlWorking(false));
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 cursor-pointer" onClick={toggleExpanded}>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-medium">Base de données</CardTitle>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      
      {expanded && (
        <CardContent className="px-6 pb-4 pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Accédez à la console Supabase pour gérer directement votre base de données.
          </p>
          
          {isUrlWorking === false && (
            <Alert variant="default" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                L'URL de la console Supabase semble inaccessible. Vérifiez votre connexion Internet.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleOpenConsole}
            disabled={isChecking}
          >
            {isChecking ? "Vérification de l'accessibilité..." : "Ouvrir la console Supabase"}
          </Button>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {isLocalDevelopment() ? "(Mode développement uniquement)" : "(Accès restreint en production)"}
          </div>
          
          <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
            <p>URL: {supabaseUrl}</p>
            <p className="mt-1">Statut: {
              isUrlWorking === null ? "Non vérifié" :
              isUrlWorking ? "Accessible" : "Inaccessible"
            }</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
