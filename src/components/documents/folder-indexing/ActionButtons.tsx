
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useToast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  onRefresh: () => void;
}

export function ActionButtons({ onRefresh }: ActionButtonsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleRefresh = () => {
    onRefresh();
    toast({
      title: "Actualisation",
      description: "Les données ont été actualisées",
    });
  };
  
  return (
    <div className="flex justify-between items-center">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/chat")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au chat
      </Button>
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}
