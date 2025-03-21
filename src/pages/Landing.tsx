
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';

const Landing = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Créer les particules
    const createStars = () => {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;
      
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'absolute rounded-full bg-white opacity-70';
        
        // Taille aléatoire
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Position aléatoire
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Animation aléatoire
        star.style.animation = `twinkle ${Math.random() * 5 + 5}s infinite`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        starsContainer.appendChild(star);
      }
    };
    
    createStars();
    
    return () => {
      const starsContainer = document.getElementById('stars-container');
      if (starsContainer) {
        starsContainer.innerHTML = '';
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Container pour les étoiles */}
      <div id="stars-container" className="absolute inset-0 pointer-events-none"></div>
      
      {/* Overlay avec grille pour effet */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
      
      {/* Contenu de la page */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-2xl font-bold">FC</span>
            </div>
            <h1 className="text-2xl font-bold">FileChat</h1>
          </div>
          
          <div className="space-x-4">
            <Link to="/auth">
              <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                Connexion
              </Button>
            </Link>
            <Link to="/demo">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Démo
              </Button>
            </Link>
          </div>
        </header>
        
        {/* Section principale */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
          <div>
            <div className="mb-8">
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                <span className="block">Dialoguez avec vos documents</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  Avec l'IA française
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                FileChat analyse vos documents et vous permet d'interagir avec leur contenu en langage naturel. Posez des questions, générez des résumés et explorez vos données comme jamais auparavant.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Essayer gratuitement
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800">
                    Documentation
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                100% Open Source
              </div>
              <div className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-700 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                IA locale ou cloud
              </div>
              <div className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                Conforme RGPD
              </div>
            </div>
          </div>
          
          {/* Image flottante */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg filter blur-2xl"></div>
            <div className="animate-float">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
                <div className="border-b border-gray-700 p-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <div className="ml-4 text-sm text-gray-400">FileChat</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="bg-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 flex-1">
                      Peux-tu me résumer les points clés du rapport financier Q2 2023?
                    </div>
                  </div>
                  <div className="flex justify-end mb-4">
                    <div className="bg-blue-600/30 rounded-lg px-4 py-3 text-sm text-blue-100 max-w-md ml-12">
                      <p>Voici les points clés du rapport financier Q2 2023:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Revenus: 2.3M€ (+15% vs Q1)</li>
                        <li>Marge brute: 62%</li>
                        <li>Nouveaux clients: 28</li>
                        <li>EBITDA: 430K€</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex mt-8">
                    <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="bg-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 flex-1">
                      Génère un rapport visuel pour la réunion du comité de direction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Fonctionnalités */}
        <section className="mb-32">
          <h3 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Carte 1 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover-scale">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Chat avec vos documents</h4>
              <p className="text-gray-400">Posez des questions en langage naturel à vos documents PDF, Word, Excel et bien plus.</p>
            </div>
            
            {/* Carte 2 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover-scale">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">IA locale ou cloud</h4>
              <p className="text-gray-400">Choisissez entre une IA locale pour la confidentialité ou cloud pour plus de puissance.</p>
            </div>
            
            {/* Carte 3 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover-scale">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Intégrations multiples</h4>
              <p className="text-gray-400">Connectez-vous à Google Drive, Microsoft Teams, Slack et d'autres services.</p>
            </div>
          </div>
        </section>
        
        {/* Bannière avec drapeau */}
        <section className="mb-20">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 french-flag-gradient opacity-10"></div>
            <div className="relative bg-gray-800/70 p-8 md:p-12 rounded-2xl border border-gray-700">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Souveraineté numérique française
                  </h3>
                  <p className="text-gray-300 mb-6 max-w-2xl">
                    FileChat utilise des modèles d'IA français et européens pour garantir la souveraineté de vos données. Hébergement 100% en France, conforme RGPD.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 via-white to-red-600 text-gray-900 font-semibold hover:from-blue-700 hover:via-gray-100 hover:to-red-700">
                    En savoir plus
                  </Button>
                </div>
                <div className="flex-shrink-0 w-32 h-32 relative">
                  <div className="absolute inset-0 french-flag-gradient rounded-full opacity-80 animate-pulse"></div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🇫🇷</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-gray-800 pt-8 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold mb-4">Produit</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Démo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Ressources</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriels</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Société</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Suivez-nous</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>© 2023-2024 FileChat. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
      
      {/* Styles pour l'animation des étoiles */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
