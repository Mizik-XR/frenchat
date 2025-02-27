
import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Erreur non gérée dans l'application:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, afficher un fallback par défaut avec le GIF animé
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/fb21020a-04ad-4e58-9d53-3224ce760584.png" 
                alt="FileChat Logo" 
                className="h-24 w-24"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Oooops !
            </h2>
            
            <p className="text-gray-700 mb-6">
              Une erreur inattendue s'est produite. Nous vous prions de nous excuser pour ce désagrément.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Recharger l'application
              </Button>
              
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false })}
                className="w-full"
              >
                Réessayer
              </Button>
            </div>
            
            {this.state.error && (
              <Alert className="mt-6 bg-gray-50 border-gray-200">
                <AlertTitle className="text-sm font-medium text-gray-800">
                  Détails techniques
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="p-2 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-32 text-left">
                    <pre>{this.state.error.message}</pre>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
