
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogoImage } from "../common/LogoImage";
import { ArrowRight, Download, Server, Cloud, Lock } from "lucide-react";

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleLearnMore = () => {
    navigate("/home");
  };

  // Vérifier si le mode cloud est forcé (pour adaptation de l'UI)
  const isCloudModeForced = window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true' || 
                           new URLSearchParams(window.location.search).get('forceCloud') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl w-full px-4 py-8 md:py-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LogoImage className="w-16 h-16 md:w-24 md:h-24" />
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Frenchat
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Votre assistant d'intelligence documentaire qui facilite l'accès à vos documents et les rend conversationnels.
          </p>
          {isCloudModeForced && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <Cloud size={14} />
              <span>Mode cloud activé</span>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Commencez à utiliser Frenchat</h2>
              <p className="text-gray-600">
                Pour exploiter pleinement les capacités de Frenchat, créez un compte pour configurer 
                vos sources documentaires et commencer à discuter avec vos documents.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleGetStarted} 
                  size="lg"
                  className="gap-2"
                >
                  Créer un compte <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleLearnMore} 
                  variant="outline" 
                  size="lg"
                >
                  En savoir plus
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Fonctionnalités principales :</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 text-blue-700 p-1 rounded-full mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Indexation et analyse de documents à partir de Google Drive et Microsoft Teams</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-purple-100 text-purple-700 p-1 rounded-full mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Chat conversationnel avec vos documents pour obtenir des réponses précises</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-700 p-1 rounded-full mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Génération de documents structurés et export vers Google Drive/Teams</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-md transition hover:shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Server className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium">IA locale disponible</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Frenchat fonctionne également en mode local avec Ollama pour une confidentialité totale de vos données.
            </p>
            {isCloudModeForced && (
              <p className="text-xs text-blue-600">
                Mode actuellement désactivé - vous pourrez l'activer après la configuration.
              </p>
            )}
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-md transition hover:shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Mode cloud prêt</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Utilisez Frenchat en mode cloud immédiatement, sans installation supplémentaire.
            </p>
            {isCloudModeForced && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <Lock size={12} /> Mode actif par défaut
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Frenchat - Version {import.meta.env.VITE_LOVABLE_VERSION || '1.0.0'}</p>
        </div>
      </div>
    </div>
  );
};
