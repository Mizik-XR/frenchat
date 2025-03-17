
/**
 * Utilitaires pour les mocks de test
 */

export function createMockFunction<T, R>(implementation?: (...args: T[]) => R) {
  const mock = jest.fn(implementation || (() => undefined as unknown as R));
  
  // Définir les méthodes sur l'objet mock lui-même
  mock.mockResolvedValue = function(value: R) {
    jest.fn().mockImplementation(() => Promise.resolve(value));
    return this;
  };
  
  mock.mockImplementation = function(fn: (...args: T[]) => R) {
    jest.fn().mockImplementation(fn);
    return this;
  };
  
  mock.mockResolvedValueOnce = function(value: R) {
    jest.fn().mockImplementation(() => Promise.resolve(value));
    return this;
  };
  
  mock.mockRejectedValue = function(reason: any) {
    jest.fn().mockImplementation(() => Promise.reject(reason));
    return this;
  };
  
  return mock;
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
    }
    function fn<T = any, Y extends any[] = any[]>(implementation?: (...args: Y) => T): Mock<T, Y>;
  }
}
