
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { React } from '@/core/ReactInstance';

interface AppState {
  conversationId: string | null;
  isNavOpen: boolean;
  currentView: string;
  authenticated: boolean;
}

type Action = 
  | { type: 'setConversationId'; payload: string | null }
  | { type: 'toggleNav' }
  | { type: 'setView'; payload: string }
  | { type: 'setAuthenticated'; payload: boolean };

const initialState: AppState = {
  conversationId: null,
  isNavOpen: false,
  currentView: 'home',
  authenticated: false
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setConversationId':
      return { ...state, conversationId: action.payload };
    case 'toggleNav':
      return { ...state, isNavOpen: !state.isNavOpen };
    case 'setView':
      return { ...state, currentView: action.payload };
    case 'setAuthenticated':
      return { ...state, authenticated: action.payload };
    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null
});

// Export à des fins de compatibilité avec le code existant
export const APP_STATE = {
  setAuthenticated: (value: boolean) => {
    // Implémentation simplifiée pour la compatibilité
    console.log('Setting authenticated state to:', value);
  }
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}
