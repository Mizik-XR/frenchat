
import { Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onToggleSettings: () => void;
}

export const ChatHeader = ({ onToggleSettings }: ChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">Assistant IA</h2>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSettings}
        className="hover:bg-blue-50 transition-colors"
      >
        <Settings className="h-5 w-5 text-blue-600" />
      </Button>
    </div>
  );
};
