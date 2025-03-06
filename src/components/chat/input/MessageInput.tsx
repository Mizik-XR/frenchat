
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Send } from "lucide-react";

interface MessageInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  setShowUploader: (show: boolean) => void;
}

export const MessageInput = ({
  input,
  setInput,
  isLoading,
  onSubmit,
  setShowUploader
}: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <div className="relative flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message..."
          className="w-full p-3 text-gray-900 dark:text-gray-100 bg-transparent resize-none rounded-lg focus:outline-none min-h-[56px] max-h-[200px]"
          rows={1}
          style={{
            height: "56px",
            overflow: "auto"
          }}
          disabled={isLoading}
        />
        <div className="absolute right-2 bottom-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowUploader(true)}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FileUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="sr-only">Ajouter des fichiers</span>
          </Button>
        </div>
      </div>
      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 flex items-center justify-center"
        disabled={isLoading || input.trim() === ""}
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Envoyer</span>
      </Button>
    </form>
  );
};
