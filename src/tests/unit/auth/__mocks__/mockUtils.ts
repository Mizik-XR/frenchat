
/**
 * Utilitaires pour les mocks de test
 */

export function createMockFunction<T, R>(implementation?: (...args: T[]) => R) {
  const fn = implementation || (() => undefined as unknown as R);
  fn.mockResolvedValue = (value: R) => {
    return jest.fn().mockResolvedValue(value) as unknown as typeof fn;
  };
  fn.mockImplementation = (impl: (...args: T[]) => R) => {
    return jest.fn(impl) as unknown as typeof fn;
  };
  fn.mockResolvedValueOnce = (value: R) => {
    return jest.fn().mockResolvedValueOnce(value) as unknown as typeof fn;
  };
  fn.mockRejectedValue = (reason: any) => {
    return jest.fn().mockRejectedValue(reason) as unknown as typeof fn;
  };
  return fn;
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
