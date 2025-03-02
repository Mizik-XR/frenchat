
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
        <Button 
          variant="ghost" 
          className="absolute top-4 left-4 flex items-center text-blue-600"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
        
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Alone Must</h1>
            <p className="text-gray-600 mt-2">
              Connectez-vous pour accéder à votre assistant IA personnel
            </p>
          </div>

          {children}
        </div>
      </div>
    </ThemeProvider>
  );
};
