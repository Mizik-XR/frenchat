
import React from "react";
import { Button } from "@/components/ui/button";
import { ThreeStateToggle } from "@/components/ui/ThreeStateToggle";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { SettingsDialog } from "@/components/chat/settings/SettingsDialog";

interface ChatHeaderProps {
  iaMode: "cloud" | "auto" | "local";
  onIAModeChange: (mode: "cloud" | "auto" | "local") => void;
}

export function ChatHeader({ iaMode, onIAModeChange }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Home className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <ThreeStateToggle
          options={[
            { value: "cloud", label: "IA Cloud" },
            { value: "auto", label: "Auto" },
            { value: "local", label: "IA Local" },
          ]}
          value={iaMode}
          onValueChange={onIAModeChange}
        />

        <Button variant="outline">Réinitialiser</Button>
        <SettingsDialog />
      </div>
    </div>
  );
}
