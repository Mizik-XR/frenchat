
/**
 * Utilities for Lovable-specific features
 */

import { isLovableEnvironment } from "../environment/environmentDetection";

/**
 * Checks if the new Lovable component tagging feature is available
 */
export const hasComponentTagging = (): boolean => {
  return isLovableEnvironment() && typeof __LOVABLE_MODE__ !== 'undefined';
};

/**
 * Applies data attributes for Lovable component tagging
 * This is a helper function to add component tagging attributes to elements
 * when the application is running in Lovable
 */
export const getComponentTaggingProps = (componentName: string): Record<string, string> => {
  if (!hasComponentTagging()) {
    return {};
  }
  
  return {
    'data-lovable-component': componentName,
  };
};

/**
 * Checks if the Lovable script is correctly loaded
 */
export function isLovableScriptLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if the script is present in the document
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && script.src.includes('gptengineer.js')) {
      return true;
    }
  }
  return false;
}

/**
 * Attempts to inject the Lovable script if it's not already present
 */
export function injectLovableScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isLovableScriptLoaded()) {
      console.log("Script Lovable déjà chargé");
      resolve();
      return;
    }

    console.log("Tentative d'injection du script Lovable");
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    script.async = true;
    script.onload = () => {
      console.log("Script Lovable injecté avec succès");
      resolve();
    };
    script.onerror = (err) => {
      console.error("Erreur lors de l'injection du script Lovable", err);
      reject(err);
    };

    document.head.appendChild(script);
  });
}
