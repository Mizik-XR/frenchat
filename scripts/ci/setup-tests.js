#!/usr/bin/env node
/**
 * Script de configuration pour l'exécution des tests dans un environnement CI/CD
 * 
 * Ce script configure l'environnement pour l'exécution des tests dans un
 * environnement CI/CD, en vérifiant les dépendances, en préparant la
 * configuration Supabase de test et en mettant en place les variables d'environnement.
 * 
 * Usage: node scripts/ci/setup-tests.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  envFilePath: '.env.test',
  sampleEnvFilePath: '.env.test.example',
  supabaseConfigPath: 'supabase/config.json',
  testFolder: 'tests',
  requiredEnvVars: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_APP_ENV',
  ],
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Fonctions utilitaires
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function warn(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
  return false;
}

// Vérifier si les dépendances sont installées
function checkDependencies() {
  info('Vérification des dépendances de test...');
  
  try {
    // Vérifier si Jest est installé
    try {
      execSync('npx jest --version', { stdio: 'pipe' });
    } catch (e) {
      warn('Jest n\'est pas installé. Installation en cours...');
      execSync('npm install --save-dev jest @testing-library/react @testing-library/jest-dom', { stdio: 'inherit' });
    }
    
    // Vérifier si les dépendances liées à MSW sont installées (pour les tests d'API)
    try {
      require.resolve('msw');
    } catch (e) {
      warn('MSW n\'est pas installé. Installation en cours...');
      execSync('npm install --save-dev msw', { stdio: 'inherit' });
    }
    
    success('Toutes les dépendances de test sont installées.');
    return true;
  } catch (e) {
    error(`Échec de la vérification des dépendances: ${e.message}`);
    return false;
  }
}

// Créer un fichier d'environnement pour les tests
function setupEnvironment() {
  info('Configuration de l\'environnement de test...');
  
  try {
    // Vérifier si le fichier .env.test existe
    if (!fs.existsSync(CONFIG.envFilePath)) {
      // Vérifier si le fichier .env.test.example existe
      if (fs.existsSync(CONFIG.sampleEnvFilePath)) {
        // Copier le fichier .env.test.example vers .env.test
        fs.copyFileSync(CONFIG.sampleEnvFilePath, CONFIG.envFilePath);
        success(`Fichier ${CONFIG.envFilePath} créé à partir de ${CONFIG.sampleEnvFilePath}.`);
      } else {
        // Créer un fichier .env.test de base
        const envContent = CONFIG.requiredEnvVars.map(envVar => `${envVar}=test-value`).join('\n');
        fs.writeFileSync(CONFIG.envFilePath, envContent, 'utf8');
        warn(`Fichier ${CONFIG.envFilePath} créé avec des valeurs par défaut. Veuillez les modifier si nécessaire.`);
      }
    } else {
      info(`Fichier ${CONFIG.envFilePath} trouvé.`);
    }
    
    // Vérifier si le fichier contient toutes les variables d'environnement requises
    const envContent = fs.readFileSync(CONFIG.envFilePath, 'utf8');
    const missingVars = CONFIG.requiredEnvVars.filter(envVar => !envContent.includes(envVar));
    
    if (missingVars.length > 0) {
      const missingContent = missingVars.map(envVar => `${envVar}=test-value`).join('\n');
      fs.appendFileSync(CONFIG.envFilePath, `\n${missingContent}`);
      warn(`Variables d'environnement manquantes ajoutées à ${CONFIG.envFilePath}: ${missingVars.join(', ')}`);
    }
    
    // Définir la variable d'environnement pour indiquer que nous sommes en CI
    process.env.CI = 'true';
    process.env.VITE_APP_ENV = 'test';
    
    success('Environnement de test configuré avec succès.');
    return true;
  } catch (e) {
    error(`Échec de la configuration de l'environnement: ${e.message}`);
    return false;
  }
}

// Configurer les mocks pour les tests
function setupMocks() {
  info('Configuration des mocks pour les tests...');
  
  try {
    // Vérifier si le répertoire des mocks existe
    const mocksDir = path.join(CONFIG.testFolder, '__mocks__');
    if (!fs.existsSync(mocksDir)) {
      fs.mkdirSync(mocksDir, { recursive: true });
      success(`Répertoire ${mocksDir} créé.`);
    }
    
    // Créer un mock pour Supabase si nécessaire
    const supabaseMockPath = path.join(mocksDir, 'supabase.js');
    if (!fs.existsSync(supabaseMockPath)) {
      const supabaseMockContent = `
// Mock pour Supabase
const supabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-file-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com/test-file' } }),
      list: jest.fn().mockResolvedValue({ data: [], error: null }),
      remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
    }),
  },
};

export const createClient = jest.fn().mockReturnValue(supabaseClient);
export default supabaseClient;
`;
      fs.writeFileSync(supabaseMockPath, supabaseMockContent, 'utf8');
      success(`Mock Supabase créé: ${supabaseMockPath}`);
    }
    
    // Créer un setup pour MSW
    const mswSetupPath = path.join(CONFIG.testFolder, 'setup-msw.js');
    if (!fs.existsSync(mswSetupPath)) {
      const mswSetupContent = `
// Configuration de MSW pour les tests
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Exemple de handlers
const handlers = [
  rest.get('*/rest/v1/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
  rest.post('*/rest/v1/*', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 'test-id' }));
  }),
  rest.put('*/rest/v1/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 'test-id' }));
  }),
  rest.delete('*/rest/v1/*', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

// Configurer le serveur MSW
const server = setupServer(...handlers);

// Exporter le serveur
export { server, rest };
`;
      fs.writeFileSync(mswSetupPath, mswSetupContent, 'utf8');
      success(`Configuration MSW créée: ${mswSetupPath}`);
    }
    
    success('Mocks configurés avec succès.');
    return true;
  } catch (e) {
    error(`Échec de la configuration des mocks: ${e.message}`);
    return false;
  }
}

// Configurer les paramètres pour Jest
function setupJestConfig() {
  info('Configuration de Jest...');
  
  try {
    // Vérifier si le fichier jest.config.js existe
    const jestConfigPath = 'jest.config.js';
    if (!fs.existsSync(jestConfigPath)) {
      const jestConfigContent = `
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75,
    },
  },
};
`;
      fs.writeFileSync(jestConfigPath, jestConfigContent, 'utf8');
      success(`Fichier de configuration Jest créé: ${jestConfigPath}`);
    }
    
    // Vérifier si le fichier de setup Jest existe
    const jestSetupPath = path.join(CONFIG.testFolder, 'jest-setup.js');
    if (!fs.existsSync(jestSetupPath)) {
      const jestSetupContent = `
