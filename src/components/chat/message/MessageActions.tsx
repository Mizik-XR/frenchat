
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

interface MessageActionsProps {
  content: string;
  isUser: boolean;
  isVisible: boolean;
  onReply: () => void;
  onForward: () => void;
  onQuote: () => void;
}

export function MessageActions({ 
  content, 
  isUser, 
  isVisible, 
  onReply, 
  onForward, 
  onQuote 
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copié",
      description: "Le message a été copié dans le presse-papier",
    });
  };

  if (!isVisible) return null;

  return (
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
  );
}
