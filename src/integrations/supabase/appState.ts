
// Global app state management for offline mode and errors

// Global app state for handling offline mode
export const APP_STATE = {
  isOfflineMode: false,
  hasSupabaseError: false,
  lastSupabaseError: null as Error | null,
  
  setOfflineMode(value: boolean) {
    this.isOfflineMode = value;
    localStorage.setItem('OFFLINE_MODE', value ? 'true' : 'false');
    console.log(`Application ${value ? 'entered' : 'exited'} offline mode`);
  },
  
  logSupabaseError(error: Error) {
    this.hasSupabaseError = true;
    this.lastSupabaseError = error;
    console.error('Supabase error:', error);
  }
};

// Vérifier si l'application est en mode hors ligne
export const checkOfflineMode = () => {
  const savedMode = localStorage.getItem('OFFLINE_MODE');
  if (savedMode === 'true') {
    APP_STATE.setOfflineMode(true);
    return true;
  }
  return false;
};
