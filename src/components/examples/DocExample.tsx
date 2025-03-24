import { useState, useEffect  } from '@/core/reactInstance';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { supabaseService } from '@/services/supabase/client';

/**
 * Composant d'exemple illustrant l'utilisation du service de documents Supabase
 * Ce composant démontre comment utiliser le service centralisé pour
 * gérer les opérations CRUD sur les documents
 */
export default function DocExample() {
  const { client, userId, isAuthenticated, isLoading, isOfflineMode } = useSupabaseClient();
  const [documents, setDocuments] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  
  // Charger les documents au montage du composant
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadDocuments();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, userId, isLoading]);
  
  async function loadDocuments() {
    try {
      setLoading(true);
      
      if (isOfflineMode) {
        setDocuments([
          { id: 'offline-1', title: 'Document hors ligne 1', content: 'Contenu disponible en mode hors ligne' },
          { id: 'offline-2', title: 'Document hors ligne 2', content: 'Contenu disponible en mode hors ligne' }
        ]);
        setMessage("Mode hors ligne: affichage des documents locaux");
        return;
      }
      
      // Utiliser le service documents pour récupérer les documents de l'utilisateur
      const { data, error } = await supabaseService.documents.getAll(userId!);
      
      if (error) throw error;
      
      setDocuments(data || []);
      clearMessage();
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleCreateDocument(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title || !content) {
      setMessage("Veuillez remplir tous les champs");
      return;
    }
    
    if (isOfflineMode) {
      setMessage("Mode hors ligne: impossible de créer un document");
      return;
    }
    
    try {
      setLoading(true);
      
      // Créer un nouveau document en utilisant le service centralisé
      const { error } = await supabaseService.documents.create({
        title,
        content,
        document_type: 'note',
        user_id: userId!
      });
      
      if (error) throw error;
      
      setTitle('');
      setContent('');
      setMessage("Document créé avec succès!");
      
      // Recharger la liste des documents
      loadDocuments();
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
      setLoading(false);
    }
  }
  
  async function handleUpdateDocument(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedDoc) {
      setMessage("Aucun document sélectionné");
      return;
    }
    
    if (!title || !content) {
      setMessage("Veuillez remplir tous les champs");
      return;
    }
    
    if (isOfflineMode) {
      setMessage("Mode hors ligne: impossible de mettre à jour un document");
      return;
    }
    
    try {
      setLoading(true);
      
      // Mettre à jour le document en utilisant le service centralisé
      const { error } = await supabaseService.documents.update(selectedDoc, {
        title,
        content,
        updated_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      setTitle('');
      setContent('');
      setSelectedDoc(null);
      setMessage("Document mis à jour avec succès!");
      
      // Recharger la liste des documents
      loadDocuments();
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
      setLoading(false);
    }
  }
  
  async function handleDeleteDocument(id: string) {
    if (isOfflineMode) {
      setMessage("Mode hors ligne: impossible de supprimer un document");
      return;
    }
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Supprimer le document en utilisant le service centralisé
      const { error } = await supabaseService.documents.delete(id);
      
      if (error) throw error;
      
      setMessage("Document supprimé avec succès!");
      
      // Recharger la liste des documents
      loadDocuments();
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
      setLoading(false);
    }
  }
  
  function handleSelectDocument(doc: any) {
    setSelectedDoc(doc.id);
    setTitle(doc.title);
    setContent(doc.content || '');
    clearMessage();
  }
  
  function clearForm() {
    setSelectedDoc(null);
    setTitle('');
    setContent('');
    clearMessage();
  }
  
  function clearMessage() {
    setMessage(null);
  }
  
  if (isLoading || loading) {
    return <div className="p-4">Chargement en cours...</div>;
  }
  
  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <p>Veuillez vous connecter pour gérer vos documents</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Gestion des documents</h2>
      
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Erreur') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulaire */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {selectedDoc ? 'Modifier le document' : 'Créer un document'}
          </h3>
          
          <form onSubmit={selectedDoc ? handleUpdateDocument : handleCreateDocument} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm mb-1">Titre</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm mb-1">Contenu</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                className="w-full px-3 py-2 border rounded"
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {selectedDoc ? 'Mettre à jour' : 'Créer'}
              </button>
              
              {selectedDoc && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Liste des documents */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Mes documents</h3>
          
          {documents.length === 0 ? (
            <p className="text-gray-500">Aucun document trouvé</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id} className="border p-3 rounded">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{doc.title}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectDocument(doc)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {doc.content || 'Pas de contenu'}
                  </p>
                </li>
              ))}
            </ul>
          )}
          
          <button
            onClick={loadDocuments}
            className="mt-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            Rafraîchir
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Note: Cet exemple utilise le service documents de l'architecture centralisée Supabase.</p>
      </div>
    </div>
  );
} 