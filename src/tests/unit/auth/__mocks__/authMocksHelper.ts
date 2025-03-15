
/**
 * Helpers pour les mocks des tests d'authentification
 */

// Cette fonction crée un mock Jest à partir d'une fonction normale
export const createJestMock = <T extends (...args: any[]) => any>(
  fn: T
): jest.MockedFunction<T> => {
  return fn as unknown as jest.MockedFunction<T>;
};

// Types pour Jest
declare global {
  namespace jest {
    interface MockedFunction<T extends (...args: any[]) => any> {
      mockResolvedValue: (value: ReturnType<T> extends Promise<infer U> ? U : never) => this;
      mockImplementation: (fn: (...args: Parameters<T>) => ReturnType<T>) => this;
    }
  }
}
