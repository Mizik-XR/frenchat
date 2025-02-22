import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

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

    try {
      setLoading(true);

      // 1. On crée l'utilisateur avec Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 2. Si l'utilisateur est créé avec succès
      if (authData?.user) {
        // On attend un peu pour laisser le temps à la session d'être établie
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. On crée le profil de l'utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              full_name: fullName,
              is_first_login: true, // Ajout d'un flag pour détecter la première connexion
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // On continue car l'utilisateur est quand même créé
        }

        // 4. On vérifie si une confirmation par email est requise
        if (authData.session) {
          toast({
            title: "Inscription réussie !",
            description: "Votre compte a été créé avec succès. Configurons maintenant votre espace.",
          });
          navigate("/config");
        } else {
          toast({
            title: "Inscription r��ussie",
            description: "Veuillez vérifier votre email pour confirmer votre compte",
          });
        }
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Vérifie si c'est la première connexion
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_first_login')
        .eq('email', email)
        .single();

      if (profile?.is_first_login) {
        // Met à jour le flag is_first_login
        await supabase
          .from('profiles')
          .update({ is_first_login: false })
          .eq('email', email);

        toast({
          title: "Connexion réussie",
          description: "Bienvenue ! Configurons votre espace.",
        });
        navigate("/config");
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate("/chat");
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-xl">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <SignInForm
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSignIn={handleSignIn}
              handleMagicLink={handleMagicLink}
            />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              fullName={fullName}
              setFullName={setFullName}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              handleSignUp={handleSignUp}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
