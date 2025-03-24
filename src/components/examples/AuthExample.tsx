import { useState  } from '@/core/reactInstance';
import { useSupabaseAuth, useSupabaseConnectivity } from '@/hooks/useSupabaseClient';

/**
 * Composant d'exemple montrant l'utilisation de l'architecture Supabase centralisée
 * Ce composant illustre comment utiliser les hooks personnalisés pour interagir
 * avec Supabase de manière cohérente et sans dépendances circulaires.
 */
export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  
  // Utiliser les hooks personnalisés au lieu d'importer directement supabase
  const { auth, isAuthenticated, userId, isLoading } = useSupabaseAuth();
  const { isConnected, isOfflineMode, setOfflineMode } = useSupabaseConnectivity();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isOfflineMode) {
      setMessage("Mode hors ligne activé - authentification indisponible");
      return;
    }
    
    try {
      setMessage("Connexion en cours...");
      
      const { error } = await auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      setMessage("Connexion réussie!");
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
    }
  };
  
  const handleLogout = async () => {
    if (isOfflineMode) {
      setMessage("Mode hors ligne activé - déconnexion indisponible");
      return;
    }
    
    try {
      await auth.signOut();
      setMessage("Déconnexion réussie!");
    } catch (error: any) {
      setMessage(`Erreur de déconnexion: ${error.message}`);
    }
  };
  
  const toggleOfflineMode = () => {
    setOfflineMode(!isOfflineMode);
    setMessage(`Mode hors ligne ${!isOfflineMode ? 'activé' : 'désactivé'}`);
  };
  
  if (isLoading) {
    return <div className="p-4">Chargement en cours...</div>;
  }
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Exemple d'authentification Supabase</h2>
      
      <div className="mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
        
        <button 
          onClick={toggleOfflineMode}
          className="ml-auto px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
        >
          {isOfflineMode ? 'Désactiver' : 'Activer'} mode hors ligne
        </button>
      </div>
      
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Erreur') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}
      
      {isAuthenticated ? (
        <div>
          <p className="mb-2">Vous êtes connecté!</p>
          <p className="mb-4 text-xs text-gray-500">ID Utilisateur: {userId}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="exemple@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm mb-1">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="********"
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Se connecter
          </button>
        </form>
      )}
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Note: Cet exemple utilise l'architecture centralisée Supabase avec:</p>
        <ul className="list-disc pl-4 mt-1">
          <li>useSupabaseAuth() - Pour l'authentification</li>
          <li>useSupabaseConnectivity() - Pour la gestion de la connectivité</li>
          <li>supabaseService - Pour les autres opérations</li>
        </ul>
      </div>
    </div>
  );
} 