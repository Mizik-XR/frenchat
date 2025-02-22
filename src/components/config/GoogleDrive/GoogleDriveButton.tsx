
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface GoogleDriveButtonProps {
  isConnecting: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const GoogleDriveButton = ({ isConnecting, onClick, disabled }: GoogleDriveButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="w-full"
      disabled={disabled || isConnecting}
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      {isConnecting ? 'Connexion en cours...' : 'Se connecter avec Google Drive'}
    </Button>
  );
};
