import { React } from "@/core/ReactInstance";

import { Component, ErrorInfo, ReactNode  } from '@/core/reactInstance';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogoImage } from "@/components/common/LogoImage";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isCritical: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      isCritical: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Déterminer si l'erreur est critique (liée au rendu React)
    const errorMessage = error.message || '';
    const isCritical = 
      errorMessage.includes('unstable_scheduleCallback') || 
      errorMessage.includes('useLayoutEffect') ||
      errorMessage.includes('React.createRoot');
    
    return { 
      hasError: true, 
      error,
      isCritical
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Erreur non gérée dans l'application:", error, errorInfo);
    
    // Mettre à jour l'état avec les informations d'erreur
    this.setState({ 
      errorInfo,
      isCritical: this.state.isCritical || 
        error.message.includes('unstable_scheduleCallback') ||
        error.message.includes('useLayoutEffect')
    });
    
    // Enregistrer l'erreur pour diagnostic
    localStorage.setItem('last_error', JSON.stringify({
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString(),
      url: window.location.href
    }));
  }

  render() {
    if (this.state.hasError) {
      // Si c'est une erreur critique de rendu React, utiliser un écran de chargement spécial
      if (this.state.isCritical) {
        return (
          <LoadingScreen
            message="Erreur critique de rendu React"
            showRetry={true}
            onRetry={() => {
              localStorage.setItem('app_loading_issue', 'true');
              window.location.href = '/?forceCloud=true&mode=cloud&client=true';
            }}
          />
        );
      }
      
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, afficher un fallback par défaut avec le logo
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <LogoImage className="h-24 w-24" />
            </div>
            
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Oooops ! Une erreur est survenue
            </h2>
            
            <p className="text-gray-700 mb-6">
              L'application a rencontré un problème. Nous vous prions de nous excuser pour ce désagrément.
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
              
              <Button
                variant="ghost"
                onClick={() => {
                  // Réinitialiser le stockage local pour éviter une boucle d'erreurs
                  localStorage.removeItem('app_loading_issue');
                  localStorage.removeItem('last_route');
                  window.location.href = "/";
                }}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
            
            {this.state.error && (
              <div className="mt-6 space-y-2">
                <Button
                  variant="link"
                  onClick={() => {
                    const detailsElement = document.getElementById('error-details');
                    if (detailsElement) {
                      detailsElement.style.display = 
                        detailsElement.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  className="text-sm text-gray-500"
                >
                  Afficher/masquer les détails techniques
                </Button>
                
                <Alert className="bg-gray-50 border-gray-200" id="error-details" style={{ display: 'none' }}>
                  <AlertTitle className="text-sm font-medium text-gray-800">
                    Détails de l'erreur
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="p-2 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-32 text-left">
                      <p className="font-semibold">Message:</p>
                      <pre>{this.state.error.message}</pre>
                      
                      {this.state.error.stack && (
                        <>
                          <p className="font-semibold mt-2">Stack:</p>
                          <pre>{this.state.error.stack}</pre>
                        </>
                      )}
                      
                      {this.state.errorInfo && (
                        <>
                          <p className="font-semibold mt-2">Composant:</p>
                          <pre>{this.state.errorInfo.componentStack}</pre>
                        </>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
