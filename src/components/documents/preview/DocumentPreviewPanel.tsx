
import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Download, Share, Check, AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

interface DocumentPreviewPanelProps {
  content: string;
  title: string;
  onExport?: (destination: 'drive' | 'teams') => Promise<void>;
  isLoading?: boolean;
  error?: string;
  onClose?: () => void;
}

export const DocumentPreviewPanel = ({
  content,
  title,
  onExport,
  isLoading,
  error,
  onClose
}: DocumentPreviewPanelProps) => {
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  const handleExport = async (destination: 'drive' | 'teams') => {
    if (!onExport) return;

    try {
      setIsExporting(true);
      await onExport(destination);
      toast({
        title: "Export réussi",
        description: `Le document a été exporté vers ${destination === 'drive' ? 'Google Drive' : 'Microsoft Teams'}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      console.error('Erreur lors de l\'export:', error);
      
      if (errorMessage.includes('Token') || errorMessage.includes('oauth')) {
        toast({
          title: "Erreur d'authentification",
          description: `Veuillez vous reconnecter à ${destination === 'drive' ? 'Google Drive' : 'Microsoft Teams'}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur lors de l'export",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header avec les contrôles */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-lg">{title}</h3>
          {error ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{error}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : isLoading ? (
            <div className="animate-pulse h-5 w-5 rounded-full bg-blue-100" />
          ) : (
            <Check className="h-5 w-5 text-green-500" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>

          {onExport && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('drive')}
                      disabled={isExporting || isLoading || !!error}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Drive
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exporter vers Google Drive</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('teams')}
                      disabled={isExporting || isLoading || !!error}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Teams
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exporter vers Microsoft Teams</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Zone de prévisualisation */}
      <ScrollArea className="flex-1 p-4">
        <div 
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-out'
          }}
          className="min-w-[600px] bg-white p-8 shadow-sm"
        >
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph || ' '}</p>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
