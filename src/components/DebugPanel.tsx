
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  
  useEffect(() => {
    // Activer le débogage avec Ctrl+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Récupérer les infos de session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        setSessionInfo(data);
      }
    };
    
    checkSession();
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 bg-white/90 backdrop-blur-sm shadow-lg w-96 max-h-96 overflow-auto">
        <h3 className="font-bold text-lg mb-2">Informations de débogage</h3>
        
        <div className="space-y-2 text-sm">
          <div>
            <strong>URL:</strong> {window.location.href}
          </div>
          <div>
            <strong>Hostname:</strong> {window.location.hostname}
          </div>
          <div>
            <strong>Origin:</strong> {window.location.origin}
          </div>
          <div>
            <strong>Paramètres URL:</strong> {window.location.search}
          </div>
          <div>
            <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? "Défini" : "Non défini"}
          </div>
          <div>
            <strong>Session:</strong> {sessionInfo?.session ? "Active" : "Inactive"}
          </div>
          {sessionInfo?.session && (
            <div>
              <strong>User ID:</strong> {sessionInfo.session.user.id}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
        >
          Fermer
        </button>
      </Card>
    </div>
  );
};
