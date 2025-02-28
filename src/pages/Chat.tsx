
import { Chat as ChatComponent } from "@/components/Chat";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function Chat() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <ChatComponent />
        </Suspense>
      </div>
    </div>
  );
}
