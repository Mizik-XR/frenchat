
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Reply, 
  Forward, 
  Quote, 
  Copy, 
  Trash2, 
  Check 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  messages: Message[];
  onReply: () => void;
  onForward: () => void;
  onQuote: () => void;
  isUser: boolean;
}

export function ChatMessage({ 
  message, 
  messages, 
  onReply, 
  onForward, 
  onQuote, 
  isUser 
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Find the message this is replying to, if any
  const replyToMessage = message.replyTo ? 
    messages.find((m) => m.id === message.replyTo) : null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copié",
      description: "Le message a été copié dans le presse-papier",
    });
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-french-blue text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
            : "bg-muted rounded-tl-lg rounded-tr-lg rounded-br-lg"
        } p-3 relative group`}
      >
        {replyToMessage && (
          <div className="mb-2 pb-2 border-b border-opacity-20 text-sm opacity-80">
            <div className="flex items-center">
              <div className={`w-1 h-full ${isUser ? "bg-white" : "bg-french-blue"} mr-2`} />
              <div className="truncate">
                <span className="font-medium">Réponse à: </span>
                {replyToMessage.content}
              </div>
            </div>
          </div>
        )}

        <div className="whitespace-pre-wrap break-words">
          {message.content.startsWith("> ") ? (
            <>
              <div className="bg-opacity-10 bg-gray-500 p-2 rounded mb-2 italic text-sm">
                {message.content.split("\n\n")[0].substring(2)}
              </div>
              <div>{message.content.split("\n\n").slice(1).join("\n\n")}</div>
            </>
          ) : (
            message.content
          )}
        </div>

        <div className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {showActions && (
          <div
            className={`absolute ${
              isUser ? "left-0 -translate-x-full" : "right-0 translate-x-full"
            } top-0 flex items-center gap-1`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background shadow-sm"
              onClick={onReply}
            >
              <Reply className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background shadow-sm"
              onClick={onForward}
            >
              <Forward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background shadow-sm"
              onClick={onQuote}
            >
              <Quote className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background shadow-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isUser ? "end" : "start"}>
                <DropdownMenuItem onClick={copyToClipboard}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copier
                </DropdownMenuItem>
                {isUser && (
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
