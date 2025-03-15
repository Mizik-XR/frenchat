
export interface AuthFormProps {
  loading: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error?: string | null;
}

export interface SignInFormProps extends AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  switchToSignUp: () => void;
  switchToPasswordReset: () => void;
}

export interface SignUpFormProps extends AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  switchToSignIn: () => void;
}
