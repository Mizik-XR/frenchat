
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DocumentProviderSelector } from "@/components/documents/DocumentProviderSelector";
import { FolderIndexingSelector } from "@/components/documents/FolderIndexingSelector";

export default function Documents() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/chat")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour au chat
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Gestionnaire de Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Sources de documents</h2>
            <DocumentProviderSelector />
            <FolderIndexingSelector />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
