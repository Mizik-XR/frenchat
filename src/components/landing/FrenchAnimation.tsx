
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export function FrenchAnimation() {
  return (
    <div className="relative w-full h-full">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-white/20 to-red-500/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-full opacity-30 blur-md"></div>
            <MessageSquare className="w-32 h-32 text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
