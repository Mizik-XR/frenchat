
/**
 * Utilitaires pour l'installation de l'IA locale
 */

/**
 * Télécharge les scripts d'installation pour la plateforme correspondante
 * @returns Promise résolu quand les scripts sont téléchargés
 */
export async function downloadInstallationScripts(): Promise<void> {
  try {
    // Détecter le système d'exploitation
    const platform = getPlatform();
    const fileName = getScriptFileName(platform);
    
    // Créer un élément a pour déclencher le téléchargement
    const element = document.createElement('a');
    element.href = `/scripts/${fileName}`;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erreur lors du téléchargement des scripts :', error);
    return Promise.reject(error);
  }
}

/**
 * Détermine le système d'exploitation actuel
 */
function getPlatform(): 'windows' | 'mac' | 'linux' | 'unknown' {
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
 * Obtient le nom du fichier de script approprié pour la plateforme
 */
function getScriptFileName(platform: 'windows' | 'mac' | 'linux' | 'unknown'): string {
  switch (platform) {
    case 'windows':
      return 'install-ollama-windows.bat';
    case 'mac':
      return 'install-ollama-mac.sh';
    case 'linux':
      return 'install-ollama-linux.sh';
    default:
      return 'install-ollama-windows.bat'; // Par défaut Windows
  }
}
