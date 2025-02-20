
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ConfigLayout } from "@/components/ConfigLayout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConfigLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
