
import React from '@/core/reactInstance';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DriveAuthCheckProps {
  isConnected: boolean;
}

export function DriveAuthCheck({ isConnected }: DriveAuthCheckProps) {
  const navigate = useNavigate();
  
  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connexion à Google Drive requise</CardTitle>
          <CardDescription>
            Veuillez vous connecter à Google Drive pour accéder à cette fonctionnalité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/config/google-drive")}>
            Se connecter à Google Drive
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return null;
}
