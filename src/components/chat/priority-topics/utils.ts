
import { Message, MessageType } from "@/types/chat";

/**
 * Checks if a message contains important keywords
 */
export function isImportantMessage(content: string): boolean {
  const importantKeywords = [
    'urgent', 
    'important', 
    'prioritaire', 
    'critique', 
    'deadline', 
    'échéance', 
    'immédiat'
  ];
  
  return importantKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
}

/**
 * Generates a title for the topic based on message content and type
 */
export function getTopicTitle(message: Message): string {
  // Handle different message types
  if (message.type === 'document') {
    // For document messages, use the first line as title
    const firstLine = message.content.split('\n')[0];
    return `Document: ${firstLine.slice(0, 40)}${firstLine.length > 40 ? '...' : ''}`;
  } else if (message.type === 'image') {
    return 'Image partagée';
  } else if (message.type === 'file') {
    return 'Fichier important';
  }

  // For regular text messages
  const maxLength = 50;
  const content = message.content.trim();
  if (content.length <= maxLength) return content;
  
  // Try to find a natural breaking point
  const breakPoint = content.substring(0, maxLength).lastIndexOf(' ');
  const cutoff = breakPoint > 20 ? breakPoint : maxLength;
  
  return `${content.slice(0, cutoff)}...`;
}

/**
 * Determines message priority based on content and type
 */
export function determineMessagePriority(message: Message): 'high' | 'medium' | 'low' {
  // Document type is high priority
  if (message.type === 'document') return 'high';
  
  // Check content for priority keywords
  const content = message.content.toLowerCase();
  
  if (content.includes('urgent') || content.includes('immédiat') || content.includes('critique')) {
    return 'high';
  }
  
  if (content.includes('important') || content.includes('prioritaire') || content.includes('deadline')) {
    return 'medium';
  }
  
  // Check if message is a reply to another message
  if (message.quotedMessageId) {
    return 'medium';  // Replies are often more important
  }
  
  return 'low';
}

/**
 * Formats the message timestamp for display
 */
export function formatMessageTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
}
