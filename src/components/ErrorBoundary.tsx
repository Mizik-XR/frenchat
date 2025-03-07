
import { Component, ErrorInfo, ReactNode } from "react";
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
    const stackTrace = error.stack || '';
    
    const isCritical = 
      errorMessage.includes('React') || 
      errorMessage.includes('Cannot access') ||
      errorMessage.includes('undefined') ||
      errorMessage.includes('null') ||
      stackTrace.includes('react-dom') ||
      stackTrace.includes('react-router') ||
      errorMessage.includes('before initialization');
    
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
        error.message.includes('React') || 
        error.message.includes('Cannot access') ||
        error.message.includes('undefined') ||
        error.message.includes('null') ||
        error.stack?.includes('react-dom') ||
        error.stack?.includes('react-router') ||
        error.message.includes('before initialization')
    });
    
    // Enregistrer l'erreur pour diagnostic
    try {
      localStorage.setItem('last_error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        time: new Date().toISOString(),
        url: window.location.href
      }));
    } catch (e) {
      console.warn("Impossible d'enregistrer l'erreur dans localStorage", e);
    }
  }

  render() {
    if (this.state.hasError) {
      // Si c'est une erreur critique de rendu React, utiliser un écran de chargement spécial
      if (this.state.isCritical) {
        return (
          <LoadingScreen
            message="Une erreur critique est survenue"
            showRetry={true}
            onRetry={() => {
              try {
                localStorage.setItem('app_loading_issue', 'true');
              } catch (e) {
                console.warn("Impossible de stocker dans localStorage", e);
              }
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <LogoImage className="h-24 w-24" />
            </div>
            
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Oooops ! Une erreur est survenue
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              L'application a rencontré un problème. Nous vous prions de nous excuser pour ce désagrément.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
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
                  try {
                    localStorage.removeItem('app_loading_issue');
                    localStorage.removeItem('last_route');
                  } catch (e) {
                    console.warn("Impossible de supprimer des clés de localStorage", e);
                  }
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
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  Afficher/masquer les détails techniques
                </Button>
                
                <Alert className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700" id="error-details" style={{ display: 'none' }}>
                  <AlertTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Détails de l'erreur
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-32 text-left">
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
