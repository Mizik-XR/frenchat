
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Key, LogIn } from "lucide-react";
import { AuthFormProps } from "./types";

interface SignInFormProps extends AuthFormProps {
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  handleMagicLink: (e: React.FormEvent) => Promise<void>;
}

export function SignInForm({ 
  loading, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleSignIn,
  handleMagicLink 
}: SignInFormProps) {
  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="signin-email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password">Mot de passe</Label>
        <div className="relative">
          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        <LogIn className="w-4 h-4 mr-2" />
        {loading ? "Connexion..." : "Se connecter"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleMagicLink}
        disabled={loading}
      >
        <Mail className="w-4 h-4 mr-2" />
        Connexion avec un lien magique
      </Button>
    </form>
  );
}
