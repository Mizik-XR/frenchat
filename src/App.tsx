
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import { Config } from "@/pages/Config";
import Chat from "@/pages/Chat";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/config" element={<Config />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}
