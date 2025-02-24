
import { Bot, FileText, Image, Loader } from "lucide-react";
import { Message } from "@/types/chat";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  conversationContext?: {
    title: string;
    documentDate?: Date;
    type?: string;
  };
}

export const MessageList = ({ messages, isLoading, conversationContext }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {conversationContext && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-700">
          <div className="font-medium mb-1">
            Conversation en cours : {conversationContext.title}
          </div>
          {conversationContext.documentDate && (
            <div className="text-blue-600">
              Document uploadé le {format(conversationContext.documentDate, 'dd/MM/yyyy', { locale: fr })}
            </div>
          )}
          {conversationContext.type && (
            <div className="text-blue-600">
              Type : {conversationContext.type}
            </div>
          )}
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Bot className="h-4 w-4" />
                <span className="text-xs">Assistant IA</span>
              </div>
            )}
            {message.metadata?.provider && (
              <div className="text-xs text-gray-500 mb-1">
                via {message.metadata.provider}
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.type === 'document' && message.context && (
              <div className="mt-4">
                <DocumentPreview 
                  documentId={message.context} 
                  content={message.content}
                />
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-center items-center gap-2 p-4 text-gray-500">
          <Loader className="h-5 w-5 animate-spin" />
          <span>L'IA réfléchit...</span>
        </div>
      )}
    </div>
  );
}
