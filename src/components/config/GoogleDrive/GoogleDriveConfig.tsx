
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { GoogleDriveConnection } from "./GoogleDriveConnection";
import { IndexingProgress } from "./IndexingProgress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GoogleDriveConfig = () => {
  const { user } = useAuth();

  const startIndexing = async (folderId: string) => {
    try {
      const { error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: { 
          folderId,
          userId: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Indexation démarrée",
        description: "L'indexation de vos fichiers Google Drive a commencé"
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de l'indexation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Google Drive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleDriveConnection onFolderSelect={startIndexing} />
        {user && <IndexingProgress userId={user.id} />}
      </CardContent>
    </Card>
  );
};
