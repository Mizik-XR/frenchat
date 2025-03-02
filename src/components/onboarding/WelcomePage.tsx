
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogoImage } from "@/components/common/LogoImage";
import { ArrowRight } from "lucide-react";

export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md border-purple-200 shadow-xl overflow-hidden animate-fade-in">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex flex-col items-center gap-4">
              <LogoImage className="h-24 w-24" />
              <h1 className="text-4xl font-bold text-purple-900 tracking-tight">
                Frenchat
              </h1>
            </div>
            
            <p className="text-lg text-purple-700">
              La seule application qui indexe l'intégralité de vos documents en un clic
            </p>
            
            <div className="bg-purple-100 rounded-lg p-4 text-sm text-purple-800 leading-relaxed">
              <p className="font-medium mb-2">
                Contrairement à d'autres solutions, Frenchat est unique :
              </p>
              <p className="mb-2">
                Frenchat indexe automatiquement tous vos documents depuis Google Drive 
                et Microsoft Teams, vous permettant d'interagir avec l'ensemble de votre 
                base documentaire sans sélection manuelle préalable.
              </p>
              <p className="font-medium text-purple-900">
                100% local et open source : vos données restent privées et sous votre contrôle
              </p>
            </div>
            
            <div className="w-full pt-4">
              <Button 
                onClick={() => navigate("/auth")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-6"
              >
                Commencer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="mt-4 flex justify-center">
                <span className="text-sm text-gray-500">Vous avez déjà un compte ?</span>
                <Button 
                  variant="link" 
                  className="text-purple-600 font-medium p-0 h-auto ml-1"
                  onClick={() => navigate("/auth", { state: { tab: "signin" } })}
                >
                  Se connecter
                </Button>
              </div>
              
              <div className="mt-2 flex justify-center">
                <Button 
                  variant="link" 
                  className="text-purple-600 font-medium h-auto"
                  onClick={() => navigate("/auth", { state: { tab: "signup" } })}
                >
                  Créez un compte
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
