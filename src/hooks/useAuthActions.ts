import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ProfileWithFirstLogin = {
  is_first_login: boolean;
};

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (
    email: string,
    password: string,
    confirmPassword: string,
    fullName: string
  ) => {
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth?firstLogin=true`
        },
      });

      if (signUpError) throw signUpError;

      if (authData?.user) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              full_name: fullName,
              is_first_login: true,
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        toast({
          title: "Inscription réussie",
          description: "Veuillez vérifier votre email pour confirmer votre compte",
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_first_login')
        .eq('email', email)
        .single() as { data: ProfileWithFirstLogin | null };

      if (profile?.is_first_login) {
        await supabase
          .from('profiles')
          .update({ is_first_login: false })
          .eq('email', email);

        navigate("/config");
        toast({
          title: "Première connexion",
          description: "Bienvenue ! Configurons votre espace.",
        });
      } else {
        navigate("/chat");
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/config`
        }
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour vous connecter",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignUp,
    handleSignIn,
    handleMagicLink,
  };
}
