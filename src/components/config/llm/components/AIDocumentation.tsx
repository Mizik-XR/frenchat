
import { ExternalLink } from "lucide-react";

export function AIDocumentation() {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 border border-blue-100 dark:border-blue-900">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Guide d'utilisation de l'IA locale</h3>
        
        <div className="mt-2 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Option 1: Hugging Face (Service Python)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ce service Python local utilise Mistral 7B par défaut et offre de bonnes performances.
            </p>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>Démarrez le serveur avec <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">python serve_model.py</code></li>
              <li>Requiert Python 3.8+ et environ 16 Go de RAM</li>
              <li>Le téléchargement du modèle se fait automatiquement</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Option 2: Ollama</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ollama est un service de modèles IA simples à installer et à utiliser sur différentes plateformes.
            </p>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>
                <a 
                  href="https://ollama.ai/download" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  Téléchargez Ollama
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>Installez et lancez Ollama sur votre machine</li>
              <li>Téléchargez un modèle avec <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ollama pull mistral</code></li>
              <li>L'URL par défaut est <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">http://localhost:11434</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
