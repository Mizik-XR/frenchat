
import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Config from '@/pages/Config';
import { MicrosoftTeamsConfig } from '@/components/config/MicrosoftTeamsConfig';
import { useGoogleDriveConfig } from '@/hooks/useGoogleDriveConfig';
import { GoogleDriveConfig } from '@/components/config/GoogleDriveConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { GoogleConfig } from '@/types/config';

const GoogleDriveConfigWrapper = () => {
  const { googleConfig, saveConfig } = useGoogleDriveConfig();
  const navigate = useNavigate();
  
  const handleConfigChange = (config: GoogleConfig) => {
    saveConfig(config);
  };
  
  const handleSave = () => {
    toast({
      title: "Configuration sauvegardée",
      description: "La configuration de Google Drive a été mise à jour avec succès",
    });
    
    // Récupérer l'état de la configuration depuis sessionStorage
    const lastConfigState = sessionStorage.getItem('lastConfigState');
    if (lastConfigState) {
      const { step } = JSON.parse(lastConfigState);
      sessionStorage.setItem('currentConfigStep', step.toString());
    }
    
    navigate('/config');
  };
  
  return (
    <GoogleDriveConfig 
      config={googleConfig} 
      onConfigChange={handleConfigChange}
      onSave={handleSave}
    />
  );
};

const ConfigRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Config />} />
      <Route path="/microsoft-teams" element={<MicrosoftTeamsConfig />} />
      <Route path="/google-drive" element={<GoogleDriveConfigWrapper />} />
    </Routes>
  );
};

export default ConfigRoutes;
