import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, Sparkles, Database, Search } from "lucide-react";
import { FloatingPaper } from "@/components/landing/FloatingPaper";
import { FrenchAnimation } from "@/components/landing/FrenchAnimation";

interface HeroProps {
  onJoinBeta?: () => void;
  onSeeExamples?: () => void;
}

export default function Hero({ onJoinBeta, onSeeExamples }: HeroProps) {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingPaper count={6} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Transformez vos drives en 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-white to-red-600">
                {" "}
                bases de connaissances
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto"
          >
            Indexez et interrogez l'ensemble de vos documents Google Drive, Microsoft Teams et Dropbox par lots pour créer une bibliothèque intelligente consultable par IA.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-400 text-lg mb-8 max-w-3xl mx-auto"
          >
            <p>
              Notre technologie d'indexation par lots analyse rapidement des milliers de documents, 
              créant une base de connaissances interrogeable en langage naturel, le tout en préservant 
              la sécurité de vos données grâce à notre passerelle IA locale/cloud.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              onClick={onJoinBeta}
            >
              <Database className="mr-2 h-5 w-5" />
              Rejoindre la beta
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-red-500 hover:bg-red-500/20"
              onClick={onSeeExamples}
            >
              <Search className="mr-2 h-5 w-5" />
              Voir comment ça marche
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Animated French flag */}
      <div className="absolute bottom-0 right-0 w-96 h-96">
        <FrenchAnimation />
      </div>
    </div>
  );
}
