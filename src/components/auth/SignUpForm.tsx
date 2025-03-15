
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Key, UserPlus } from "lucide-react";
import { AuthFormProps } from "./types";

interface SignUpFormProps extends AuthFormProps {
  fullName: string;
  setFullName: (name: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  handleSignUp: (e: React.FormEvent) => Promise<void>;
}

export function SignUpForm({
  loading,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  confirmPassword,
  setConfirmPassword,
  handleSignUp
}: SignUpFormProps) {
  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nom complet</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Jean Dupont"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="signup-email"
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
        <Label htmlFor="signup-password">Mot de passe</Label>
        <div className="relative">
          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
        <div className="relative">
          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        <UserPlus className="w-4 h-4 mr-2" />
        {loading ? "Création..." : "Créer un compte"}
      </Button>
    </form>
  );
}
