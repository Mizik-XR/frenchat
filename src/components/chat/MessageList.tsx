
import { Bot, FileText, Image, Loader, Reply } from "lucide-react";
import { Message } from "@/types/chat";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { MessageContextMenu } from "./message/MessageContextMenu";
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
  onReplyToMessage?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
  onArchiveMessage?: (messageId: string) => void;
}

export const MessageList = ({ 
  messages, 
  isLoading, 
  conversationContext,
  onReplyToMessage,
  onDeleteMessage,
  onArchiveMessage
}: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin">
      {conversationContext && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-[#002654]">
          <div className="font-medium mb-1">
            Conversation en cours : {conversationContext.title}
          </div>
          {conversationContext.documentDate && (
            <div className="text-[#002654]">
              Document uploadé le {format(conversationContext.documentDate, 'dd/MM/yyyy', { locale: fr })}
            </div>
          )}
          {conversationContext.type && (
            <div className="text-[#002654]">
              Type : {conversationContext.type}
            </div>
          )}
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`group flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`relative max-w-[80%] ${
              message.role === 'user'
                ? 'message-bubble-user'
                : 'message-bubble-assistant'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-2 text-[#002654]">
                <Bot className="h-4 w-4" />
                <span className="text-xs">Assistant IA</span>
              </div>
            )}
            
            {message.metadata?.replyTo && (
              <div className="reply-indicator">
                <div className="font-medium mb-1">En réponse à :</div>
                <div className="line-clamp-2">{message.metadata.replyTo.content}</div>
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

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className={`p-1 rounded ${message.role === 'user' ? 'hover:bg-[#001c40]/30' : 'hover:bg-gray-200/30'}`}
                        onClick={() => onReplyToMessage && onReplyToMessage(message)}
                      >
                        <Reply className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Répondre à ce message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <MessageContextMenu
                  message={message}
                  onReply={onReplyToMessage || (() => {})}
                  onDelete={onDeleteMessage || (() => {})}
                  onArchive={onArchiveMessage || (() => {})}
                />
              </div>
            </div>
            
            <div className="message-timestamp">
              {message.timestamp && format(message.timestamp, 'HH:mm', { locale: fr })}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-center items-center gap-2 p-4 bg-white/80 dark:bg-black/40 rounded-full shadow-sm text-[#002654] dark:text-white mt-2 backdrop-blur-sm w-fit mx-auto">
          <Loader className="h-4 w-4 animate-spin" />
          <span className="text-sm">L'IA réfléchit...</span>
        </div>
      )}
    </div>
  );
}
