
/**
 * Ce fichier garantit que nous n'utilisons qu'une seule instance de React dans toute l'application
 * 
 * Utiliser cette importation au lieu d'importer directement depuis 'react'
 * aide à éviter les problèmes avec des instances multiples de React.
 */

import * as React from 'react';
import { createContext, useState, useEffect, useMemo, useCallback } from 'react';

// Exporter React directement
export { React };

// Exporter les hooks et autres utilitaires React
export {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback
};

/**
 * Version de React pour le débogage
 */
export const REACT_VERSION = React.version;

/**
 * Vérifie si l'instance React est correctement initialisée
 */
export function isReactInitialized(): boolean {
  return React != null && typeof React.createElement === 'function';
}

// Fonctions utilitaires pour vérifier l'état de React
export const ReactUtils = {
  version: React.version,
  isInitialized: isReactInitialized,
  createElement: React.createElement
};

// Par défaut, exporter React
export default React;
