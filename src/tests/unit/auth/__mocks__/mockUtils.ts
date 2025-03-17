
/**
 * Utilitaires pour les mocks de test
 */

export function createMockFunction<T, R>(implementation?: (...args: T[]) => R) {
  const mock = jest.fn(implementation || (() => undefined as unknown as R));
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
