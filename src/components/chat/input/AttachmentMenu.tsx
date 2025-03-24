
import React from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Paperclip, Upload, FileSearch, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AttachmentMenuProps {
  onAttach: (type: string) => void;
}

export function AttachmentMenu({ onAttach }: AttachmentMenuProps) {
  const handleAttachment = (type: string) => {
    onAttach(type);
    toast({
      title: "Fonctionnalité connectée",
      description: `L'option "${type}" est maintenant disponible.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Paperclip className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleAttachment("upload")}>
          <Upload className="mr-2 h-4 w-4" />
          <span>Importer un fichier</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAttachment("drive")}>
          <FileSearch className="mr-2 h-4 w-4" />
          <span>Rechercher sur Google Drive</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAttachment("image")}>
          <Image className="mr-2 h-4 w-4" />
          <span>Créer une image ou un schéma</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
