/**
 * Configuration des tests
 * 
 * Ce fichier est exécuté avant chaque test.
 * Il configure l'environnement de test et les mocks globaux.
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { setImmediate } from 'timers';

// Polyfills pour Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.setImmediate = setImmediate;

// Mock des variables d'environnement
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock de fetch
global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.sessionStorage = sessionStorageMock;

// Mock de window.location
const locationMock = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  toString: jest.fn(),
  hash: '',
  host: 'localhost',
  hostname: 'localhost',
  href: 'http://localhost',
  origin: 'http://localhost',
  pathname: '/',
  port: '',
  protocol: 'http:',
  search: ''
};
global.location = locationMock;

// Mock de window.crypto
const cryptoMock = {
  getRandomValues: jest.fn((buffer) => buffer),
  subtle: {
    digest: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
    generateKey: jest.fn(),
    deriveKey: jest.fn(),
    deriveBits: jest.fn(),
    importKey: jest.fn(),
    exportKey: jest.fn(),
    wrapKey: jest.fn(),
    unwrapKey: jest.fn()
  }
};
global.crypto = cryptoMock;

// Mock de window.performance
const performanceMock = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
  getEntriesByType: jest.fn(),
  getEntries: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  clearResourceTimings: jest.fn(),
  setResourceTimingBufferSize: jest.fn(),
  timeOrigin: Date.now()
};
global.performance = performanceMock;

// Mock de window.matchMedia
global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords = jest.fn();
};

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
}); 