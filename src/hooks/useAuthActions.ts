
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Tentative de connexion avec email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('Connexion réussie:', data.user?.id);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });
      
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Erreur de connexion:', error.message);
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    setIsLoading(true);
    try {
      console.log('Tentative d\'inscription avec email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      
      console.log('Inscription réussie, vérifiez votre email');
      toast({
        title: 'Inscription réussie',
        description: 'Vérifiez votre email pour confirmer votre compte.',
      });
      
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error.message);
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log('Tentative de déconnexion');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Déconnexion réussie');
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt !',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error.message);
      toast({
        title: 'Erreur de déconnexion',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    isLoading,
  };
}
