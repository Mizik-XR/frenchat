
import React from "react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-purple-900">Chargement de FileChat</h2>
      </div>
    </div>
  );
};
