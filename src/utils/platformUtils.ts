
/**
 * Utilitaires liés à la détection et gestion des plateformes
 */

/**
 * Détecte la plateforme/système d'exploitation utilisé
 * @returns Plateforme détectée (windows, mac, linux ou unknown)
 */
export function getPlatform(): 'windows' | 'mac' | 'linux' | 'unknown' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) {
    return 'windows';
  } else if (userAgent.includes('mac')) {
    return 'mac';
  } else if (userAgent.includes('linux') || userAgent.includes('x11')) {
    return 'linux';
  } else {
    return 'unknown';
  }
}

/**
 * Vérifie si le système est compatible avec Ollama
 * @returns Booléen indiquant si le système est compatible
 */
export function isSystemOllamaCompatible(): boolean {
  const platform = getPlatform();
  
  // Ollama est disponible pour Windows, Mac et Linux
  return platform === 'windows' || platform === 'mac' || platform === 'linux';
}

/**
 * Obtient la commande d'installation appropriée pour la plateforme
 * @returns Commande d'installation pour la plateforme
 */
export function getOllamaInstallCommand(): string | null {
  const platform = getPlatform();
  
  switch (platform) {
    case 'windows':
      return 'Téléchargez et exécutez OllamaSetup.exe depuis le site officiel';
    case 'mac':
      return 'Téléchargez et installez Ollama.dmg depuis le site officiel';
    case 'linux':
      return 'curl -fsSL https://ollama.com/install.sh | sh';
    default:
      return null;
  }
}

/**
 * Vérifie si WSL est nécessaire pour l'installation sur Windows
 * @returns Booléen indiquant si WSL est nécessaire ou non
 */
export function isWSLRequired(): boolean {
  // Dans les versions récentes d'Ollama, WSL n'est plus nécessaire sur Windows
  return false;
}

/**
 * Obtient les prérequis spécifiques à la plateforme
 * @returns Liste des prérequis système
 */
export function getPlatformPrerequisites(): string[] {
  const platform = getPlatform();
  
  switch (platform) {
    case 'windows':
      return [
        'Windows 10 version 1909 ou ultérieure, ou Windows 11',
        'Droits administrateur pour l\'installation',
        'Minimum 8 Go de RAM (16 Go recommandés)',
        '10 Go d\'espace disque libre'
      ];
    case 'mac':
      return [
        'macOS 12 (Monterey) ou ultérieur',
        'Compatible avec processeurs Intel et Apple Silicon (M1/M2/M3)',
        'Minimum 8 Go de RAM (16 Go recommandés)',
        '10 Go d\'espace disque libre'
      ];
    case 'linux':
      return [
        'Distribution Linux récente (Ubuntu 20.04+, Debian 11+, Fedora 35+)',
        'Minimum 8 Go de RAM (16 Go recommandés)',
        '10 Go d\'espace disque libre',
        'Pilotes NVIDIA CUDA pour GPU (si applicable)'
      ];
    default:
      return [
        'Système compatible avec Ollama (Windows, Mac, Linux)',
        'Minimum 8 Go de RAM (16 Go recommandés)',
        '10 Go d\'espace disque libre'
      ];
  }
}
