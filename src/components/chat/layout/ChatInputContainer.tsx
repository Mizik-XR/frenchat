
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, SendIcon } from "lucide-react";
import { Message } from "@/types/chat";

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  setShowUploader: (show: boolean) => void;
  replyToMessage: Message | null;
  onClearReply: () => void;
  isLoading: boolean;
}

export function ChatInputContainer({
  input,
  setInput,
  onSubmit,
  setShowUploader,
  replyToMessage,
  onClearReply,
  isLoading
}: ChatInputContainerProps) {
  return (
    <div className="border-t p-3">
      {replyToMessage && (
        <div className="bg-gray-100 p-2 mb-2 rounded-md flex justify-between items-center">
          <div className="text-sm text-gray-600 truncate">
            Répondre à: {replyToMessage.content.substring(0, 50)}
            {replyToMessage.content.length > 50 ? "..." : ""}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearReply}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      )}
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowUploader(true)}
          className="flex-shrink-0"
        >
          <PaperclipIcon className="h-4 w-4" />
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          className="min-h-[40px] resize-none"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                onSubmit(e);
              }
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
