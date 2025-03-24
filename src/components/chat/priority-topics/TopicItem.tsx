
// Updating the TopicItem component to use number for timestamp instead of Date
import React from '@/core/reactInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, CheckSquare, MessageSquare, Trash, Quote } from "lucide-react";
import { formatMessageTimestamp } from "./utils";

interface Topic {
  id: string;
  title: string;
  timestamp: number;
  isCompleted: boolean;
  isArchived: boolean;
  priority: 'high' | 'medium' | 'low';
  messageId: string;
  content: string;
}

interface TopicItemProps {
  topic: Topic;
  onSelect: (messageId: string) => void;
  onArchive: (topicId: string) => void;
  onComplete: (topicId: string) => void;
  onDelete: (topicId: string) => void;
  onQuote?: (content: string) => void;
}

export function TopicItem({
  topic,
  onSelect,
  onArchive,
  onComplete,
  onDelete,
  onQuote,
}: TopicItemProps) {
  const priorityColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-gray-50 border-gray-200'
  };

  const priorityTextColors = {
    high: 'text-red-600',
    medium: 'text-amber-600',
    low: 'text-gray-600'
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card 
      className={`${priorityColors[topic.priority]} shadow-sm transition-shadow hover:shadow-md cursor-pointer`}
      onClick={() => onSelect(topic.messageId)}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="font-medium line-clamp-2">{topic.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatMessageTimestamp(topic.timestamp)}
            </div>
          </div>
          
          <div className={`${priorityBadgeColors[topic.priority]} text-xs px-2 py-1 rounded-full`}>
            {topic.priority === 'high' ? 'Urgent' : topic.priority === 'medium' ? 'Important' : 'Normal'}
          </div>
        </div>

        <div className="flex justify-end mt-2 space-x-1">
          {onQuote && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onQuote(topic.content);
              }}
            >
              <Quote className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(topic.id);
            }}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onArchive(topic.id);
            }}
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(topic.id);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
