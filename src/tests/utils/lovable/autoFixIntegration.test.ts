
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { autoFixLovableIntegration } from '../../../utils/lovable/autoFixIntegration';
import * as lovableDiagnostic from '../../../utils/diagnostic/lovableDiagnostic';

describe('Lovable Integration', () => {
  // Mock des dépendances
  beforeEach(() => {
    // Mock du DOM
    global.document = {
      ...global.document,
      createElement: vi.fn().mockImplementation((tag) => {
        if (tag === 'script') {
          return {
            src: '',
            type: '',
            dataset: {},
            async: false
          };
        }
        return {};
      }),
      head: {
        insertBefore: vi.fn(),
        appendChild: vi.fn(),
        firstChild: {}
      },
      readyState: 'complete',
      querySelectorAll: vi.fn().mockReturnValue([])
    } as any;

    // Mock de window
    global.window = {
      ...global.window,
      location: {
        search: ''
      },
      addEventListener: vi.fn()
    } as any;

    // Mock des fonctions de diagnostic
    vi.spyOn(lovableDiagnostic, 'runLovableDiagnostic').mockReturnValue({
      reactVersion: '18.2.0',
      lovablePresent: false,
      windowReact: true,
      reactInstancesMatch: false,
      circularImports: [] // Ajout de la propriété manquante
    });
    
    vi.spyOn(lovableDiagnostic, 'checkLovableScriptPresence').mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('devrait détecter correctement les problèmes d\'intégration', () => {
    const issues = autoFixLovableIntegration();
    
    expect(issues).toEqual({
      scriptMissing: true,
      reactInstanceMismatch: true,
      lovableNotInitialized: true,
      documentReady: true
    });
  });

  it('devrait essayer d\'injecter le script quand il est manquant', () => {
    autoFixLovableIntegration();
    
    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(document.head.insertBefore).toHaveBeenCalled();
  });

  it('devrait détecter quand tout est correctement configuré', () => {
    // Modifier les mocks pour simuler une configuration correcte
    vi.spyOn(lovableDiagnostic, 'runLovableDiagnostic').mockReturnValue({
      reactVersion: '18.2.0',
      lovablePresent: true,
      windowReact: true,
      reactInstancesMatch: true,
      circularImports: [] // Ajout de la propriété manquante
    });
    
    vi.spyOn(lovableDiagnostic, 'checkLovableScriptPresence').mockReturnValue(true);
    
    const issues = autoFixLovableIntegration();
    
    expect(issues).toEqual({
      scriptMissing: false,
      reactInstanceMismatch: false,
      lovableNotInitialized: false,
      documentReady: true
    });
  });
});