// Configuration générale pour les tests Jest
import '@testing-library/jest-dom';
import { server } from './setup-msw';

// Configurer MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock pour matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock pour localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Supprimer les erreurs de console pendant les tests
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
`;
      fs.writeFileSync(jestSetupPath, jestSetupContent, 'utf8');
      success(`Fichier de setup Jest créé: ${jestSetupPath}`);
    }
    
    // Créer des mocks pour les fichiers statiques
    const styleMockPath = path.join(CONFIG.testFolder, '__mocks__', 'styleMock.js');
    if (!fs.existsSync(styleMockPath)) {
      fs.mkdirSync(path.dirname(styleMockPath), { recursive: true });
      fs.writeFileSync(styleMockPath, 'module.exports = {};', 'utf8');
    }
    
    const fileMockPath = path.join(CONFIG.testFolder, '__mocks__', 'fileMock.js');
    if (!fs.existsSync(fileMockPath)) {
      fs.mkdirSync(path.dirname(fileMockPath), { recursive: true });
      fs.writeFileSync(fileMockPath, 'module.exports = "test-file-stub";', 'utf8');
    }
    
    success('Configuration de Jest terminée avec succès.');
    return true;
  } catch (e) {
    error(`Échec de la configuration de Jest: ${e.message}`);
    return false;
  }
}

// Fonction principale
async function main() {
  log('\n🔧 Configuration de l\'environnement de test CI/CD', colors.cyan);
  log('===============================================\n');
  
  let exitCode = 0;
  
  try {
    // Vérifier les dépendances
    if (!checkDependencies()) {
      exitCode = 1;
      return;
    }
    
    // Configurer l'environnement
    if (!setupEnvironment()) {
      exitCode = 1;
      return;
    }
    
    // Configurer les mocks
    if (!setupMocks()) {
      exitCode = 1;
      return;
    }
    
    // Configurer Jest
    if (!setupJestConfig()) {
      exitCode = 1;
      return;
    }
    
    success('\nEnvironnement de test CI/CD configuré avec succès! 🎉\n');
  } catch (e) {
    error(`Une erreur s'est produite: ${e.message}`);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Exécuter la fonction principale
main(); 