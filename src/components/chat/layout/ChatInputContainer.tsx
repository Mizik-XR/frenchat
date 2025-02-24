
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "../ChatInput";
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { AIProvider } from "@/types/chat";

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  mode: 'auto' | 'manual';
  model: AIProvider;
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
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
  onFilesSelected
}: ChatInputContainerProps) => {
  return (
    <>
      {showUploader && (
        <div className="p-4 bg-white border-t">
          <FileUploader 
            onFilesSelected={onFilesSelected}
            description="Les fichiers seront automatiquement indexés"
          />
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUploader(!showUploader)}
            className="hover:bg-gray-100"
            title="Ajouter un fichier"
          >
            <FileUp className="h-4 w-4" />
          </Button>

          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            selectedDocumentId={selectedDocumentId}
            onSubmit={onSubmit}
            mode={mode}
            model={model}
          />
        </div>
      </div>
    </>
  );
};
