
import { vi } from 'vitest';

/**
 * Crée une fonction mock compatible avec Vitest
 */
export function createMockFunction() {
  return vi.fn().mockImplementation((...args) => {
    // Implémentation par défaut
    return Promise.resolve(null);
  });
}

/**
 * Ajoute des méthodes mock à une fonction mock
 */
export function enhanceMockFunction(mock) {
  mock.mockResolvedValue = (value) => {
    mock.mockImplementation(() => Promise.resolve(value));
    return mock;
  };

  mock.mockImplementation = (fn) => {
    vi.fn().mockImplementation(fn);
    return mock;
  };

  mock.mockResolvedValueOnce = (value) => {
    mock.mockImplementation(() => Promise.resolve(value));
    return mock;
  };

  mock.mockRejectedValue = (reason) => {
    mock.mockImplementation(() => Promise.reject(reason));
    return mock;
  };

  mock.mockRejectedValueOnce = (reason) => {
    mock.mockImplementation(() => Promise.reject(reason));
    return mock;
  };

  mock.mockReset = () => {
    vi.resetAllMocks();
    return mock;
  };

  return mock;
}
