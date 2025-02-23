
import { useState } from "react";

export const useDragAndDrop = (conversationId: string) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('conversation_id', conversationId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return {
    isDragging,
    handleDragStart,
    handleDragEnd
  };
};
