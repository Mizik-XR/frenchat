
import React from "react";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  if (content.startsWith("> ")) {
    return (
      <>
        <div className="bg-opacity-10 bg-gray-500 p-2 rounded mb-2 italic text-sm">
          {content.split("\n\n")[0].substring(2)}
        </div>
        <div>{content.split("\n\n").slice(1).join("\n\n")}</div>
      </>
    );
  }
  
  return <div>{content}</div>;
}
