
import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft, 
  Search,
  MessageSquare,
  Archive,
  Trash2 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";

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

      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un sujet..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'archived'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
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
                  onClick={() => onTopicSelect(topic.messageId)}
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
                        onClick={() => handleQuote(topic.content)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTopicArchive(topic.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTopicComplete(topic.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTopicDelete(topic.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Fonctions utilitaires
function isImportantMessage(content: string): boolean {
  const importantKeywords = ['urgent', 'important', 'prioritaire', 'critique'];
  return importantKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
}

function getTopicTitle(message: Message): string {
  if (message.type === 'document') {
    return `Document: ${message.content.split('\n')[0]}`;
  }
  return message.content.slice(0, 50) + '...';
}

function determineMessagePriority(message: Message): 'high' | 'medium' | 'low' {
  if (message.type === 'document') return 'high';
  if (message.content.toLowerCase().includes('urgent')) return 'high';
  if (message.content.toLowerCase().includes('important')) return 'medium';
  return 'low';
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
