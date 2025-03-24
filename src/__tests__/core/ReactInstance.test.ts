/**
 * Tests pour vérifier l'unicité de l'instance React
 */
import * as ReactOriginal from 'react';
import { React, detectMultipleReactInstances, checkReactInstance } from '@/core/ReactInstance';

// Déclaration de type pour les tests Jest
declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: any;

describe('ReactInstance', () => {
  test("L'instance React exportée est unique", () => {
    // Vérifier que l'instance React exportée est la même que l'instance originale
    expect(React).toBe(ReactOriginal);
    
    // Vérifier que React est correctement chargé
    expect(checkReactInstance()).toBe(true);
  });

  test("Tous les exports sont présents et fonctionnels", () => {
    // Vérifier que les hooks principaux sont exportés
    expect(typeof React.useState).toBe('function');
    expect(typeof React.useEffect).toBe('function');
    expect(typeof React.useContext).toBe('function');
    
    // Vérifier que les méthodes de création sont exportées
    expect(typeof React.createElement).toBe('function');
    expect(typeof React.createContext).toBe('function');
    expect(typeof React.Fragment).toBe('symbol');
  });
  
  test("La détection de plusieurs instances React fonctionne", () => {
    // Simuler une instance différente de React
    const mockReact = { ...React, version: 'mock' };
    
    // Sauvegarder l'instance React originale
    const originalReact = window.React;
    
    try {
      // Assigner la mock instance à window.React
      window.React = mockReact;
      
      // Vérifier que la détection fonctionne
      const { hasDifferentInstances, instanceDetails } = detectMultipleReactInstances();
      
      expect(hasDifferentInstances).toBe(true);
      expect(instanceDetails.thisVersion).not.toBe(instanceDetails.globalVersion);
      expect(instanceDetails.isSameObject).toBe(false);
      expect(instanceDetails.versionMismatch).toBe(true);
    } finally {
      // Restaurer l'instance React originale
      window.React = originalReact;
    }
  });
  
  test("ReactInstance exporte les mêmes méthodes que React original", () => {
    // Obtenir tous les noms de méthodes/propriétés exportées par React original
    const reactOriginalExports = Object.keys(ReactOriginal).filter(key => typeof ReactOriginal[key] !== 'undefined');
    
    // Vérifier que toutes les méthodes/propriétés sont présentes dans notre instance
    reactOriginalExports.forEach(exportName => {
      expect(React[exportName]).toBeDefined();
      
      // Vérifier que c'est exactement la même référence
      expect(React[exportName]).toBe(ReactOriginal[exportName]);
    });
  });
}); 