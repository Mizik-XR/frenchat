
import React, { useState, useEffect } from 'react';

// Composant App Minimal - Version ultra-simplifiée sans dépendances complexes
function AppMinimal() {
  const [status, setStatus] = useState('Chargement...');
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // Afficher un message de succès après le montage initial
    setStatus('Application chargée avec succès');
    
    // Journaliser le chargement réussi
    addLog('Application minimale chargée avec succès');
    addLog(`Mode: ${process.env.NODE_ENV || 'production'}`);
    addLog(`Navigateur: ${navigator.userAgent}`);
    
    // Vérifier si nous avons des erreurs au démarrage
    if (window.lastRenderError) {
      addLog(`Erreur précédente détectée: ${window.lastRenderError.message}`);
      setStatus('Récupération après erreur');
    }
    
    // Vérifier la disponibilité des fonctions React
    checkReactFunctions();
  }, []);
  
  // Ajouter un log à l'état
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };
  
  // Vérifier si les fonctions React sont disponibles
  const checkReactFunctions = () => {
    if (typeof window.unstable_scheduleCallback === 'function') {
      addLog('✅ unstable_scheduleCallback disponible (polyfill)');
    } else {
      addLog('❌ unstable_scheduleCallback non disponible');
    }
  };
  
  // Tester le chargement complet
  const testFullApp = () => {
    addLog('Test de chargement de l\'application complète...');
    
    import('./App').then(() => {
      addLog('✅ App.tsx importé avec succès');
      window.location.href = '/';
    }).catch(error => {
      addLog(`❌ Erreur lors du chargement de App.tsx: ${error.message}`);
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <div className="text-white text-2xl">✓</div>
        </div>
        
        <h1 className="text-2xl font-bold text-blue-800 mb-4">Filechat</h1>
        <div className="text-lg mb-6 text-blue-700">{status}</div>
        
        <div className="flex flex-col gap-3">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            onClick={testFullApp}
          >
            Tester l'application complète
          </button>
          
          <button 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded transition"
            onClick={() => window.location.href = '/diagnostic.html'}
          >
            Ouvrir la page de diagnostic
          </button>
          
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
            onClick={() => window.location.reload()}
          >
            Rafraîchir la page
          </button>
        </div>
        
        {logs.length > 0 && (
          <div className="mt-8 text-left">
            <h2 className="font-semibold mb-2 text-gray-700">Logs:</h2>
            <div className="bg-gray-50 p-3 rounded-md text-xs font-mono text-gray-700 max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-6">
        Version minimale de Filechat pour diagnostiquer les problèmes de chargement
      </p>
    </div>
  );
}

export default AppMinimal;
