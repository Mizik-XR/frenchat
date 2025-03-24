
import React, { useEffect } from '@/core/reactInstance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RagAdvancedConfig } from "@/components/config/RagAdvancedConfig";
import { toast } from "@/hooks/use-toast";

export default function RagAdvancedSettings() {
  const navigate = useNavigate();

  useEffect(() => {
    // Notification à l'utilisateur que cette fonctionnalité est nouvelle
    toast({
      title: "Configuration RAG avancée",
      description: "Cette nouvelle fonctionnalité vous permet d'optimiser le système RAG avec un chunking intelligent et des modèles d'embedding spécialisés.",
    });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/config")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la configuration
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configuration RAG avancée</CardTitle>
        </CardHeader>
        <CardContent>
          <RagAdvancedConfig onSave={() => {
            toast({
              title: "Configuration sauvegardée",
              description: "Les paramètres RAG avancés ont été mis à jour avec succès",
            });
          }} />
        </CardContent>
      </Card>
    </div>
  );
}
