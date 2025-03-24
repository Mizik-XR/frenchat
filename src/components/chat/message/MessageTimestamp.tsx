
import React from '@/core/reactInstance';

interface MessageTimestampProps {
  timestamp: number;
}

export function MessageTimestamp({ timestamp }: MessageTimestampProps) {
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="text-xs opacity-70 mt-1 text-right">
      {formatTime(timestamp)}
    </div>
  );
}
