
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { GoogleDriveConnection } from "./GoogleDriveConnection";
import { IndexingProgress } from "./IndexingProgress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GoogleDriveConfig = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const startIndexing = async (folderId: string) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      await supabase.from('indexing_progress').upsert({
        user_id: user.id,
        total_files: 0,
        processed_files: 0,
        status: 'running'
      });

      const { error } = await supabase.functions.invoke('batch-index-google-drive', {
        body: { 
          folderId,
          userId: user.id
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
        description: error instanceof Error ? error.message : "Impossible de démarrer l'indexation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au chat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Google Drive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <GoogleDriveConnection onFolderSelect={startIndexing} />
          {user && <IndexingProgress userId={user.id} />}
        </CardContent>
      </Card>
    </div>
  );
};
