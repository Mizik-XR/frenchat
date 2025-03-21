
import { React } from "@/core/ReactInstance";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";
import Config from "@/pages/Config";
import GoogleAuthCallback from "@/pages/GoogleAuthCallback";
import MicrosoftAuthCallback from "@/pages/MicrosoftAuthCallback";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/config" element={<Config />} />
      <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
      <Route path="/microsoft-auth-callback" element={<MicrosoftAuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
};

export default Routes;
