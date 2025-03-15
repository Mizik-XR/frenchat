
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Legal: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Mentions Légales</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Conditions d'utilisation</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Les présentes conditions d'utilisation régissent votre utilisation de FileChat, 
              application web permettant d'interagir avec vos documents via une interface de chat IA.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Politique de confidentialité</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              La protection de vos données est notre priorité. FileChat traite vos données 
              conformément au RGPD et autres règlementations applicables.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Propriété intellectuelle</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Tous les droits de propriété intellectuelle relatifs à FileChat sont réservés.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Legal;
