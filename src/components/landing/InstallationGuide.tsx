
import { Button } from "@/components/ui/button";
import { 
  TerminalSquare, 
  Server, 
  GitBranch, 
  Download, 
  ArrowRight, 
  CheckCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InstallationGuide() {
  const navigate = useNavigate();
  
  const handleInstallOllama = () => {
    navigate("/ollama-setup");
  };

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Installation simplifiée</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Installez FileChat sur votre machine en quelques étapes simples pour commencer à utiliser l'IA locale.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300">
            <div className="rounded-lg bg-blue-500/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Server className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">1. Installer Ollama</h3>
            <p className="text-gray-400 mb-4">
              Ollama permet d'exécuter des modèles d'IA en local sur votre ordinateur, sans envoyer vos données à des serveurs externes.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-400">Installation automatique et adaptée à votre système</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-400">Configuration optimisée selon votre matériel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-400">Intégration transparente avec FileChat</span>
              </div>
            </div>
            <Button onClick={handleInstallOllama} className="gap-2">
              <Download className="h-4 w-4" />
              Installer Ollama
            </Button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
            <div className="rounded-lg bg-purple-500/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
              <TerminalSquare className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">2. Script d'installation automatique</h3>
            <p className="text-gray-400 mb-4">
              Notre script effectue automatiquement toutes les étapes d'installation et de configuration pour vous.
            </p>
            <div className="bg-gray-950 rounded p-3 mb-6 font-mono text-sm text-gray-300 overflow-x-auto">
              <pre><code># Windows (Exécuter en tant qu'administrateur)
curl -o setup.bat https://filechat.app/setup.bat && setup.bat

# Mac/Linux
curl -fsSL https://filechat.app/setup.sh | bash</code></pre>
            </div>
            <Button variant="outline" onClick={() => window.open('/start-ollama.bat', '_blank')} className="gap-2">
              <GitBranch className="h-4 w-4" />
              Télécharger le script
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            variant="ghost" 
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            onClick={() => navigate("/config")}
          >
            Aller directement à la configuration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
