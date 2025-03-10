
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { APP_STATE } from '@/integrations/supabase/client';

/**
 * Component that monitors and captures unhandled React errors
 * and displays them to the user in a non-intrusive way
 */
export const ReactErrorMonitor = () => {
  useEffect(() => {
    // Function to handle uncaught errors
    const handleUncaughtError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      
      // Avoid notifying for network errors that are already handled
      if (event.message && (
        event.message.includes('loading chunk') || 
        event.message.includes('network') ||
        event.message.includes('Failed to fetch') ||
        event.message.includes('NetworkError')
      )) {
        return;
      }
      
      // Detect React-related issues
      const isReactError = event.message && (
        event.message.includes('React') ||
        event.message.includes('useLayoutEffect') ||
        event.message.includes('unstable_scheduleCallback') ||
        event.message.includes('createElement')
      );
      
      if (isReactError) {
        console.warn('Potential React error detected, switching to fallback mode...');
        APP_STATE.isOfflineMode = true;
      }
      
      // Notify the user
      toast({
        title: "Problem detected",
        description: "An error occurred. The application is attempting to recover automatically.",
        variant: "destructive"
      });
    };

    // Function to handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Avoid notifying for certain types of errors
      if (event.reason && (
        event.reason.message?.includes('aborted') ||
        event.reason.message?.includes('canceled')
      )) {
        return;
      }
      
      // Detect API connection issues
      const isConnectionError = event.reason && (
        event.reason.message?.includes('fetch') ||
        event.reason.message?.includes('network') ||
        event.reason.message?.includes('ECONNREFUSED') ||
        event.reason.message?.includes('localhost')
      );
      
      if (isConnectionError) {
        console.warn('Connection issue detected, activating offline mode...');
        APP_STATE.isOfflineMode = true;
      }
      
      // Notify the user
      toast({
        title: "Operation failed",
        description: isConnectionError 
          ? "Connection issue detected. Offline mode activated." 
          : "A request failed. Please try again.",
        variant: "destructive"
      });
    };

    // Register event handlers
    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup function to remove event handlers
    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // This component doesn't render anything visually
  return null;
};
