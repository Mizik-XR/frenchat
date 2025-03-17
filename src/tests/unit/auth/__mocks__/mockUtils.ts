
/**
 * Utilitaires pour les mocks de test
 */

export function createMockFunction<T, R>(implementation?: (...args: T[]) => R) {
  // Création d'une fonction mock de base
  const mockFn = jest.fn(implementation || (() => undefined as unknown as R));
  
  // Retourner la fonction avec les méthodes ajoutées
  return {
    ...mockFn,
    mockResolvedValue: (value: R) => {
      mockFn.mockImplementation(() => Promise.resolve(value));
      return mockFn;
    },
    mockImplementation: (fn: (...args: T[]) => R) => {
      mockFn.mockImplementation(fn);
      return mockFn;
    },
    mockResolvedValueOnce: (value: R) => {
      mockFn.mockImplementationOnce(() => Promise.resolve(value));
      return mockFn;
    },
    mockRejectedValue: (reason: any) => {
      mockFn.mockImplementation(() => Promise.reject(reason));
      return mockFn;
    },
    mockRejectedValueOnce: (reason: any) => {
      mockFn.mockImplementationOnce(() => Promise.reject(reason));
      return mockFn;
    }
  };
}

// Déclarations pour jest car il n'est pas forcément inclus dans les types
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mockResolvedValue: (value: T) => Mock<T, Y>;
      mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>;
      mockResolvedValueOnce: (value: T) => Mock<T, Y>;
      mockRejectedValue: (reason: any) => Mock<T, Y>;
      mockRejectedValueOnce: (reason: any) => Mock<T, Y>;
    }
    function fn<T = any, Y extends any[] = any[]>(implementation?: (...args: Y) => T): Mock<T, Y>;
  }
}
