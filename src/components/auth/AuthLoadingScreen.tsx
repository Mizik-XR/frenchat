
import React from 'react';

interface AuthLoadingScreenProps {
  message?: string;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ message = "Authentification en cours..." }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-blue-50 p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      {message && <p className="text-blue-700 text-center">{message}</p>}
    </div>
  );
};
