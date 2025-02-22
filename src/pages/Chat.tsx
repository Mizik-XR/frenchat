
import { Chat as ChatComponent } from "@/components/Chat";

export default function Chat() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}
