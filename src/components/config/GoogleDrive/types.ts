
export interface GoogleOAuthConfig {
  client_id: string;
  client_secret: string;
}

export interface GoogleDriveProps {
  onConfigured: () => void;
  onClose?: () => void;
}
