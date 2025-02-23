
import { MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConversationTitleProps {
  title: string;
  isEditing: boolean;
  onClick: () => void;
  onTitleChange: (value: string) => void;
  onBlur: () => void;
}

export const ConversationTitle = ({
  title,
  isEditing,
  onClick,
  onTitleChange,
  onBlur
}: ConversationTitleProps) => {
  return (
    <button
      onClick={onClick}
      className="flex-1 p-2 text-left flex items-center gap-2"
    >
      <MessageSquare className="h-4 w-4 shrink-0" />
      {isEditing ? (
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onBlur}
          onClick={(e) => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <div className="truncate">{title}</div>
      )}
    </button>
  );
};
