
import { useState, useEffect  } from '@/core/reactInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  FileText, 
  ChartPie, 
  Table, 
  Image, 
  AlertCircle, 
  Cpu, 
  Cloud, 
  RefreshCw 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface AdaptiveAIChatProps {
  onModeChange: (mode: string) => void;
  onComplexityDetected: (isComplex: boolean) => void;
}

export function AdaptiveAIChat({ onModeChange, onComplexityDetected }: AdaptiveAIChatProps) {
  const [mode, setMode] = useState("chat");
  const [processingMode, setProcessingMode] = useState<"local" | "cloud" | "switching">("local");
  const [isComplex, setIsComplex] = useState(false);
  
  // Simuler la détection de complexité basée sur le mode sélectionné
  useEffect(() => {
    // Simuler que certains modes sont plus complexes
    const complexModes = ["document", "chart", "table", "image"];
    const newIsComplex = complexModes.includes(mode);
    
    if (newIsComplex !== isComplex) {
      setIsComplex(newIsComplex);
      onComplexityDetected(newIsComplex);
      
      // Basculer automatiquement entre les modes local et cloud
      if (newIsComplex && processingMode === "local") {
        setProcessingMode("switching");
        setTimeout(() => {
          setProcessingMode("cloud");
          toast({
            title: "Mode cloud activé",
            description: "Basculement automatique vers le cloud pour cette tâche complexe."
          });
        }, 1500);
      } else if (!newIsComplex && processingMode === "cloud") {
        setProcessingMode("switching");
        setTimeout(() => {
          setProcessingMode("local");
          toast({
            title: "Mode local activé",
            description: "Retour au traitement local pour économiser vos crédits."
          });
        }, 1500);
      }
    }
  }, [mode, isComplex, processingMode, onComplexityDetected]);
  
  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    onModeChange(newMode);
  };
  
  return (
    <Card className="border-gray-800 bg-gray-900/60 mb-4">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList className="bg-gray-800/60">
              <TabsTrigger value="chat" className="data-[state=active]:bg-gray-700">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="document" className="data-[state=active]:bg-gray-700">
                <FileText className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Document</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="data-[state=active]:bg-gray-700">
                <ChartPie className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Graphique</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="data-[state=active]:bg-gray-700">
                <Table className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Tableau</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-gray-700">
                <Image className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Image</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            {processingMode === "switching" ? (
              <Button variant="ghost" size="sm" className="gap-1 animate-pulse" disabled>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs">Basculement...</span>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                setProcessingMode(processingMode === "local" ? "cloud" : "local");
              }}>
                {processingMode === "local" ? (
                  <>
                    <Cpu className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs">Local</span>
                  </>
                ) : (
                  <>
                    <Cloud className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs">Cloud</span>
                  </>
                )}
              </Button>
            )}
            
            {isComplex && (
              <div className="flex items-center gap-1 text-yellow-400 text-xs bg-yellow-950/30 px-2 py-0.5 rounded">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tâche complexe</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
