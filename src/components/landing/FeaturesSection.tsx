
import { motion } from "framer-motion";
import { Database, Shield, Zap, Cloud, Server, Settings } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Database className="w-10 h-10 text-blue-500" />,
      title: "Indexation Globale",
      description:
        "Indexez et interrogez l'ensemble de vos bases de données (Google Drive, Microsoft Teams, Dropbox) en un seul endroit.",
    },
    {
      icon: <Shield className="w-10 h-10 text-white" />,
      title: "Sécurité Prioritaire",
      description:
        "Approche sécuritaire pour vos données avec chiffrement de bout en bout et contrôle total sur vos informations.",
    },
    {
      icon: <Zap className="w-10 h-10 text-red-500" />,
      title: "Passerelle Intelligente",
      description:
        "Notre passerelle décide automatiquement d'utiliser l'IA locale ou cloud selon la complexité de vos requêtes.",
    },
    {
      icon: <Cloud className="w-10 h-10 text-blue-500" />,
      title: "IA Cloud Open Source",
      description: "Utilisez des modèles d'IA open source hébergés dans le cloud pour des tâches complexes.",
    },
    {
      icon: <Server className="w-10 h-10 text-white" />,
      title: "IA Locale",
      description: "Traitez vos données sensibles localement sans qu'elles ne quittent votre environnement.",
    },
    {
      icon: <Settings className="w-10 h-10 text-red-500" />,
      title: "APIs Configurables",
      description: "Utilisez vos propres API Hugging Face ou d'autres fournisseurs selon vos préférences.",
    },
  ];

  return (
    <section className="py-20 bg-black/80">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Fonctionnalités Innovantes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez comment Frenchat révolutionne la gestion et l'exploitation de vos données.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
