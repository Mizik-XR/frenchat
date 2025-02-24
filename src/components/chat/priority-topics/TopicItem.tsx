
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  Archive,
  Trash2 
} from "lucide-react";

interface TopicItemProps {
  topic: {
    id: string;
    title: string;
    content: string;
    timestamp: Date;
    isCompleted: boolean;
    isArchived: boolean;
    priority: 'high' | 'medium' | 'low';
    messageId: string;
  };
  onSelect: (messageId: string) => void;
  onQuote: (content: string) => void;
  onArchive: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TopicItem({
  topic,
  onSelect,
  onQuote,
  onArchive,
  onComplete,
  onDelete
}: TopicItemProps) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all hover:bg-gray-50 ${
        topic.isArchived 
          ? 'bg-gray-50 border-gray-200' 
          : topic.isCompleted
            ? 'bg-green-50 border-green-100'
            : 'bg-white border-blue-100'
      }`}
    >
      <div className="flex items-start gap-3 mb-2">
        <div 
          className="cursor-pointer flex-1"
          onClick={() => onSelect(topic.messageId)}
        >
          <div className="flex items-center gap-2 mb-1">
            {topic.isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : topic.isArchived ? (
              <Archive className="h-4 w-4 text-gray-400" />
            ) : (
              <AlertTriangle className={`h-4 w-4 ${getPriorityColor(topic.priority)}`} />
            )}
            <span className="font-medium line-clamp-1">{topic.title}</span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{topic.content}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          {formatTimestamp(topic.timestamp)}
        </Badge>
        <div className="flex gap-1">
          {!topic.isArchived && !topic.isCompleted && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onQuote(topic.content)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onArchive(topic.id)}
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onComplete(topic.id)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(topic.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-orange-500';
    case 'low': return 'text-blue-500';
  }
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(date);
}
