
import { Message } from "@/types/chat";

export function isImportantMessage(content: string): boolean {
  const importantKeywords = ['urgent', 'important', 'prioritaire', 'critique'];
  return importantKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
}

export function getTopicTitle(message: Message): string {
  if (message.type === 'document') {
    return `Document: ${message.content.split('\n')[0]}`;
  }
  return message.content.slice(0, 50) + '...';
}

export function determineMessagePriority(message: Message): 'high' | 'medium' | 'low' {
  if (message.type === 'document') return 'high';
  if (message.content.toLowerCase().includes('urgent')) return 'high';
  if (message.content.toLowerCase().includes('important')) return 'medium';
  return 'low';
}
