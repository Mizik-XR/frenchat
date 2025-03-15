
import { useState } from 'react';
import { WebUIConfig, AnalysisMode, AIProvider } from '@/types/chat';

export const useChatState = () => {
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachedFileUrls, setAttachedFileUrls] = useState<string[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<{ id: string; content: string; role: 'user' | 'assistant' } | null>(null);
  const [config, setConfig] = useState<WebUIConfig>({
    provider: 'huggingface',
    model: 'huggingface',
    temperature: 0.7,
    maxTokens: 1000,
    analysisMode: 'default',
    useMemory: false
  });

  const clearAttachments = () => {
    setUploadedFiles([]);
    setAttachedFileUrls([]);
  };

  const clearReply = () => {
    setReplyToMessage(null);
  };

  const resetChatState = () => {
    setInputValue('');
    clearAttachments();
    clearReply();
    setIsWaitingForResponse(false);
  };

  return {
    isWaitingForResponse,
    setIsWaitingForResponse,
    inputValue,
    setInputValue,
    uploadedFiles,
    setUploadedFiles,
    attachedFileUrls,
    setAttachedFileUrls,
    replyToMessage,
    setReplyToMessage,
    config,
    setConfig,
    clearAttachments,
    clearReply,
    resetChatState
  };
};
