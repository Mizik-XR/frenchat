
export interface AuthFormProps {
  loading: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error?: string | null;
}

export interface SignInFormProps extends AuthFormProps {
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  handleMagicLink: (e: React.FormEvent) => Promise<void>;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  switchToSignUp: () => void;
  switchToPasswordReset: () => void;
}

export interface SignUpFormProps extends AuthFormProps {
  handleSignUp: (e: React.FormEvent) => Promise<void>;
  fullName: string;
  setFullName: (name: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  switchToSignIn: () => void;
}
