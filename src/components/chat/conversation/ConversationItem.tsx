
import { useState } from "react";
import { MessageSquare, Pin, PinOff, Pencil, Archive, RefreshCw, Trash2, FileText } from "lucide-react";
import { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  onExportToDoc?: () => void;
  onEdit?: (title: string) => void;
  onMoveToFolder?: (folderId: string | null) => void;
  isArchived?: boolean;
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
  onPin,
  onArchive,
  onRestore,
  onDelete,
  onExportToDoc,
  onEdit,
  onMoveToFolder,
  isArchived = false
}: ConversationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('conversation_id', conversation.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleExportToDoc = async () => {
    try {
      if (onExportToDoc) {
        await onExportToDoc();
        toast({
          title: "Export réussi",
          description: "La conversation a été exportée vers Google Docs"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter la conversation vers Google Docs",
        variant: "destructive"
      });
    }
  };

  return (
    <div
      className={`group rounded-lg flex items-center gap-2 ${
        isSelected
          ? 'bg-blue-100 text-blue-900'
          : 'hover:bg-gray-100'
      } ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <button
        onClick={onClick}
        className="flex-1 p-2 text-left flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4 shrink-0" />
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              if (title !== conversation.title && onEdit) {
                onEdit(title);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <div className="truncate">{conversation.title}</div>
        )}
      </button>
      
      <div className="opacity-0 group-hover:opacity-100 flex items-center pr-2 space-x-1">
        <TooltipProvider>
          {!isArchived && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Renommer</p>
                </TooltipContent>
              </Tooltip>

              {onPin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={onPin}
                    >
                      {conversation.isPinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{conversation.isPinned ? "Désépingler" : "Épingler"}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {onArchive && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={onArchive}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Archiver</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {onExportToDoc && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleExportToDoc}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exporter vers Google Docs</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}

          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isArchived && onRestore && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onRestore}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restaurer</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
};
