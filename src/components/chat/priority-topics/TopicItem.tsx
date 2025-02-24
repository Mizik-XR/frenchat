
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
      className={`p-4 rounded-lg border transition-all duration-200 ease-in-out hover:bg-gray-50 hover:shadow-sm 
        ${topic.isArchived 
          ? 'bg-gray-50/80 border-gray-200' 
          : topic.isCompleted
            ? 'bg-green-50/80 border-green-100'
            : 'bg-white border-gray-100'
        }
        animate-fade-in`}
    >
      <div 
        className="flex items-start gap-3 mb-3 cursor-pointer group"
        onClick={() => onSelect(topic.messageId)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {topic.isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-500 transition-colors" />
            ) : topic.isArchived ? (
              <Archive className="h-4 w-4 text-gray-400 transition-colors" />
            ) : (
              <AlertTriangle className={`h-4 w-4 transition-colors ${getPriorityColor(topic.priority)}`} />
            )}
            <h3 className="font-medium line-clamp-1 group-hover:text-blue-600 transition-colors">
              {topic.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors">
            {topic.content}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Badge 
          variant="secondary" 
          className="text-xs bg-gray-100/80 hover:bg-gray-200 transition-colors"
        >
          {formatTimestamp(topic.timestamp)}
        </Badge>
        <div className="flex gap-1 opacity-80 hover:opacity-100 transition-opacity">
          {!topic.isArchived && !topic.isCompleted && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onQuote(topic.content)}
                className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onArchive(topic.id)}
                className="hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onComplete(topic.id)}
                className="hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(topic.id)}
            className="hover:bg-red-50 hover:text-red-600 transition-all"
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
