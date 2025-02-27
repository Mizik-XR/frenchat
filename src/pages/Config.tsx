
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ConfigWizard } from "@/components/config/ConfigWizard";
import { Settings, FileStack, Layers, Database, BrainCircuit } from "lucide-react";

export default function Config() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Configuration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuration rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigWizard />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Configurations avancées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/advanced-config")}
            >
              <span>Paramètres avancés</span>
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/documents")}
            >
              <span>Gestion des documents</span>
              <FileStack className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/rag-advanced-settings")}
            >
              <span className="flex items-center">
                Configuration RAG avancée
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Nouveau</span>
              </span>
              <BrainCircuit className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/monitoring")}
            >
              <span>Tableau de bord</span>
              <Layers className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            >
              <span>Base de données</span>
              <Database className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
