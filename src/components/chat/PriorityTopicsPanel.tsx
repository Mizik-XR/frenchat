
import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";

interface PriorityTopic {
  id: string;
  title: string;
  timestamp: Date;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  messageId: string;
}

interface PriorityTopicsPanelProps {
  messages: Message[];
  onTopicSelect: (messageId: string) => void;
  onClose: () => void;
}

export function PriorityTopicsPanel({ messages, onTopicSelect, onClose }: PriorityTopicsPanelProps) {
  const [priorityTopics, setPriorityTopics] = useState<PriorityTopic[]>([]);

  useEffect(() => {
    // Analyse des messages pour détecter les sujets prioritaires
    const topics = messages.reduce<PriorityTopic[]>((acc, message) => {
      if (message.type === 'document' || isImportantMessage(message.content)) {
        acc.push({
          id: `topic-${message.id}`,
          title: getTopicTitle(message),
          timestamp: message.timestamp,
          isCompleted: false,
          priority: determineMessagePriority(message),
          messageId: message.id
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

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au chat
        </Button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Sujets Prioritaires</h2>
        <p className="text-sm text-gray-500">
          {priorityTopics.filter(t => !t.isCompleted).length} sujets en cours
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {priorityTopics.map((topic) => (
            <div
              key={topic.id}
              className={`p-3 rounded-lg border ${
                topic.isCompleted 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-blue-100 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <AlertTriangle 
                    className={`h-4 w-4 mr-2 ${
                      getPriorityColor(topic.priority)
                    }`}
                  />
                  <span className="font-medium">{topic.title}</span>
                </div>
                {!topic.isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTopicComplete(topic.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {formatTimestamp(topic.timestamp)}
                </Badge>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onTopicSelect(topic.messageId)}
                >
                  Voir le message
                </Button>
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
