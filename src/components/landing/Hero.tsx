
import React from "react";
import { Button } from "@/components/ui/button";
import { MoveRight, Download, Bot, Database } from "lucide-react";
import { TypewriterEffect } from "./TypewriterEffect";

interface HeroProps {
  onJoinBeta: () => void;
  onSeeExamples: () => void;
}

export default function Hero({ onJoinBeta, onSeeExamples }: HeroProps) {
  const words = [
    { text: "Interrogez" },
    { text: "vos" },
    { text: "documents" },
    { text: "avec" },
    { text: "FileChat." },
    { text: "🚀", className: "text-blue-500" },
  ];

  return (
    <div className="relative overflow-hidden py-20 md:py-32 flex flex-col items-center text-center">
      <div className="absolute inset-0 bg-grid-small-white/[0.05] z-0" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <TypewriterEffect words={words} />
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 md:leading-relaxed max-w-2xl mx-auto">
            FileChat vous permet d'indexer vos documents, d'y connecter l'intelligence artificielle, 
            et d'obtenir des réponses pertinentes issues directement de vos données.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
              <Bot className="h-8 w-8 mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold text-white mb-2">IA locale ou cloud</h3>
              <p className="text-gray-300 text-sm">
                Utilisez Mistral en local pour une confidentialité totale ou des modèles cloud pour plus de puissance.
              </p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
              <Database className="h-8 w-8 mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Intégrations multiples</h3>
              <p className="text-gray-300 text-sm">
                Connectez Google Drive, Microsoft Teams, ou importez vos propres fichiers en quelques clics.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <Button 
              onClick={onJoinBeta}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Commencer gratuitement
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={onSeeExamples}
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Voir les fonctionnalités
            </Button>
          </div>
          
          <div className="pt-6">
            <a 
              href="/ollama-setup" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Download className="h-4 w-4" />
              Installer l'IA locale avec Ollama
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
