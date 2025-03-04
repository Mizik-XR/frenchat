
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import { STAGE_DETAILS } from '../constants';
import { useDemo } from '../DemoContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const AuthStage = () => {
  const { currentStage, nextStage } = useDemo();
  const [email, setEmail] = useState('demo@filechat.app');
  const [password, setPassword] = useState('********');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuler une connexion
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté à FileChat Demo"
      });
      nextStage();
    }, 1500);
  };

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    
    // Simuler une connexion OAuth
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: `Connexion ${provider} réussie`,
        description: "Redirection vers la configuration..."
      });
      nextStage();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4">Authentification</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {STAGE_DETAILS[currentStage]}
        </p>
      </div>

      <Tabs defaultValue="email" className="max-w-md mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="oauth">OAuth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="email">Email</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-2">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">
                        Dans la démo, l'authentification est simulée. Dans l'application réelle, 
                        Supabase est utilisé pour gérer l'authentification de manière sécurisée.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
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
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="oauth">
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Connectez-vous avec un compte externe:
            </p>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center" 
              onClick={() => handleOAuthSignIn('Google')}
              disabled={isLoading}
            >
              <FcGoogle className="h-5 w-5" />
              Continuer avec Google
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center" 
              onClick={() => handleOAuthSignIn('Microsoft')}
              disabled={isLoading}
            >
              <BsMicrosoft className="h-4 w-4 text-blue-500" />
              Continuer avec Microsoft
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
