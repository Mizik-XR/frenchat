
import React from '@/core/reactInstance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const MicrosoftTeamsConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Microsoft Teams</CardTitle>
        <CardDescription>
          Connectez votre compte Microsoft Teams pour accéder à vos fichiers et conversations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          L'intégration avec Microsoft Teams vous permet d'indexer vos documents et conversations pour les rendre accessibles via la recherche.
        </p>
        <Button variant="outline">Connecter Microsoft Teams</Button>
      </CardContent>
    </Card>
  );
};
