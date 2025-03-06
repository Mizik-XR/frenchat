
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
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {conversationContext && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
          <div className="font-medium mb-1">
            Conversation en cours : {conversationContext.title}
          </div>
          {conversationContext.documentDate && (
            <div className="text-blue-600 dark:text-blue-400">
              Document uploadé le {format(conversationContext.documentDate, 'dd/MM/yyyy', { locale: fr })}
            </div>
          )}
          {conversationContext.type && (
            <div className="text-blue-600 dark:text-blue-400">
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
            className={`relative max-w-[80%] rounded-lg shadow-sm ${
              message.role === 'user'
                ? 'message-bubble-user'
                : 'message-bubble-assistant'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-300">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">Assistant IA</span>
              </div>
            )}
            
            {message.metadata?.replyTo && (
              <div className="bg-black/5 dark:bg-white/10 p-2 rounded mb-2 text-xs border-l-2 border-blue-400">
                <div className="font-medium mb-1">En réponse à :</div>
                <div className="line-clamp-2">{message.metadata.replyTo.content}</div>
              </div>
            )}
            
            {message.metadata?.provider && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                via {message.metadata.provider}
              </div>
            )}
            
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.type === 'document' && message.context && (
              <div className="mt-4 bg-white/70 dark:bg-black/20 p-2 rounded">
                <DocumentPreview 
                  documentId={message.context} 
                  content={message.content}
                />
              </div>
            )}

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity message-actions">
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="message-action-button"
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
            
            <div className="text-xs opacity-70 mt-1 text-right">
              {message.timestamp && format(message.timestamp, 'HH:mm', { locale: fr })}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-center items-center gap-2 p-4 my-2">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-3 flex items-center">
            <div className="typing-indicator mr-2">
              <span className="typing-dot bg-blue-600"></span>
              <span className="typing-dot bg-white delay-75"></span>
              <span className="typing-dot bg-red-600 delay-150"></span>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">L'IA réfléchit...</span>
          </div>
        </div>
      )}
      
      {/* Tricolor divider at the end */}
      <div className="tricolor-divider">
        <div className="blue"></div>
        <div className="white"></div>
        <div className="red"></div>
      </div>
    </div>
  );
}
