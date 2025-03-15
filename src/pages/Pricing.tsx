
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-center mb-12">Nos Offres</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Offre Gratuite */}
          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b">
              <h2 className="text-xl font-bold">Gratuit</h2>
              <p className="text-3xl font-bold mt-2">0€</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pour toujours</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Indexation limitée (10 documents)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Accès aux modèles IA de base</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Génération de documents basique</span>
                </li>
              </ul>
              <Link to="/auth" className="block mt-6">
                <Button variant="outline" className="w-full">Commencer gratuitement</Button>
              </Link>
            </div>
          </div>
          
          {/* Offre Pro */}
          <div className="border rounded-lg overflow-hidden shadow-lg border-blue-200 dark:border-blue-900">
            <div className="p-6 bg-blue-50 dark:bg-blue-900 border-b">
              <h2 className="text-xl font-bold">Pro</h2>
              <p className="text-3xl font-bold mt-2">19€</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">par mois</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Indexation illimitée</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Modèles IA avancés</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Génération de documents avancée</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Support prioritaire</span>
                </li>
              </ul>
              <Link to="/auth" className="block mt-6">
                <Button className="w-full">Choisir Pro</Button>
              </Link>
            </div>
          </div>
          
          {/* Offre Entreprise */}
          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b">
              <h2 className="text-xl font-bold">Entreprise</h2>
              <p className="text-3xl font-bold mt-2">Sur mesure</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contactez-nous</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Déploiement sur site</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Intégration personnalisée</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>SLA garanti</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Support dédié 24/7</span>
                </li>
              </ul>
              <Link to="/auth" className="block mt-6">
                <Button variant="outline" className="w-full">Nous contacter</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
