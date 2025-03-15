
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { isLocalDevelopment } from "@/services/apiConfig";

export const DatabaseConfig = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const handleOpenConsole = () => {
    if (isLocalDevelopment()) {
      // Utilisez une URL absolue avec https:// pour éviter les problèmes de navigation
      window.open("https://supabase.com/dashboard/project/dbdueopvtlanxgumenpu", "_blank");
    } else {
      toast({
        title: "Accès limité",
        description: "L'accès direct à la base de données est désactivé en production.",
        variant: "destructive",
      });
    }
  };

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
          <Button variant="outline" className="w-full" onClick={handleOpenConsole}>
            Ouvrir la console Supabase
          </Button>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {isLocalDevelopment() ? "(Mode développement uniquement)" : "(Accès restreint en production)"}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
