
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ConfigWizard } from "@/components/config/ConfigWizard";
import { 
  Settings, 
  FileStack, 
  Database, 
  BrainCircuit, 
  Layers, 
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

export default function Config() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  // Simuler une progression au chargement de la page
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(75); // Supposons que l'utilisateur a déjà complété 75% de la configuration
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Configuration</h1>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progression de la configuration</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="w-full h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Paramètres de base</span>
          <span>Sources de données</span>
          <span>Intelligence</span>
          <span>Finalisation</span>
        </div>
      </div>
      
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
            <CardTitle>Sources de données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="documents">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileStack className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Gestion des documents</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Importer, organiser et gérer vos documents pour l'analyse IA.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/documents")}
                  >
                    Configurer les documents
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Intelligence artificielle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="search">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Search className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Recherche intelligente</span>
                    {progress < 50 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Recommandé</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Configurez les options de recherche avancée pour des résultats plus précis.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/rag-advanced-settings")}
                  >
                    Configurer la recherche
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dashboard">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Layers className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Tableau de bord</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Surveillez les performances de l'application et l'utilisation des ressources.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/monitoring")}
                  >
                    Consulter le tableau de bord
                  </Button>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="database">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <Database className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span>Base de données</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Accédez à la console Supabase pour gérer directement votre base de données.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                  >
                    Ouvrir la console Supabase
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Options supplémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Settings className="h-5 w-5 text-amber-600" />
                    </div>
                    <span>Paramètres avancés</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Configurez des options avancées pour personnaliser le comportement de l'application.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/advanced-config")}
                  >
                    Configurer les options avancées
                  </Button>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="brain">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <BrainCircuit className="h-5 w-5 text-red-600" />
                    </div>
                    <span>Configuration IA</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Options avancées pour configurer les modèles d'intelligence artificielle.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/advanced-config")}
                  >
                    Configurer l'IA
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
