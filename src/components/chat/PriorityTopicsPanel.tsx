
import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";
import { TopicItem } from "./priority-topics/TopicItem";
import { TopicFilters } from "./priority-topics/TopicFilters";
import { isImportantMessage, getTopicTitle, determineMessagePriority } from "./priority-topics/utils";

interface PriorityTopic {
  id: string;
  title: string;
  timestamp: Date;
  isCompleted: boolean;
  isArchived: boolean;
  priority: 'high' | 'medium' | 'low';
  messageId: string;
  content: string;
}

interface PriorityTopicsPanelProps {
  messages: Message[];
  onTopicSelect: (messageId: string) => void;
  onClose: () => void;
  onQuote?: (content: string) => void;
}

export function PriorityTopicsPanel({ 
  messages, 
  onTopicSelect, 
  onClose,
  onQuote 
}: PriorityTopicsPanelProps) {
  const [priorityTopics, setPriorityTopics] = useState<PriorityTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  useEffect(() => {
    const topics = messages.reduce<PriorityTopic[]>((acc, message) => {
      if (message.type === 'document' || isImportantMessage(message.content)) {
        acc.push({
          id: `topic-${message.id}`,
          title: getTopicTitle(message),
          timestamp: message.timestamp,
          isCompleted: false,
          isArchived: false,
          priority: determineMessagePriority(message),
          messageId: message.id,
          content: message.content
        });
      }
      return acc;
    }, []);

    setPriorityTopics(topics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, [messages]);

  const handleTopicComplete = (topicId: string) => {
    setPriorityTopics(prev => 
      prev.map(topic => 
        topic.id === topicId 
          ? { ...topic, isCompleted: true }
          : topic
      )
    );
    toast({
      title: "Sujet marqué comme terminé",
      description: "Le sujet a été archivé dans l'historique"
    });
  };

  const handleTopicArchive = (topicId: string) => {
    setPriorityTopics(prev => 
      prev.map(topic => 
        topic.id === topicId 
          ? { ...topic, isArchived: true }
          : topic
      )
    );
    toast({
      title: "Sujet archivé",
      description: "Le sujet a été déplacé vers les archives"
    });
  };

  const handleTopicDelete = (topicId: string) => {
    setPriorityTopics(prev => prev.filter(topic => topic.id !== topicId));
    toast({
      title: "Sujet supprimé",
      description: "Le sujet a été définitivement supprimé"
    });
  };

  const handleQuote = (content: string) => {
    if (onQuote) {
      onQuote(content);
      toast({
        title: "Texte cité",
        description: "Le contenu a été copié dans le champ de message"
      });
    }
  };

  const filteredTopics = priorityTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'active' && !topic.isCompleted && !topic.isArchived) ||
                         (filter === 'completed' && topic.isCompleted) ||
                         (filter === 'archived' && topic.isArchived);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-white">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-lg">Sujets Prioritaires</h2>
      </div>

      <TopicFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredTopics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onSelect={onTopicSelect}
              onQuote={handleQuote}
              onArchive={handleTopicArchive}
              onComplete={handleTopicComplete}
              onDelete={handleTopicDelete}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
