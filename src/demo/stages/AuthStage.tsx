
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDemo } from '../DemoContext';
import { Check, Mail } from 'lucide-react';

export const AuthStage = () => {
  const { nextStage } = useDemo();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleAuth = () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    
    // Simuler une connexion
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Passer à l'étape suivante après un court délai
      setTimeout(() => {
        nextStage();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Authentification utilisateur</h3>
        <p className="text-muted-foreground">
          FileChat utilise Supabase pour l'authentification sécurisée. 
          Pour cette démo, vous pouvez simplement entrer un email pour simuler la connexion.
        </p>
      </div>

      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Connexion à FileChat</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à vos documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="exemple@domaine.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleAuth} 
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 flex items-center space-x-4">
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-200">Authentification réussie</h4>
            <p className="text-green-600 dark:text-green-400 text-sm">
              Connexion établie pour {email}
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Options d'authentification complètes
        </h4>
        <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
          Dans la version complète, FileChat prend en charge l'authentification par email/mot de passe, 
          Google OAuth, Microsoft OAuth, et autres méthodes SSO.
        </p>
      </div>
    </div>
  );
};
