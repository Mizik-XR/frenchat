
import { Bot, FileText, Image } from "lucide-react";
import { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
              <Bot className="h-4 w-4 mb-1 inline-block mr-2" />
            )}
            {message.context && (
              <div className="text-xs text-gray-500 mb-1">
                {message.type === 'document' ? (
                  <>
                    <FileText className="h-3 w-3 inline-block mr-1" />
                    Analyse basée sur le document sélectionné
                  </>
                ) : message.type === 'image' ? (
                  <>
                    <Image className="h-3 w-3 inline-block mr-1" />
                    Image générée à partir du contexte
                  </>
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
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
            <Bot className="h-4 w-4 mb-1 inline-block mr-2" />
            Génération en cours...
          </div>
        </div>
      )}
    </div>
  );
};
