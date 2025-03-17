
import { React, createContext, useContext } from '@/core/ReactInstance';
import { supabase } from '@/integrations/supabase/client';

// Créer un contexte simple pour fournir l'instance Supabase
const SupabaseContext = createContext(supabase);

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseContext;
