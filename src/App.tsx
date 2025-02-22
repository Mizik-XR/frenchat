
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { NavBar } from "@/components/navigation/NavBar";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";
import { Config } from "@/pages/Config";
import { AdvancedConfig } from "@/pages/AdvancedConfig";
import Documents from "@/pages/Documents";
import GoogleAuthCallback from "@/pages/GoogleAuthCallback";
import { useAuth } from "@/components/AuthProvider";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  console.log("PrivateRoute - user:", user, "isLoading:", isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("PrivateRoute - redirecting to /auth");
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
            path="/config" 
            element={
              <PrivateRoute>
                <Config />
              </PrivateRoute>
            } 
          />
          <Route
            path="/auth/callback/google"
            element={
              <PrivateRoute>
                <GoogleAuthCallback />
              </PrivateRoute>
            }
          />
          <Route 
            path="/advanced-config" 
            element={
              <PrivateRoute>
                <AdvancedConfig />
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
