
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Terminal, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InstallationDocs: React.FC = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: description,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Installation de FileChat</h1>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Environnement recommandé</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Node.js 16 ou supérieur</li>
            <li>NPM 7 ou supérieur</li>
            <li>4 Go de RAM minimum (8 Go recommandé)</li>
            <li>2 Go d'espace disque libre</li>
            <li>Connexion Internet stable</li>
          </ul>
        </div>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Installation sous Windows</h2>
            <div className="bg-black rounded-md p-4 mb-4">
              <div className="flex items-start">
                <pre className="text-white overflow-x-auto w-full">
                  <code>
{`# Télécharger et installer Node.js
# Puis exécuter les commandes suivantes dans un terminal:
git clone https://github.com/votre-repo/filechat.git
cd filechat
npm install
npm run build
npm run start`}
                  </code>
                </pre>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(
                    "git clone https://github.com/votre-repo/filechat.git\ncd filechat\nnpm install\nnpm run build\nnpm run start", 
                    "Commandes copiées"
                  )}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <p className="mb-4">Ou utilisez notre script d'installation automatique :</p>
            <Button 
              className="gap-2 mb-2"
              onClick={() => {
                toast({
                  title: "Installation guidée",
                  description: "Dans l'intégration Vercel, ce bouton mènera à un guide d'installation"
                });
              }}
            >
              <Download className="w-4 h-4" />
              Guide d'installation Windows
            </Button>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Installation sous macOS/Linux</h2>
            <div className="bg-black rounded-md p-4 mb-4">
              <div className="flex items-start">
                <pre className="text-white overflow-x-auto w-full">
                  <code>
{`# Télécharger et installer Node.js
# Puis exécuter les commandes suivantes dans un terminal:
git clone https://github.com/votre-repo/filechat.git
cd filechat
npm install
npm run build
npm run start`}
                  </code>
                </pre>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(
                    "git clone https://github.com/votre-repo/filechat.git\ncd filechat\nnpm install\nnpm run build\nnpm run start", 
                    "Commandes copiées"
                  )}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <Button 
              className="gap-2"
              onClick={() => {
                toast({
                  title: "Installation guidée",
                  description: "Dans l'intégration Vercel, ce bouton mènera à un guide d'installation"
                });
              }}
            >
              <Download className="w-4 h-4" />
              Guide d'installation macOS/Linux
            </Button>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Mode développeur</h2>
            <div className="bg-black rounded-md p-4 mb-4">
              <div className="flex items-start">
                <pre className="text-white overflow-x-auto w-full">
                  <code>
{`git clone https://github.com/votre-repo/filechat.git
cd filechat
npm install
npm run dev`}
                  </code>
                </pre>
                <button 
                  className="ml-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(
                    "git clone https://github.com/votre-repo/filechat.git\ncd filechat\nnpm install\nnpm run dev", 
                    "Commandes pour le mode développeur copiées"
                  )}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
          
          <section className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Vous préférez le mode cloud ?
            </h2>
            <p className="mb-4">
              Aucune installation requise ! Utilisez directement notre application déployée sur Vercel.
            </p>
            <Link to="/auth">
              <Button>Accéder à l'application cloud</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InstallationDocs;
