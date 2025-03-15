
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Définir l'URL du site pour les redirections
export const SITE_URL = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}`
  : 'http://localhost:5173';

export function useAuthForms() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Tentative de connexion avec:", email);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Connexion réussie:", data.user?.id);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
        variant: "success"
      });
      
      // Redirection vers la page d'accueil après connexion
      navigate('/home');
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Tentative d'inscription avec:", email, "Nom complet:", fullName);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        }
      });
      
      if (error) throw error;
      
      console.log("Réponse d'inscription:", data);
      
      if (data.user && !data.session) {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte",
          variant: "success"
        });
        // Rester sur la page d'authentification pour que l'utilisateur puisse se connecter après confirmation
      } else if (data.session) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
          variant: "success"
        });
        // Redirection vers home
        navigate('/home');
      }
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Envoi d'un lien magique à:", email);
      console.log("URL de redirection:", `${SITE_URL}/auth/callback`);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${SITE_URL}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Lien magique envoyé",
        description: "Vérifiez votre email pour vous connecter",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Erreur de lien magique:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    confirmPassword,
    setConfirmPassword,
    rememberMe,
    setRememberMe,
    isLoading,
    handleSignIn,
    handleSignUp,
    handleMagicLink
  };
}
