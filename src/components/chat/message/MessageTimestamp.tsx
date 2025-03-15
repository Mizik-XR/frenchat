
import React from "react";

interface MessageTimestampProps {
  timestamp: number;
}

export function MessageTimestamp({ timestamp }: MessageTimestampProps) {
  return (
    <div className="text-xs opacity-70 mt-1 text-right">
      {new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>
  );
}
