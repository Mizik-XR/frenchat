
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function PricingSection() {
  const navigate = useNavigate();
  
  const handleStartFreeTrial = () => {
    navigate("/auth");
  };
  
  const handleUpgradeToProPlan = () => {
    navigate("/config");
  };

  return (
    <section className="py-20 bg-black/90">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tarifs Simples et Transparents</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins, avec la possibilité d'utiliser vos propres API ou de
            recharger vos tokens.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Freemium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-b from-blue-900/20 to-blue-900/10 border border-blue-500/20 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Freemium</h3>
            <div className="text-blue-400 text-4xl font-bold mb-4">
              5€ <span className="text-lg text-gray-400">offerts</span>
            </div>
            <p className="text-gray-400 mb-6">Parfait pour découvrir la puissance de Frenchat</p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="text-blue-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Crédit de 5€ pour les requêtes API Hugging Face</span>
              </li>
              <li className="flex items-start">
                <Check className="text-blue-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Connexion à 2 sources de données</span>
              </li>
              <li className="flex items-start">
                <Check className="text-blue-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">IA open source en local et cloud</span>
              </li>
              <li className="flex items-start">
                <Check className="text-blue-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Possibilité d'utiliser votre propre API</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleStartFreeTrial}
            >
              Commencer Gratuitement
            </Button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-b from-red-900/20 to-red-900/10 border border-red-500/20 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <div className="text-red-400 text-4xl font-bold mb-4">
              29€ <span className="text-lg text-gray-400">/mois</span>
            </div>
            <p className="text-gray-400 mb-6">Pour les professionnels et les équipes</p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="text-red-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Crédit mensuel de 30€ pour les API</span>
              </li>
              <li className="flex items-start">
                <Check className="text-red-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Connexion illimitée aux sources de données</span>
              </li>
              <li className="flex items-start">
                <Check className="text-red-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Passerelle intelligente avancée</span>
              </li>
              <li className="flex items-start">
                <Check className="text-red-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Support prioritaire</span>
              </li>
              <li className="flex items-start">
                <Check className="text-red-500 w-5 h-5 mr-2 mt-0.5" />
                <span className="text-gray-300">Tarifs préférentiels sur les recharges de tokens</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleUpgradeToProPlan}
            >
              Passer au Pro
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
