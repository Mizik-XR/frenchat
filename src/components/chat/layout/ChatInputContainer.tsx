
import React from "react";
import { Message } from "@/types/chat";
import { ReplyBadge } from "../input/ReplyBadge";
import { FileUploader } from "../input/FileUploader";
import { MessageInput } from "../input/MessageInput";
import { StatusIndicator } from "../input/StatusIndicator";

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  mode: "auto" | "manual";
  model: string;
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
  modelSource: 'cloud' | 'local';
  replyToMessage?: Message | null;
  onClearReply?: () => void;
}

export const ChatInputContainer = ({
  input,
  setInput,
  isLoading,
  selectedDocumentId,
  onSubmit,
  mode,
  model,
  showUploader,
  setShowUploader,
  onFilesSelected,
  modelSource,
  replyToMessage,
  onClearReply
}: ChatInputContainerProps) => {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
      {replyToMessage && onClearReply && (
        <ReplyBadge 
          replyToMessage={replyToMessage} 
          onClearReply={onClearReply} 
        />
      )}

      {showUploader ? (
        <FileUploader 
          onFilesSelected={onFilesSelected}
          setShowUploader={setShowUploader}
        />
      ) : (
        <MessageInput 
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={onSubmit}
          setShowUploader={setShowUploader}
        />
      )}

      <StatusIndicator 
        serviceType={modelSource === 'local' ? 'local' : 'cloud'}
        mode={mode}
        model={model}
        modelSource={modelSource}
      />
    </div>
  );
};
