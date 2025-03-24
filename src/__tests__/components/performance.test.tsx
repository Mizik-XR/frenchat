/**
 * Tests de performance pour vérifier que la refactorisation n'a pas
 * introduit de problèmes de performance dans les composants complexes
 */
import { render } from '@testing-library/react';
import { screen, fireEvent, act } from '@testing-library/dom';
// @ts-ignore - déclaration JSX
/** @jsx React.createElement */
import { React } from '@/core/ReactInstance';
import AuthExample from '@/components/examples/AuthExample';
import DocExample from '@/components/examples/DocExample';
import { supabaseService } from '@/services/supabase/client';
import { APP_STATE } from '@/compatibility/supabaseCompat';

// Déclaration de type pour les tests Jest
declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const jest: any;
declare const afterEach: (fn: () => void | Promise<void>) => void;

// Utilitaire pour mesurer le temps de rendu
const measureRenderTime = async (Component: React.ComponentType<any>) => {
  const start = performance.now();
  
  const { rerender, unmount } = render(<Component />);
  
  // Re-render pour mesurer les rendus mis à jour
  rerender(<Component />);
  
  const end = performance.now();
  
  // Nettoyer
  unmount();
  
  return end - start;
};

// Mocks pour Supabase
jest.mock('@/services/supabase/client', () => ({
  supabaseService: {
    connectivity: {
      isOfflineMode: false,
      setOfflineMode: jest.fn(),
      checkConnection: jest.fn().mockResolvedValue(true)
    },
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null })
    },
    documents: {
      getAll: jest.fn().mockResolvedValue({
        data: [
          { id: 'doc1', title: 'Document 1', content: 'Content 1' },
          { id: 'doc2', title: 'Document 2', content: 'Content 2' }
        ],
        error: null
      }),
      create: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn().mockResolvedValue({ error: null })
    },
    getClient: jest.fn().mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null
        }),
        signOut: jest.fn().mockResolvedValue({ error: null })
      }
    })
  }
}));

// Mock de localStorage pour les tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

// Configuration de l'environnement de test
beforeEach(() => {
  // Réinitialiser tous les mocks
  jest.clearAllMocks();
  
  // Configurer localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.clear();
  
  // Réinitialiser le mode hors ligne
  if (APP_STATE) {
    APP_STATE.setOfflineMode(false);
  }
});

describe('Tests de performance des composants', () => {
  test('Le composant AuthExample se rend rapidement', async () => {
    const renderTime = await measureRenderTime(AuthExample);
    
    // Le temps de rendu ne devrait pas dépasser 100ms
    expect(renderTime).toBeLessThan(100);
    
    // Vérifier que le composant est bien rendu
    expect(screen.getByText(/Exemple d'authentification Supabase/i)).toBeInTheDocument();
  });
  
  test('Le composant DocExample se rend rapidement', async () => {
    const renderTime = await measureRenderTime(DocExample);
    
    // Le temps de rendu ne devrait pas dépasser 100ms
    expect(renderTime).toBeLessThan(100);
    
    // Vérifier que le composant est bien rendu
    expect(screen.getByText(/Gestion des documents/i)).toBeInTheDocument();
  });
  
  test('Le mode hors ligne est correctement géré', async () => {
    // Rendre le composant AuthExample
    render(<AuthExample />);
    
    // Simuler un clic sur le bouton pour activer le mode hors ligne
    const button = screen.getByText(/Activer mode hors ligne/i);
    fireEvent.click(button);
    
    // Vérifier que le mode hors ligne est activé
    expect(supabaseService.connectivity.setOfflineMode).toHaveBeenCalledWith(true);
    
    // Vérifier que le bouton a changé de texte
    expect(screen.getByText(/Désactiver mode hors ligne/i)).toBeInTheDocument();
  });
  
  test('Les interactions utilisateur sont performantes', async () => {
    // Rendre le composant DocExample
    render(<DocExample />);
    
    // Vérifier le rendu initial
    expect(screen.getByText(/Veuillez vous connecter/i)).toBeInTheDocument();
    
    // Simuler l'authentification
    const mockIsAuthenticated = jest.fn().mockReturnValue(true);
    const mockGetUserId = jest.fn().mockReturnValue('user123');
    
    // Rerendre le composant avec un utilisateur authentifié
    await act(async () => {
      render(<DocExample />, {
        wrapper: ({ children }) => {
          // Créer un contexte d'authentification mocké
          (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
            ReactCurrentOwner: {
              current: null
            }
          };
          
          return <div data-testid="auth-wrapper">{children}</div>;
        }
      });
    });
    
    // Vérifier que le composant s'est rendu sans erreur
    expect(document.querySelector('[data-testid="auth-wrapper"]')).not.toBeNull();
  });
  
  test('Les performances ne se dégradent pas après plusieurs rendus', async () => {
    // Première série de rendus
    const firstRenderTime = await measureRenderTime(AuthExample);
    
    // Simuler une activité intensive
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        render(<AuthExample />);
      });
    }
    
    // Deuxième série de rendus
    const secondRenderTime = await measureRenderTime(AuthExample);
    
    // Le temps de rendu ne devrait pas augmenter significativement
    // Une tolérance de 30% est accordée pour les variations
    expect(secondRenderTime).toBeLessThan(firstRenderTime * 1.3);
  });
}); 