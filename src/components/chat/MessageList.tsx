
import { Bot, FileText, Image, Loader } from "lucide-react";
import { Message } from "@/types/chat";
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
    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message.role === 'assistant' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Bot className="h-4 w-4 mb-1 inline-block mr-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Réponse générée par l'assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {message.context && (
              <div className="text-xs text-gray-500 mb-1">
                {message.type === 'document' ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <FileText className="h-3 w-3 inline-block mr-1" />
                        Analyse basée sur le document sélectionné
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>L'assistant analyse le contenu du document pour répondre</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : message.type === 'image' ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <Image className="h-3 w-3 inline-block mr-1" />
                        Image générée à partir du contexte
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Image créée par l'IA en fonction du contexte</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
              </div>
            )}
            {message.content}
            {message.type === 'image' && message.metadata?.imageUrl && (
              <div className="mt-2">
                <img
                  src={message.metadata.imageUrl}
                  alt={message.content}
                  className="max-w-full rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-center items-center gap-2 p-4 text-gray-500">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Génération en cours...</span>
        </div>
      )}
    </div>
  );
};
