
import { Message } from "@/types/chat";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onReplyToMessage: (message: Message) => void;
}

export function ChatContainer({ messages, isLoading, onReplyToMessage }: ChatContainerProps) {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500 text-center">
            Commencez une nouvelle conversation ou sélectionnez-en une existante.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3/4 rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
              onClick={() => onReplyToMessage(message)}
            >
              {message.content}
            </div>
          </div>
        ))
      )}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
