
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Chat />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}
