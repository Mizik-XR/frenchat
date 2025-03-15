
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            Page de paramètres en cours de construction. Cette fonctionnalité sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
