
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuth } from "@/components/AuthProvider";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const { loading, handleSignUp, handleSignIn, handleMagicLink } = useAuthActions();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp(email, password, confirmPassword, fullName);
  };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignIn(email, password, rememberMe);
  };

  const onMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleMagicLink(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-xl bg-white">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
            <TabsTrigger value="signin" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-primary">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-primary">
              Inscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4 space-y-4">
            <SignInForm
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSignIn={onSignIn}
              handleMagicLink={onMagicLink}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
            />
          </TabsContent>

          <TabsContent value="signup" className="mt-4 space-y-4">
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
              handleSignUp={onSignUp}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
