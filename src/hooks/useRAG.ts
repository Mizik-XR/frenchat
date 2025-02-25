
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export const useRAG = () => {
  const [isIndexing, setIsIndexing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const indexDocument = async (documentId: string, content: string) => {
    setIsIndexing(true);
    try {
      const { error } = await supabase.functions.invoke('rag-indexing', {
        body: { action: 'index', documentId, content }
      });

      if (error) throw error;

      toast({
        title: "Document indexé",
        description: "Le document a été correctement indexé pour la recherche",
      });
    } catch (error) {
      console.error('Erreur lors de l\'indexation:', error);
      toast({
        title: "Erreur d'indexation",
        description: "Impossible d'indexer le document",
        variant: "destructive"
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const searchDocuments = async (query: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('rag-indexing', {
        body: { action: 'search', query }
      });

      if (error) throw error;

      setResults(data.results);
      return data.results;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible d'effectuer la recherche dans les documents",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return {
    indexDocument,
    searchDocuments,
    isIndexing,
    isSearching,
    results
  };
};
