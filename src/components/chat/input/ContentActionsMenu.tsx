
import { ImageIcon, BarChart3, Upload, Cloud, Paperclip } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ContentActionsMenuProps {
  isLoading: boolean;
  uploadInProgress: boolean;
  onGenerateImage: (type: 'illustration' | 'chart') => void;
  onToggleUploader: () => void;
  onUploadToDrive: () => void;
}

export function ContentActionsMenu({
  isLoading,
  uploadInProgress,
  onGenerateImage,
  onToggleUploader,
  onUploadToDrive
}: ContentActionsMenuProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white">
              <DropdownMenuItem onClick={() => onGenerateImage('illustration')}>
                <ImageIcon className="h-4 w-4 mr-2" />
                <span>Générer une image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateImage('chart')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>Générer un graphique</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleUploader}>
                <Upload className="h-4 w-4 mr-2" />
                <span>Depuis mon appareil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUploadToDrive} disabled={uploadInProgress}>
                <Cloud className="h-4 w-4 mr-2" />
                <span>Vers Google Drive</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Ajouter du contenu</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
