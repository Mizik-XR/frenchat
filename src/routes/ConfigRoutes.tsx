
import { Routes, Route } from 'react-router-dom';
import Config from '@/pages/Config';
import AdvancedConfig from '@/pages/AdvancedConfig';
import AIConfig from '@/pages/AIConfig';
import { MicrosoftTeamsConfig } from '@/components/config/MicrosoftTeamsConfig';
import { GoogleDriveConfig } from '@/components/config/GoogleDrive/GoogleDriveConfig';
import RagAdvancedSettings from '@/pages/RagAdvancedSettings';
import GoogleAuthCallback from '@/pages/GoogleAuthCallback';
import MicrosoftAuthCallback from '@/pages/MicrosoftAuthCallback';

export default function ConfigRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Config />} />
      <Route path="/advanced" element={<AdvancedConfig />} />
      <Route path="/ai" element={<AIConfig />} />
      <Route path="/microsoft-teams" element={<MicrosoftTeamsConfig />} />
      <Route path="/google-drive" element={<GoogleDriveConfig />} />
      <Route path="/rag-advanced" element={<RagAdvancedSettings />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      <Route path="/auth/microsoft/callback" element={<MicrosoftAuthCallback />} />
    </Routes>
  );
}
