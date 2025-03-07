
import { motion } from "framer-motion";
import { Database, ArrowRight, FileText, FileSearch, Zap } from "lucide-react";

export function BatchIndexingSection() {
  const steps = [
    {
      icon: <Database className="w-12 h-12 text-blue-500" />,
      title: "Connexion à vos drives",
      description: "Connectez votre Google Drive, Microsoft Teams ou Dropbox en quelques clics via OAuth sécurisé."
    },
    {
      icon: <FileText className="w-12 h-12 text-white" />,
      title: "Sélection des documents",
      description: "Choisissez les dossiers ou collections de documents que vous souhaitez transformer en base de connaissances."
    },
    {
      icon: <Zap className="w-12 h-12 text-red-500" />,
      title: "Indexation par lots",
      description: "Notre système traite vos documents par lots de manière parallèle, divisant le temps d'indexation par 10."
    },
    {
      icon: <FileSearch className="w-12 h-12 text-blue-500" />,
      title: "Interrogation intelligente",
      description: "Posez des questions en langage naturel et obtenez des réponses précises basées sur vos documents."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black/80 to-black/95">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comment ça fonctionne</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Notre technologie d'indexation par lots transforme vos documents en base de connaissances en quelques minutes
          </p>
        </motion.div>

        <div className="relative">
          {/* Ligne de connexion */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-red-500 transform -translate-y-1/2 hidden lg:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 relative z-10"
              >
                <div className="bg-black/50 rounded-full p-4 inline-block mb-6">{step.icon}</div>
                
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden lg:block">
                    <ArrowRight className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
