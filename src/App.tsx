
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { NavBar } from "@/components/navigation/NavBar";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";
import Documents from "@/pages/Documents";
import { QuickConfig } from "@/components/config/QuickConfig";
import GoogleAuthCallback from "@/pages/GoogleAuthCallback";
import { useAuth } from "@/components/AuthProvider";
import { LocalAIConfig } from "@/components/config/llm/LocalAIConfig";
import { CloudAIConfig } from "@/components/config/llm/CloudAIConfig";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/auth/callback/google"
            element={<GoogleAuthCallback />}
          />
          <Route 
            path="/config" 
            element={
              <PrivateRoute>
                <QuickConfig />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/config/local-ai" 
            element={
              <PrivateRoute>
                <LocalAIConfig />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/config/cloud-ai" 
            element={
              <PrivateRoute>
                <CloudAIConfig />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/documents" 
            element={
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } 
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}
