
import { Pin, PinOff, Pencil, Archive, RefreshCw, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Conversation } from "@/types/chat";

interface ConversationButtonsProps {
  conversation: Conversation;
  isArchived: boolean;
  onEdit: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  onExportToDoc?: () => void;
  handleExportToDoc: () => Promise<void>;
}

export const ConversationButtons = ({
  conversation,
  isArchived,
  onEdit,
  onPin,
  onArchive,
  onRestore,
  onDelete,
  onExportToDoc,
  handleExportToDoc
}: ConversationButtonsProps) => {
  return (
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
                  onClick={onEdit}
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
  );
};
