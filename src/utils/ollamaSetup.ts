
import { toast } from "@/hooks/use-toast";

/**
 * Vérifie si Ollama est installé et accessible
 */
export async function checkOllamaInstalled(): Promise<boolean> {
  try {
    // Vérifier si le service Ollama répond
    const response = await fetch('http://localhost:11434/api/version', {
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 secondes de timeout
    });
    
    return response.ok;
  } catch (error) {
    console.log("Ollama n'est pas accessible:", error);
    return false;
  }
}

/**
 * Suggère à l'utilisateur d'installer Ollama avec les instructions
 */
export function promptOllamaInstallation() {
  toast({
    title: "Installation d'Ollama nécessaire",
    description: "Pour utiliser l'IA locale, veuillez installer Ollama",
    action: {
      label: "Télécharger",
      onClick: () => window.open('https://ollama.ai/download', '_blank')
    },
    duration: 10000
  });
}

/**
 * Vérifie si un modèle spécifique est disponible dans Ollama
 */
export async function checkModelAvailable(modelName: string = 'mistral'): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.models?.some((model: any) => model.name === modelName) || false;
  } catch (error) {
    console.log("Impossible de vérifier les modèles Ollama:", error);
    return false;
  }
}

/**
 * Télécharge un modèle Ollama si nécessaire
 */
export async function downloadOllamaModel(modelName: string = 'mistral'): Promise<{
  success: boolean;
  message: string;
}> {
  // Vérifier d'abord si le modèle existe déjà
  const modelExists = await checkModelAvailable(modelName);
  if (modelExists) {
    return { success: true, message: `Le modèle ${modelName} est déjà installé` };
  }
  
  try {
    // Démarrer le téléchargement du modèle
    toast({
      title: "Téléchargement du modèle",
      description: `Le modèle ${modelName} est en cours de téléchargement. Cela peut prendre plusieurs minutes.`,
      duration: 5000
    });
    
    const response = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: modelName })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors du téléchargement: ${error}`);
    }
    
    // Le téléchargement est asynchrone, donc on ne peut pas attendre sa fin ici
    // On informe juste l'utilisateur que ça a commencé
    return { 
      success: true, 
      message: `Le téléchargement du modèle ${modelName} a commencé` 
    };
  } catch (error) {
    console.error("Erreur lors du téléchargement du modèle:", error);
    return { 
      success: false, 
      message: `Erreur lors du téléchargement du modèle: ${error.message}` 
    };
  }
}

/**
 * Initialise automatiquement Ollama au démarrage de l'application
 */
export async function initializeOllama() {
  const isInstalled = await checkOllamaInstalled();
  
  if (!isInstalled) {
    // Ollama n'est pas installé, suggérer l'installation
    promptOllamaInstallation();
    return false;
  }
  
  // Vérifier si le modèle par défaut est disponible
  const defaultModel = 'mistral';
  const modelAvailable = await checkModelAvailable(defaultModel);
  
  if (!modelAvailable) {
    // Le modèle n'est pas installé, lancer le téléchargement
    const result = await downloadOllamaModel(defaultModel);
    
    if (result.success) {
      toast({
        title: "Téléchargement en cours",
        description: `Le modèle ${defaultModel} sera disponible après le téléchargement.`,
        duration: 5000
      });
    } else {
      toast({
        title: "Erreur",
        description: result.message,
        variant: "destructive"
      });
    }
  }
  
  return true;
}
