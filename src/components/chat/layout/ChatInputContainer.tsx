
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "../ChatInput";
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { AIProvider } from "@/types/chat";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocumentPreview } from "@/components/documents/DocumentPreview";

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
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 relative"
                title="Gérer les documents"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Documents</SheetTitle>
                <SheetDescription>
                  Gérez et prévisualisez vos documents
                </SheetDescription>
              </SheetHeader>
              
              {showUploader ? (
                <div className="mt-4">
                  <FileUploader 
                    onFilesSelected={onFilesSelected}
                    description="Les fichiers seront automatiquement indexés"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <Button 
                    onClick={() => setShowUploader(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Importer des documents
                  </Button>
                </div>
              )}
              
              {selectedDocumentId && (
                <div className="mt-4">
                  <DocumentPreview documentId={selectedDocumentId} />
                </div>
              )}
            </SheetContent>
          </Sheet>

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
