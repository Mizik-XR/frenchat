
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Config from '@/pages/Config';
import { MicrosoftTeamsConfig } from '@/components/config/MicrosoftTeamsConfig';
import { GoogleDriveConfig } from '@/components/config/GoogleDriveConfig';

const ConfigRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Config />} />
      <Route path="/microsoft-teams" element={<MicrosoftTeamsConfig />} />
      <Route path="/google-drive" element={<GoogleDriveConfig />} />
    </Routes>
  );
};

export default ConfigRoutes;
