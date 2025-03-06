
import React, { useRef, useEffect } from "react";
import { Message } from "@/types/chat";
import { ReplyBadge } from "../input/ReplyBadge";
import { FileUploader } from "../input/FileUploader";
import { MessageInputContainer } from "../input/MessageInputContainer";
import { StatusIndicator } from "../input/StatusIndicator";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "../input/ModelSelector";

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
  const handleAttachment = (type: string) => {
    if (type === "upload") {
      setShowUploader(true);
    }
  };

  // Fix the signature to match expected function type
  const handleSendMessage = () => {
    const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
    onSubmit(dummyEvent);
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
      {showUploader ? (
        <FileUploader 
          onFilesSelected={onFilesSelected}
          setShowUploader={setShowUploader}
        />
      ) : (
        <>
          <MessageInputContainer
            inputValue={input}
            setInputValue={setInput}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            replyToMessage={replyToMessage || null}
            onCancelReply={onClearReply || (() => {})}
            onAttachment={handleAttachment}
          />
          
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <StatusIndicator 
              serviceType={modelSource === 'local' ? 'local' : 'cloud'}
              mode={mode}
              model={model}
              modelSource={modelSource}
            />
            
            {mode === 'manual' && (
              <ModelSelector 
                selectedModel={model} 
                onSelectModel={() => {}} 
                modelSource={modelSource} 
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
