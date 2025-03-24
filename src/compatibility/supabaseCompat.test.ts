import { CompatAppState } from './supabaseCompat';

describe('CompatAppState', () => {
  let compatAppState: CompatAppState;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
      key: (index: number) => Object.keys(localStorageMock)[index] || null,
      length: Object.keys(localStorageMock).length
    };
    compatAppState = new CompatAppState();
  });

  describe('offline mode', () => {
    it('should be false by default', () => {
      expect(compatAppState.isOfflineMode()).toBe(false);
      expect(localStorage.getItem('OFFLINE_MODE')).toBeNull();
    });

    it('should set offline mode and persist to localStorage', () => {
      compatAppState.setOfflineMode(true);
      expect(compatAppState.isOfflineMode()).toBe(true);
      expect(localStorage.getItem('OFFLINE_MODE')).toBe('true');
    });

    it('should toggle offline mode', () => {
      const initialState = compatAppState.isOfflineMode();
      compatAppState.setOfflineMode(!initialState);
      expect(compatAppState.isOfflineMode()).toBe(!initialState);
      expect(localStorage.getItem('OFFLINE_MODE')).toBe((!initialState).toString());
    });
  });

  describe('error logging', () => {
    let consoleSpy: jest.SpyInstance;
    let gtagSpy: jest.Mock;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      gtagSpy = jest.fn();
      Object.defineProperty(window, 'gtag', {
        writable: true,
        value: gtagSpy
      });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      // @ts-ignore
      delete window.gtag;
    });

    it('should log errors correctly', () => {
      const testError = new Error('Test error');
      compatAppState.logSupabaseError(testError);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Supabase Error]:', testError);
      expect(gtagSpy).toHaveBeenCalledWith('event', 'supabase_error', {
        error_message: testError.message,
        error_stack: testError.stack
      });
    });

    it('should maintain error log history', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      compatAppState.logSupabaseError(error1);
      compatAppState.logSupabaseError(error2);

      const errorLog = compatAppState.getErrorLog();
      expect(errorLog).toHaveLength(2);
      expect(errorLog[0]).toBe(error1);
      expect(errorLog[1]).toBe(error2);
    });

    it('should clear error log', () => {
      compatAppState.logSupabaseError(new Error('Test error'));
      expect(compatAppState.getErrorLog()).toHaveLength(1);

      compatAppState.clearErrorLog();
      expect(compatAppState.getErrorLog()).toHaveLength(0);
    });
  });
}); 