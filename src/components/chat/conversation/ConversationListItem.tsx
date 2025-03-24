
import React from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ConversationListItemProps {
  conversation: any;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRenameClick: (event: React.MouseEvent, conversation: any) => void;
  onDeleteClick: (event: React.MouseEvent, id: string) => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  onSelect,
  onRenameClick,
  onDeleteClick,
}: ConversationListItemProps) {
  return (
    <div 
      className={`flex items-center mb-1 group ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => onSelect(conversation.id)}
      >
        {conversation.title}
      </Button>
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={(e) => onRenameClick(e, conversation)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive"
          onClick={(e) => onDeleteClick(e, conversation.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
