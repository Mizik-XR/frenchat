
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
                FileChat
              </h1>
            </div>
            
            <p className="text-lg text-purple-700">
              Votre assistant IA conversationnel pour l'analyse et l'indexation de documents
            </p>
            
            <div className="bg-purple-100 rounded-lg p-4 text-sm text-purple-800 leading-relaxed">
              <p>
                FileChat vous permet d'importer vos documents depuis Google Drive, 
                Microsoft Teams ou depuis votre ordinateur, et d'interagir avec eux 
                grâce à l'intelligence artificielle.
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
              
              <p className="mt-4 text-sm text-gray-500">
                Vous avez déjà un compte ? 
                <Button 
                  variant="link" 
                  className="text-purple-600 font-medium"
                  onClick={() => navigate("/auth")}
                >
                  Se connecter
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
