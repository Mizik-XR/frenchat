
import React from 'react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};
