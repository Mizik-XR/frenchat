
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ConfigLayout } from "@/components/ConfigLayout";
import { Chat } from "@/components/Chat";
import { Dashboard } from "@/components/Dashboard";
import { useState } from "react";

const App = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <ConfigLayout />
          <Dashboard />
          {showChat && <Chat />}
        </div>
      </div>
      <Toaster />
    </Router>
  );
};

export default App;
