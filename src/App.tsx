
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ConfigLayout } from "@/components/ConfigLayout";
import { Chat } from "@/components/Chat";
import { Dashboard } from "@/components/Dashboard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const App = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <ConfigLayout />
          <Dashboard />
          
          {/* Bouton pour afficher/masquer le chat */}
          <div className="fixed bottom-4 right-4">
            <Button
              onClick={() => setShowChat(!showChat)}
              className="rounded-full h-12 w-12 p-0"
            >
              <MessageSquare className={`h-6 w-6 transition-transform ${
                showChat ? 'rotate-0' : 'rotate-0'
              }`} />
            </Button>
          </div>

          {/* Interface de chat */}
          {showChat && <Chat />}
        </div>
      </div>
      <Toaster />
    </Router>
  );
};

export default App;
