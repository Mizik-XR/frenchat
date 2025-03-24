import { ChatHeader } from "@/components/chat/ChatHeader";
import { AIOptionsPanel } from "@/components/ai/AIOptionsPanel";
import { useState, useEffect  } from '@/core/reactInstance';
import { AIMode, useAIMode } from "@/hooks/useAIMode";
import { Outlet } from "react-router-dom";

export default function Chat() {
  const [showSettings, setShowSettings] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const { currentMode, isLocalAvailable, changeMode } = useAIMode();
  
  // Pour compatibilité avec l'ancienne interface
  const [mode, setMode] = useState<'auto' | 'manual'>(
    currentMode === 'hybrid' ? 'auto' : 'manual'
  );
  const [modelSource, setModelSource] = useState<'cloud' | 'local'>(
    currentMode === 'local' ? 'local' : 'cloud'
  );
  
  // Mettre à jour les états quand le mode AI change
  useEffect(() => {
    setMode(currentMode === 'hybrid' ? 'auto' : 'manual');
    setModelSource(currentMode === 'local' ? 'local' : 'cloud');
  }, [currentMode]);
  
  const handleModeChange = (newMode: 'auto' | 'manual') => {
    setMode(newMode);
    // Si on change pour le mode auto, passer en mode hybride
    if (newMode === 'auto') {
      changeMode('hybrid');
    }
    // Si on passe en mode manuel, garder le modelSource actuel
    else if (modelSource === 'local' && isLocalAvailable) {
      changeMode('local');
    } else {
      changeMode('cloud');
    }
  };
  
  const handleModelSourceChange = (source: 'cloud' | 'local') => {
    setModelSource(source);
    // Ne pas changer si on est en mode auto
    if (mode === 'manual') {
      changeMode(source === 'local' ? 'local' : 'cloud');
    }
  };
  
  return (
    <div className="flex h-screen flex-col">
      <ChatHeader 
        mode={mode}
        onModeChange={handleModeChange}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onResetConversation={() => {
          // TODO: Implement reset functionality
          console.log("Reset conversation");
        }}
        setShowUploader={setShowUploader}
        modelSource={modelSource}
        onModelSourceChange={handleModelSourceChange}
        currentAIMode={currentMode}
        isLocalAvailable={isLocalAvailable}
        onAIModeChange={changeMode}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex w-80 border-r p-4 flex-shrink-0">
          <AIOptionsPanel 
            currentMode={currentMode}
            isLocalAvailable={isLocalAvailable}
            onModeChange={changeMode}
            variant="sidebar"
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
